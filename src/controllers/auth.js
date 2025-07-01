import { ONE_DAY } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
  requestRefreshToken,
  resetPassword,
} from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged user',
    data: {
      accessToken: session.accessToken,
    },
  });
};

// Logout користувача
export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookies('sessionId');
  res.clearCookies('refreshToken');

  res.status(204).send();
};

// для оновлення сесій
const setupSession = (res, session) => {
  // Встановлення куків через метод res.cookies
  res.cookies('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookies('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const refreshUserSessionController = async (req, res) => {
  // викликає функцію, яка виконує процес оновленя сесії та поверт {нової сесії}
  const session = await refreshUsersSession({
    // передає об'єкт із цими даними отриман із куків запиту
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  // оновлення сесії
  setupSession();

  res.json({
    status: 200,
    message: 'Successfully refreshed a session',
    data: {
      accessToken: session.accessToken,
    },
  });
};

// Обробка запиту на зміну пароля
export const requestRefreshTokenController = async (req, res) => {
  await requestRefreshToken(req.body.email);
  res.status(200).json({
    status: 200,
    message: 'Reset password email was successfully sent!',
    data: {},
  });
};

// Скидання паролю
export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};
