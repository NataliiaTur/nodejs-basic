import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { SessionsCollection } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  ONE_DAY,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendMail } from '../utils/sendMail.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

// реєстрація користувачів

export const registerUser = async (payload) => {
  // Перевірка унікальності емейла
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  // перетворимо в захешований пароль
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

// логінізація користувачів
export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  // порівнюємо хеші паролів
  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  // видаляє сесію, аби далі не було конфлікту
  await SessionsCollection.deleteOne({ userId: user._id });

  // генерація нових токенів
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // створення нової сесії з даними
  return await SessionsCollection.create({
    user: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

// Logout користувача
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

// Оновлення сесії
// Створення сесії
const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + ONE_DAY),
    refreshTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  // пошук існуючої сесії
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  // якщо її немає
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  // перевірка чи не минув термін дії
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  // якщо прострочений
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }
  // створення нової сесії
  const newSession = createSession();
  // створення нової сесії в колекції
  await SessionsCollection.createOne({
    userId: session.userId,
    ...newSession,
  });
};

// для скидання паролю
export const requestRefreshToken = async (email) => {
  // шукає чи є юзер
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  //токен скидання паролю
  const resetToken = jwt.sign(
    //сформуємо токен
    {
      sub: user._id, //ідентиф.користувача
      email, //el пошта
    },
    getEnvVar('JWT_SECRET'), //підписаний
    {
      expiresIn: '15m', // термін дії 15 хвилин
    },
  );
  // для шаблонізації
  // створюється шлях до хтмл шаблону листа
  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );
  // зчитується хтмл файл з диска(асинх). перетв в рядок
  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  // HTML-файл компілюється в шаблон-функцію за допомогою Handlebars.
  const template = handlebars.compile(templateSource);
  // підставляються дані користувача
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?
    token=${resetToken}`,
  });

  // надсилаємо ел лист користувачу із посиланням для скид.пароля з включеним
  // створеним токеном, який він може використати для встановлення нового пароля
  await sendMail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

// фінальний крок скидання пароля.
// Користувач отримав мейл із посиланням, в якому є токен.
// Перейшов по посиланню на форму - ввів  новий пароль -
// цей новий пароль разом з токен потрапляє у пейлоад
export const resetPassword = async (payload) => {
  let entries;

  // пейлоад.токен - токен из урл параметра
  // jwt.verify перевіряє чи дійсний токен(правильний, не простроч)
  // Якщо ок - розшифровує
  // ентріс - пейлоад з токена, який раніше формували тут:
  //   jwt.sign(
  //   { sub: user._id, email },
  //   getEnvVar('JWT_SECRET'),
  //   { expiresIn: '15m' }
  // )
  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  // шукаємо користувача в базі по емейл і айді, якого зчитали з токена
  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // хешуємо новий пароль. Пейлоад.пассворд - новий пароль від юзера
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  // оновлюємо користувача в базі (перезаписуємо пароль)
  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
