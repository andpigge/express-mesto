// Нужен для создания токена
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res) => {
  // Заголовки в express выставляются автоматически
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.getUserId = (req, res) => {
  // Вытаскиваем динамический userId
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return res.status(404).send({ message: 'Пользователь не существует' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports.createUser = (req, res) => {
  // С помощью body-parser, легко вытаскиваем поля переданные в тело запросом POST,
  // на стороне клиента
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  // const body = { ...req.body };

  // Пароль хэшируется в момент сохранения в БД, в моделе, хуком.
  User.create({
    name,
    about,
    avatar,
    email,
    password,
  })
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about, avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { name, about, avatar }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    // upsert: false // если пользователь не найден, он будет создан
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports.getProfile = (req, res) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return res.status(404).send({ message: 'Пользователь не существует, либо был удален' });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
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
        return res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }
      return res.status(500).send({ message: err.message });
    });
};

// Если пользователь зашел успешно, создаю token, и сохраняю его в куки
module.exports.login = (req, res) => {
  const { email, password } = req.body;

  // Применил собственный метод
  User.findUserByCredentials(email, password)
    .then((user) => {
      // jwt.sign - создать токен. Первый параметр id, для хэша, второй токен, третий время жизни
      const token = jwt.sign({ _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' });

      // Куки хранятся 7 дней. httpOnly не доступен из js
      res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
      return res.send({ token: req.cookies.jwt });
    })
    .catch((err) => res.status(401).send({ message: err.message }));
};
