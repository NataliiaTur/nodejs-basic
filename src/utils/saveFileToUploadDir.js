import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMP_UPLOAD_DIR } from '../constants/index.js';
import { UPLOAD_DIR } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';

export const saveFileToUploadDir = async (file) => {
  await fs.rename(
    path.join(TEMP_UPLOAD_DIR, file.filename), //звідки(temp папка)
    path.join(UPLOAD_DIR, file.filename), // куди (uploads папка)
  );
  return `${getEnvVar('APP_DOMAIN')}/uploads/${file.filename}`;
};
