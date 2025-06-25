import Joi from "joi";

export const registerSchema = Joi.object({
  userName: Joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "Імʼя не може бути порожнім або з одних пробілів",
    "string.userName": "Неккоректне ім'я користувача",
    "any.required": "ім'я є обовязковим",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Некоректна пошта",
    "any.required": "Пошта обовьязкова",
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"))
    .required()
    .messages({
      "string.min": "Пароль дуже короткий",
      "string.max": "Пароль дуже довгий",
      "string.pattern.base": "Пароль має недопустимі символи",
      "any.required": "Пароль обовязковий",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Паролі не співпадають",
    "any.required": "Підтвердження пароля обов'язкове",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().min(3).max(30).email().required().messages({
    "string.email": "Некоректна пошта",
    "any.required": "Пошта обовьязкова",
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"))
    .required()
    .messages({
      "string.min": "Пароль дуже короткий",
      "string.max": "Пароль дуже довгий",
      "string.pattern.base": "Пароль має недопустимі символи",
      "any.required": "Пароль обовязковий",
    }),
});
