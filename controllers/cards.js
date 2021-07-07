const path = require('path');

// Модель
const Card = require(path.resolve('models/card'));

// Заголовки, коды ошибок
const { headers, 
  VALID_ERROR_CODE, 
  CAST_ERROR_CODE, 
  SERVER_ERROR_CODE 
} = require(path.resolve('utils/constaints.js'));

const getCards = (req, res) => {
  headers.json(res);

  // Вместо id всавляем модель users, с помощью метода populate, который принимает ссылку на модель
  Card.find({})
  .populate('users')
  .then(cards => res.send({ data: cards }))
  .catch(err => {
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' })
  });
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  const id = req.user._id;

  headers.json(res);

  // Задаем в третье поле обьекта id
  Card.create({ name, link, owner: id })
  .then(card => res.send({ data: card }))
  .catch(err => {
    if (err.name === 'ValidationError') {
      res.status(VALID_ERROR_CODE).send({ messageError: ' Переданы некорректные данные при создании карточки' })
      return;
    }
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' })
  });
};

const deleteCardId = (req, res) => {
  const { cardId } = req.params;

  headers.json(res);

  // Проверяю на существование карточки
  Card.findById(cardId)
  .then(card => {
    // Если карточка есть, ее нужно удалить
    card ?
      Card.findByIdAndRemove(cardId)
      .then(card => res.send({ message: 'Карточка успешна удалена' }))
      .catch(err => {
        res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' })
      })
    :
    // Если нету, вывести сообщение что карточка была удалена ранее, нечего удалять
    res.send({ message: 'Такая карточка была удалена ранее' })
  })
  .catch(err => {
    res.status(CAST_ERROR_CODE).send({ messageError: 'Карточка с указанным _id не найдена' })
  });
};

const addLikeCard = (req, res) => {
  // id карточки
  const { cardId } = req.params;

  // id пользователя, захардкоден
  const { _id } = req.user;

  headers.json(res);

  Card.findByIdAndUpdate(
    cardId,
    // Оператор $addToSet добавит элемент только в том случае, если его нет
    { $addToSet: { likes: _id } }, // добавить _id в массив, если его там нет
    { new: true } // обработчик then получит на вход обновлённую запись
  )
  .then(card => res.send({ message: 'Лайк успешно поставлен' }))
  .catch(err => {
    if (err.name === 'ValidationError') {
      res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные для постановки лайка.' })
      return;
    }
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' });
  })
};

const removeLikeCard = (req, res) => {
  // id карточки
  const { cardId } = req.params;

  // id пользователя, захардкоден
  const { _id } = req.user;

  headers.json(res);

  Card.findByIdAndUpdate(
    cardId,
    // $pull убирает элемент если он есть
    { $pull: { likes: _id } }, // убрать _id из массива
    { new: true } // обработчик then получит на вход обновлённую запись
  )
  .then(card => res.send({ message: 'Лайк успешно удален' }))
  .catch(err => {
    if (err.name === 'ValidationError') {
      res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные для снятия лайка.' })
      return;
    }
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' });
  })
};

module.exports = {
  getCards,
  createCard,
  deleteCardId,
  addLikeCard,
  removeLikeCard
};
