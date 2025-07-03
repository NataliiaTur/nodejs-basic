import createHttpError from 'http-errors';
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentByuId,
  updateStudent,
} from '../services/students.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parsedSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// Тепер, користуючись цим парсером, ми можемо отримати
// значення page та perPage і передати їх далі до сервісу:
export const getStudentsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parsedSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const students = await getAllStudents({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.json({
    status: 200,
    message: 'Successfully found students!',
    data: students,
  });
};

export const getStudentByIdController = async (req, res, next) => {
  const { studentId } = req.params;
  const student = await getStudentByuId(studentId);

  if (!student) {
    next(new Error('Student not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully found student with id ${studentId}!`,
    data: student,
  });
};

export const createStudentController = async (req, res) => {
  const student = await createStudent(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a student',
    data: student,
  });
};

export const deleteStudentController = async (req, res, next) => {
  const { studentId } = req.params;
  const student = await deleteStudent(studentId);

  if (!student) {
    next(createHttpError(404, 'Student not found'));
  }

  res.status(204).send();
};

export const upsertStudentController = async (req, res, next) => {
  const { studentId } = req.params;
  const result = await updateStudent(studentId, req.body, { upsert: true });

  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  const status = result.isNew ? 201 : 200;
  res.status({
    status,
    message: 'Successfully upserted',
    data: result.student,
  });
};

export const patchStudentController = async (req, res, next) => {
  const { studentId } = req.params; // ID студента з URL
  // отрим. обьєкт зображ в тілі контролеру
  const photo = req.file; // Файл фото (якщо є)
  let photoUrl; // Змінна для URL фото

  // Якщо фото надіслано → викликаємо saveFileToUploadDir()
  // Файл переміщується з temp/ в uploads/
  // Отримуємо URL: "https://myapp.com/uploads/1672531200000_photo.jpg"
  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  // оновлення студента в базі даних
  const result = await updateStudent(studentId, {
    ...req.body, // розпаковуємо Всі поля з форми (name, email тощо)
    photo: photoUrl, // URL фото (або undefined)
  });
  // перевірка результату
  if (!result) {
    next(createHttpError(404, 'Student not found'));
  }
  // повернення успішної відповіді
  res.json({
    status: 200,
    message: 'Successfully patched a student',
    data: result.student,
  });
};
