const path = require('path');
// Обсолютный путь, относиительно рабочей папки
const User = require(path.resolve('models/user'));

// Заголовки, коды ошибок
const { headers, 
  VALID_ERROR_CODE, 
  CAST_ERROR_CODE, 
  SERVER_ERROR_CODE 
} = require(path.resolve('utils/constaints.js'));

module.exports.getUsers = (req, res) => {
  headers.json(res);

  User.find({})
  .then(users => res.send({ data: users }))
  .catch(err => {
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' })
  });
};

module.exports.getUserId = (req, res, next) => {
  // Вытаскиваем динамический userId
  const { userId } = req.params;

  headers.json(res);

  User.findById(userId)
  .then(user => res.send({ data: user }))
  .catch(err => {
    if (err.name === 'CastError') {
      res.status(CAST_ERROR_CODE).send({ messageError: 'Запрашиваемый пользователь не найден' })
      return;
    }
    // console.log(err.name)
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' })
  });
};

module.exports.createUser = (req, res) => {
  // С помощью body-parser, легко вытаскиваем поля переданные в тело запросом POST, на стороне клиента
  const { name, about, avatar } = req.body;

  headers.json(res);

  User.create({ name, about, avatar })
  .then(user => res.send({ data: user }))
  .catch(err => {
    if (err.name === 'ValidationError') {
      res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные при создании пользователя' })
      return;
    }
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' })
  });
};

module.exports.updateProfile = (req, res) => {
  const { name, about, avatar } = req.body;
  const id = req.user._id;

  headers.json(res);

  User.findByIdAndUpdate(id, { name, about, avatar }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    upsert: false // если пользователь не найден, он будет создан
  })
  .then(user => res.send({ data: user }))
  .catch(err => {
    if (err.name === 'ValidationError') {
      res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные при обновлении профиля' })
      return;
    }
    if (err.name === 'CastError') {
      res.status(CAST_ERROR_CODE).send({ messageError: 'Запрашиваемый пользователь не найден' })
      return;
    }
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка сервера' })
  });
};

module.exports.updateProfileAvatar = (req, res) => {
  const { avatar } = req.body;
  const id = req.user._id;

  headers.json(res);

  User.findByIdAndUpdate(id, { avatar }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    upsert: false // если пользователь не найден, он будет создан
  })
  .then(user => res.send({ data: user }))
  .catch(err => {
    if (err.name === 'ValidationError') {
      res.status(VALID_ERROR_CODE).send({ messageError: 'Переданы некорректные данные при обновлении аватара' })
      return;
    }
    res.status(SERVER_ERROR_CODE).send({ messageError: 'Ошибка' })
  });
}
