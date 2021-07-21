// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

// Валидация тела запроса от клиента
const { celebrate, Joi } = require('celebrate');

// Подключаю свою функцию валидации url адресса для celebrate
const validUrl = require('../utils/validUrl');

// Подключаем имеющие контроллеры для создания маршрутов
const {
  getUsers, getUserId, updateProfile, getProfile, updateProfileAvatar,
} = require('../controllers/users');

router.get('/me', getProfile);

// Получить всех пользователей
router.get('/', getUsers);

// Получить пользователя по id
// Валидировать id нужно по шестнадцатеричной системе счисления, hex формат. Ровно 24 символа
// celebrate должен заворачивать такие запросы до передачи их контроллеру
router.get('/:userId', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), getUserId);

// Другие роуты.
// Обновляет профиль
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().custom(validUrl),
  }),
}), updateProfile);
// Обновляет аватар, частично обновляем профиль
router.put('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validUrl),
  }),
}), updateProfileAvatar);

module.exports = router;
