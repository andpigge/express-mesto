// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

// Валидация тела запроса от клиента
const { celebrate, Joi } = require('celebrate');

// Подключаю контролеры
const {
  getCards, createCard, deleteCardId, addLikeCard, removeLikeCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required(),
  }),
}), createCard);
router.delete('/:cardId', deleteCardId);

// Другие роуты.
// Поставить лайк карточке. put частичное обновление
// http://localhost:3000/cards/60e59c7cc4b37e5e9847dd8a/likes
router.put('/:cardId/likes', addLikeCard);
// Убрать лайк с карточки
router.delete('/:cardId/likes', removeLikeCard);

module.exports = router;
