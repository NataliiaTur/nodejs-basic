// import fs from 'fs/promises';
// import { PATH_DB } from '../constants/contacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const removeAllContacts = async () => {
  try {
    await writeContacts([]);
    console.log('Всі контакти видалено!');
  } catch (error) {
    console.error('На жаль, не вдалось видалити контакти', error.message);
  }
};
removeAllContacts();
