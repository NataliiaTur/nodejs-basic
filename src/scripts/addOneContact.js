import createFakeContact from '../utils/createFakeContact.js';
import { readContacts } from '../utils/readContacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const addOneContact = async () => {
  try {
    const data = await readContacts();
    const contacts = data ? data : [];

    const newContact = createFakeContact();
    contacts.push(newContact);

    await writeContacts(contacts);
    console.log(`Контакт ${newContact.name} успішно додано`);
  } catch (error) {
    console.error('Нажаль, не можливо додати контакт', error.message);
  }
};

addOneContact();
