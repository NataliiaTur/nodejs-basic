import Joi from 'joi';

// схема для реєстрації
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(33).required().messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email should be a string',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required(),
});

// схема для логінізації
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// схема для запита на скидання паролю
export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

// схема на скидання паролю
export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});
