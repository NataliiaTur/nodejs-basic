import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { getEnvVar } from './utils/getEnvVar.js';
import router from './routers/index.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { UPLOAD_DIR } from './constants/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export const startServer = () => {
  const app = express();

  app.use(cors()); //cors
  app.use(
    // json парсінг
    express.json({
      type: ['application/json', 'application/vnd.api+json'],
      limit: '100kb',
    }),
  );

  app.use(
    //логування
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );
  // можливість роздавати статичні файли
  app.use('/uploads', express.static(UPLOAD_DIR));
  // для зчитування документації
  app.use('/api-docs', swaggerDocs());

  app.use(router); //Api роути

  app.use('/', (req, res) => {
    //гол сторінка
    res.json({
      message: 'Successfully added a student',
    });
  });

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
