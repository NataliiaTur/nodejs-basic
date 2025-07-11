import { SORT_ORDER } from '../constants/sortOrder.js';

const parseSortOrder = (sortOrder) => {
  const isKnowOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);

  if (isKnowOrder) {
    return sortOrder;
  }
  return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  const keyOfStudent = [
    '_id',
    'name',
    'age',
    'gender',
    'avgMark',
    'onDuty',
    'createdAt',
    'updatedAt',
  ];
  if (keyOfStudent.includes(sortBy)) {
    return sortBy;
  }
  return '_id';
};

export const parsedSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
