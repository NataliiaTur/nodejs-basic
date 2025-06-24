import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';

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
  // якщо хх немає
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
