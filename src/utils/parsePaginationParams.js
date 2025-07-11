// функція для перетворення рядкових значень в числа

export const parseNumber = (number, defaultValue) => {
  const isString = typeof number === 'string';
  if (!isString) return defaultValue;

  const parsedNumber = parseInt(number);
  if (Number.isNaN(parsedNumber)) {
    return defaultValue;
  }
  return parsedNumber;
};

// Функція parsePaginationParams використовує parseNumber для обробки
// пагінаційних параметрів, які зазвичай надходять у запитах до бекенду.
//  Ці параметри, page і perPage, містяться в об'єкті query і можуть бути
//  неправильно вказані або взагалі пропущені.

export const parsePaginationParams = (query) => {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 10);

  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
};
