const User = require('../models/user');

// Коды ошибок
const {
  VALID_ERROR_CODE,
  CAST_ERROR_CODE,
  SERVER_ERROR_CODE,
} = require('../utils/constaints');

module.exports.getUsers = (req, res) => {
  // Заголовки в express выставляются автоматически
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(SERVER_ERROR_CODE).send({ message: err.message }));
};

module.exports.getUserId = (req, res) => {
  // Вытаскиваем динамический userId
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return res.status(CAST_ERROR_CODE).send({ message: 'Пользователь не существует' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(CAST_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: err.message });
    });
};

module.exports.createUser = (req, res) => {
  // С помощью body-parser, легко вытаскиваем поля переданные в тело запросом POST,
  // на стороне клиента
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(VALID_ERROR_CODE).send({ message: 'Переданы некорректные данные при создании пользователя' });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: err.message });
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about, avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { name, about, avatar }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    // Просто для себя писал, чтобы не забыть в будущем что такой параметр существует
    // upsert: false // если пользователь не найден, он будет создан
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(VALID_ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      }
      if (err.name === 'CastError') {
        return res.status(CAST_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: err.message });
    });
};

module.exports.updateProfileAvatar = (req, res) => {
  const { avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { avatar }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    // upsert: false // если пользователь не найден, он будет создан
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(VALID_ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: err.message });
    });
};
