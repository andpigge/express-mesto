// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

// Валидация тела запроса от клиента
const { celebrate, Joi } = require('celebrate');

// Мидлвэа для защиты маршрутов
const { auth } = require('../middlewares/auth');

// Подключаем имеющие контроллеры для создания маршрутов
const {
  getUsers, getUserId, createUser, updateProfile, getProfile, updateProfileAvatar, login,
} = require('../controllers/users');

router.get('/me', auth, getProfile);

// Получить всех пользователей
router.get('/', auth, getUsers);
// Получить пользователя по id
router.get('/:userId', auth, getUserId);
// Создать пользователя
// router.post('/', createUser);

// Другие роуты.
// Обновляет профиль
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string(),
  }),
}), auth, updateProfile);
// Обновляет аватар, частично обновляем профиль
router.put('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required(),
  }),
}), auth, updateProfileAvatar);

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
