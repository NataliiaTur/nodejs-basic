import { ONE_DAY } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
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
  await loginUser(req.body);
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
