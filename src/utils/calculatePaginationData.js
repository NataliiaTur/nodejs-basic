// Функція calculatePaginationData повертає об'єкт з повною
// інформацією про пагінацію. Всі підрахунки

export const calculatePaginationData = (count, perPage, page) => {
  const totalPage = Math.ceil(count / perPage);
  const hasNextPage = Boolean(totalPage - page);
  const hasPreviousPage = page !== 1;

  return {
    page,
    perPage,
    totalPage,
    totalItem: count,
    hasNextPage,
    hasPreviousPage,
  };
};
