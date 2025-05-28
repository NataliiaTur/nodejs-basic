import { readContacts } from '../utils/readContacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const removeLastContact = async () => {
  try {
    const contacts = await readContacts();

    if (contacts.length === 0) {
      return [];
    } else {
      contacts.pop();
      await writeContacts(contacts);
      console.log('Контакт видалено успішно!');
    }
  } catch (error) {
    console.error('Нажаль, останній контакт не видалено', error.message);
  }
};

removeLastContact();
