// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

// Валидация тела запроса от клиента
const { celebrate, Joi } = require('celebrate');
// Извиняюсь, забыл его раскомментировать когда проверял что все работает. Записал его в app.js,
// для общего маршрута cards

// Подключаю свою функцию валидации url адресса для celebrate
const validUrl = require('../utils/validUrl');

// Подключаю контролеры
const {
  getCards, createCard, deleteCardId, addLikeCard, removeLikeCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validUrl),
  }),
}), createCard);

// Валидировать id нужно по шестнадцатеричной системе счисления, hex формат. Ровно 24 символа
// celebrate должен заворачивать такие запросы до передачи их контроллеру
router.delete('/:cardId', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), deleteCardId);

// Другие роуты.
// Поставить лайк карточке. put частичное обновление
// http://localhost:3000/cards/60e59c7cc4b37e5e9847dd8a/likes
router.put('/:cardId/likes', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), addLikeCard);

// Убрать лайк с карточки
router.delete('/:cardId/likes', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), removeLikeCard);

module.exports = router;
