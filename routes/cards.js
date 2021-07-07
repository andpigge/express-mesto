const path = require('path');
// Подключаем специальный метод Router для работы с маршрутами в express, на стороне сервера
const router = require('express').Router();

// Подключаю контролеры
const { getCards, createCard, deleteCardId, addLikeCard, removeLikeCard } = require(path.resolve('controllers/cards'));

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCardId);

// Другие роуты.
// Поставить лайк карточке. put частичное обновление
// http://localhost:3000/cards/60e59c7cc4b37e5e9847dd8a/likes
router.put('/:cardId/likes', addLikeCard);
// Убрать лайк с карточки
router.delete('/:cardId/likes', removeLikeCard);

module.exports = router;
