import path from 'node:path';
import { readFile } from 'fs/promises';
import { OAuth2Client } from 'google-auth-library';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

const PATH_JSON = path.join(process.cwd(), 'google-oauth.json');

const oauthConfig = JSON.parse(await readFile(PATH_JSON));

// записуємо новий екземпляр класу OAuth2Client, використовуючи
// дані з імпортованого конфігураційного файлу. обьекь ініціаліз.параметрами:
const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_AUTH_CLIENT_ID'), //Ід клієнта, отриманий зі змінних оточення.
  clientSecret: getEnvVar('GOOGLE_AUTH_CLIENT_SECRET'), //секрет зі змін оточ
  redirectUri: oauthConfig.web.redirect_uris[0], //куди перенаправить після аутентиф
});

//Експортуємо фукцію generateAuthUrl, в якій викликається метод
// generateAuthUrl об'єкта googleOAuthClient. Цей метод генерує URL
// для аутентифікації користувача за допомогою Google OAuth 2.0.

export const generateAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    // Параметр scope вказує, які права доступу запитуються.
    scope: [
      'https://www.googleapis.com/auth/userinfo.email', //Дозвіл на доступ до електронної пошти користувача
      'https://www.googleapis.com/auth/userinfo.profile', //Дозвіл на доступ до профілю користувача.
    ],
  });

//логіка валідації коду, який надходить від користувача (код авторизації від гугл)
export const validateCode = async (code) => {
  const response = await googleOAuthClient.getToken(code);
  //в полі респонс.токен.айдітокен буде лежати jwt який ми можемо розшифрувати за
  // допомогою бібліотеки джейсонвебтокен
  if (!response.tokens.id_token) throw createHttpError(401, 'Unauthorized');

  //   за допомогою цього методу верифікуємо отриманий jwt за допомогою гугл оАус клиента
  //   підтверджує справжність токена і отримує дані користувача
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: response.tokens.id_token,
  });
  return ticket;
};
// експортує функцію для отримання повного імені з пейлоад Токена гугл
export const getFullNameFromGoogleTokenPayload = (payload) => {
  // ініціалізує значення за замовчуванням
  let fullName = 'Guest';
  // якщо є ім'я та прізвище, то обєднує іх через пробіл
  if (payload.given_name && payload.family_name) {
    fullName = `${payload.given_name} ${payload.family_name}`;
    // якщо тільки ім'я, то використ ім'я
  } else if (payload.given_name) {
    fullName = payload.given_name;
  }
  //   повертає сформоване повне ім'я або guest
  return fullName;
};
