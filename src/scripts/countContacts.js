import { readContacts } from '../utils/readContacts.js';

export const countContacts = async () => {
  try {
    const data = await readContacts();
    const amountContacts = data.length;
    return amountContacts;
  } catch (error) {
    console.error('Нажаль, не можемо порахувати', error.message);
  }
};

console.log(await countContacts());
