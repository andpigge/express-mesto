// Модель
const Card = require('../models/card');

// Коды ошибок
const {
  VALID_ERROR_CODE,
  CAST_ERROR_CODE,
  SERVER_ERROR_CODE,
} = require('../utils/constaints');

const getCards = (req, res) => {
  // Заголовки в express выставляются автоматически

  // Вместо id вставляю модель users, с помощью метода populate, который принимает ссылку на модель
  Card.find({})
    .populate('users')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(SERVER_ERROR_CODE).send({ messageError: err.message }));
};

// ValidationError проверяется там где есть тело запроса body
const createCard = (req, res) => {
  const { name, link } = req.body;

  const id = req.user._id;

  // Задаем в третье поле обьекта id
  Card.create({ name, link, owner: id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные при создании карточки' });
      }
      return res.status(SERVER_ERROR_CODE).send({ messageError: err.message });
    });
};

// Намудрил я здесь раньше
// CastError проверяется всегда где есть динамические данные в url запросе :id
// Должна быть проверка на обработку 404 при динамические данных, данные могут прийти некорректные
const deleteCardId = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (card) {
        return res.send({ message: 'Карточка успешна удалена' });
      }
      return res.status(CAST_ERROR_CODE).send({ message: 'Карточка не существует, либо была удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(CAST_ERROR_CODE).send({ messageError: 'Карточка с указанным _id не найдена' });
      }
      return res.status(SERVER_ERROR_CODE).send({ messageError: err.message });
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
        return res.send({ message: 'Лайк успешно поставлен' });
      }
      return res.status(CAST_ERROR_CODE).send({ message: 'Карточка не существует, либо была удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные для постановки лайка.' });
      }
      return res.status(SERVER_ERROR_CODE).send({ messageError: err.message });
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
        return res.send({ message: 'Лайк успешно удален' });
      }
      return res.status(CAST_ERROR_CODE).send({ message: 'Карточка не существует, либо была удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные для снятия лайка.' });
      }
      return res.status(SERVER_ERROR_CODE).send({ messageError: err.message });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardId,
  addLikeCard,
  removeLikeCard,
};
