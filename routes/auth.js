// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

// Валидация тела запроса от клиента
const { celebrate, Joi } = require('celebrate');

// Подключаем имеющие контроллеры для создания маршрутов
const {
  createUser, login,
} = require('../controllers/users');

// Маршруты регистрация и аутентификации
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

module.exports = router;
