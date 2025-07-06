import fs from 'node:fs';
import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import { SWAGGER_PATH } from '../constants/index.js';

//функція додає до твого API інтерфейс документації Swagger.
// Swagger — це інструмент для документування REST API. Він дозволяє:
// описати всі ендпоінти твого бекенду в форматі .json або .yaml,
// автоматично згенерувати зручну сторінку з кнопками "GET", "POST" тощо, прямо у браузері.

export const swaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH).toString());
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
  } catch (err) {
    return (req, res, next) =>
      next(createHttpError(500, "Can't load swagger docs"));
  }
};
//1 Тут зчитується .json-файл із документацією API, шлях до нього
// зберігається в змінній SWAGGER_PATH

// 2 swaggerUI.serve і swaggerUI.setup(...) — це два middleware-функціонали, які:
// serve — віддає файли інтерфейсу Swagger UI (HTML, CSS, JS),
// setup — налаштовує Swagger UI із твоїм .json-документом

// 3 Якщо файл не вдалося прочитати (наприклад, він відсутній
// або зламаний) — функція повертає middleware, який кине помилку 500 на сервері.
