// Модель
const Card = require('../models/card');

const getCards = (req, res) => {
  // Заголовки в express выставляются автоматически

  // Вместо id вставляю модель users, с помощью метода populate, который принимает ссылку на модель
  Card.find({})
    .populate('users')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// ValidationError проверяется там где есть тело запроса body
const createCard = (req, res) => {
  const { name, link } = req.body;
  // const data = { ...req.body };

  const id = req.user._id;

  // Третим параметром owner с id
  Card.create({ name, link, owner: id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
      }
      return res.status(500).send({ message: err.message });
    });
};

const deleteCardId = (req, res) => {
  const { cardId } = req.params;
  const id = req.user._id;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не существует, либо была удалена' });
      }

      // Если это карточка не пользователя, выведем ему сообщение
      if (card.owner !== id) {
        return res.status(403).send({ message: 'Карточка не существует, либо была удалена' });
      }

      Card.findByIdAndRemove(cardId)
        .then((card) => res.send({ data: card }))
        .catch((err) => {
          if (err.name === 'CastError') {
            return res.status(400).send({ message: 'Карточка с указанным _id не найдена' });
          }
          return res.status(500).send({ message: err.message });
        });
    });
};

const addLikeCard = (req, res) => {
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
        return res.send({ data: card });
      }
      return res.status(404).send({ message: 'Карточка не существует, либо была удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      }
      return res.status(500).send({ message: err.message });
    });
};

const removeLikeCard = (req, res) => {
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
        return res.send({ data: card });
      }
      return res.status(404).send({ message: 'Карточка не существует, либо была удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные для снятия лайка.' });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardId,
  addLikeCard,
  removeLikeCard,
};
