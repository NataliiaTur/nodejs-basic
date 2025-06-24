import { SORT_ORDER } from '../constants/sortOrder.js';
import { StudentsCollection } from '../db/models/student.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllStudents = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const studentsQuery = StudentsCollection.find();

  if (filter.gender) {
    studentsQuery.where('gender').equals(filter.gender);
  }
  if (filter.maxAge) {
    (await studentsQuery.where('maxAge')).lte(filter.maxAge);
  }

  if (filter.minAge) {
    studentsQuery.where('minAge').gte(filter.minAge);
  }

  if (filter.maxAvgMark) {
    studentsQuery.where('maxAvgMark').lte(filter.maxAvgMark);
  }

  if (filter.minAvgMark) {
    studentsQuery.where('minAvgMark').gte(filter.minAvgMark);
  }

  // !==========
  // const studentsCount = await StudentsCollection.find()
  //   .merge(studentsQuery)
  //   .countDocuments();

  // const students = await studentsQuery
  //   .skip()
  //   .limit(limit)
  //   .sort({ [sortBy]: sortOrder })
  //   .exec();
  // !===============

  const [studentsCount, students] = await Promise.all([
    StudentsCollection.find().merge(studentsQuery).countDocuments(),
    StudentsCollection.find().merge(studentsQuery).countDocuments(),
  ]);

  const paginationData = calculatePaginationData(studentsCount, perPage, page);

  return {
    data: students,
    ...paginationData,
  };
};

export const getStudentByuId = async (studentId) => {
  const student = await StudentsCollection.findById(studentId);
  return student;
};

export const createStudent = async (payload) => {
  const student = await StudentsCollection.create(payload);
  return student;
};

export const deleteStudent = async (studentId) => {
  const student = await StudentsCollection.findOneAndDelete(studentId);
  return student;
};

export const updateStudent = async (studentId, payload, options = {}) => {
  const result = await StudentsCollection.findOneAndUpdate(
    { _id: studentId },
    payload,
    { new: true, includeResultMetadata: true, ...options },
  );
  if (!result || !result.value) return null;

  return {
    student: result.value,
    isNew: Boolean(result?.lastErrorObject?.upserted),
  };
};
