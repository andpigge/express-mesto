// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

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
router.patch('/me', auth, updateProfile);
// Обновляет аватар, частично обновляем профиль
router.put('/me/avatar', auth, updateProfileAvatar);

// Маршруты регистрация и аутентификации
router.post('/signin', login);
router.post('/signup', createUser);

module.exports = router;
