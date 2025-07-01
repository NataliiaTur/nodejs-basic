import path from 'node:path';

export const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const ONE_DAY = 24 * 60 * 60 * 1000;

// МідлврАвториз.
//  Константи з ролями
export const ROLES = {
  TEACHER: 'teacher',
  PARENT: 'parent',
};

// для функціоналу надсилання листів
export const SMTP = {
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASSWORD: 'SMTP_PASSWORD',
  SMTP_FROM: 'SMTP_FROM',
};

// для шаблонізації
// створюємо абсолютний шлях до папки з шаблонами, які
// використ.для формув. хтмл-листів
export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');
// поверт поточну директ, з якої був запущ.процес.
// об'єднує шляхи
