const path = require('path');
// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

// Подключаем имеющие контроллеры для создания маршрутов
const { getUsers, getUserId, createUser, updateProfile, updateProfileAvatar } = require(path.resolve('controllers/users'));

// Получить всех пользователей
router.get('/', getUsers);
// Получить пользователя по id
router.get('/:userId', getUserId);
// Создать пользователя
router.post('/', createUser);

// Другие роуты.
// Обновляет профиль
router.patch('/me', updateProfile);
// Обновляет аватар, частично обновляем профиль
router.put('/me/avatar', updateProfileAvatar);

module.exports = router;
