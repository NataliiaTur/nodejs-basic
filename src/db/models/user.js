import { model, Schema } from 'mongoose';
import { ROLES } from '../../constants/index.js';

// користувач окрема сутність. для нього схема

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // МідлврАвториз.Можливість мати роль вчителя/батька. Дефолтн - батько
    role: {
      type: String,
      enum: [ROLES.TEACHER, ROLES.PARENT],
      default: ROLES.PARENT,
    },
  },

  { timestamps: true, versionKey: false },
);

// ✨ Автоматично ховаємо пароль у всіх відповідях
usersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersCollection = model('users', usersSchema);
