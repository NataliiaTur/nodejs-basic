import nodemailer from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';
import { SMTP } from '../constants/index.js';

// Це модуль, який дозволяє надсилати листи електронною
// поштою через SMTP-сервер, використовуючи бібліотеку nodemailer.

// створює підключення до смтп сервера
const transporter = nodemailer.createTransport({
  host: getEnvVar(SMTP.SMTP_HOST), //наприклад, smtp.gmail.com,
  port: Number(getEnvVar(SMTP.SMTP_PORT)), // звичайно 465 або 587
  secure: false,
  auth: {
    user: getEnvVar(SMTP.SMTP_USER), // логін
    pass: getEnvVar(SMTP.SMTP_PASSWORD), // пароль або токен
  },
});
// приймає обьект options, що описує лист
export const sendMail = async (options) => {
  // передає в транспортер для надсилання
  return await transporter.sendMail(options);
};

// Уся логіка виглядає так:
// Файл читає SMTP-налаштування з .env.
// Створює з'єднання з поштовим сервером.
// Експортує функцію sendMail, яка дозволяє відправити листа, коли її викличеш.
(async () => {
  try {
    const info = await sendMail({
      from: getEnvVar(SMTP.SMTP_FROM), // Від кого лист (адреса має бути валідною)
      to: 'natalim@ukr.net', // Куди відправляємо (вкажи свій емейл)
      subject: 'Test email from Nodemailer',
      text: 'This is a test email sent from nodemailer',
    });
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
})();
