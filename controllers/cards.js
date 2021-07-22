// Модель
const Card = require('../models/card');

// Ошибки
const NotFoundError = require('../errorsHandler/NotFoundError');
const BadRequest = require('../errorsHandler/BadRequest');
const Forbidden = require('../errorsHandler/Forbidden');

const getCards = (req, res, next) => {
  // Заголовки в express выставляются автоматически

  // Вместо id вставляю модель users, с помощью метода populate, который принимает ссылку на модель
  Card.find({})
    .populate('users')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err.message));
};

// ValidationError проверяется там где есть тело запроса body
const createCard = (req, res, next) => {
  const { name, link } = req.body;

  const id = req.user._id;

  // Третим параметром owner с id
  Card.create({ name, link, owner: id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании карточки'));
      }
      next(err.message);
    });
};

// Не получилось использовать asunc await, использую Callback Hell
const deleteCardId = (req, res, next) => {
  const { cardId } = req.params;
  const id = req.user._id;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка не существует, либо была удалена'));
      }

      // Если это карточка пользователя, удалим ее
      if (card.owner._id.toString() === id) {
        Card.findByIdAndRemove(cardId)
          .then((cardRemove) => res.send({ data: cardRemove }))
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequest('Карточка с указанным _id не найдена'));
            }
            next(err.message);
          });
      } else {
        // Если это карточка не пользователя, выведем ему сообщение
        next(new Forbidden('Нельзя удалить карточку другого пользователя'));
      }
    });
};

const addLikeCard = (req, res, next) => {
  // id карточки
  const { cardId } = req.params;

  // id пользователя, захардкоден
  const { _id } = req.user;

  Card.findByIdAndUpdate(
    cardId,
    // Оператор $addToSet добавит элемент только в том случае, если его нет
    { $addToSet: { likes: _id } }, // добавить _id в массив, если его там нет
    { new: true }, // обработчик then получит на вход обновлённую запись
  )
    .then((card) => {
      if (card) {
        res.send({ data: card });
      }
      next(new NotFoundError('Карточка не существует, либо была удалена'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для постановки лайка'));
      }
      next(err.message);
    });
};

const removeLikeCard = (req, res, next) => {
  // id карточки
  const { cardId } = req.params;

  // id пользователя, захардкоден
  const { _id } = req.user;

  Card.findByIdAndUpdate(
    cardId,
    // $pull убирает элемент если он есть
    { $pull: { likes: _id } }, // убрать _id из массива
    { new: true }, // обработчик then получит на вход обновлённую запись
  )
    .then((card) => {
      if (card) {
        res.send({ data: card });
      }
      next(new NotFoundError('Карточка не существует, либо была удалена'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для снятия лайка'));
      }
      next(err.message);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardId,
  addLikeCard,
  removeLikeCard,
};
