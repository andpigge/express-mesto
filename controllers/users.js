// Нужен для создания токена
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

// Ошибки
const NotFoundError = require('../errorsHandler/NotFoundError');
const BadRequest = require('../errorsHandler/BadRequest');
const Conflict = require('../errorsHandler/Conflict');

module.exports.getUsers = (req, res, next) => {
  // Заголовки в express выставляются автоматически
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(err.message));
};

module.exports.getUserId = (req, res, next) => {
  // Вытаскиваем динамический userId
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return next(new NotFoundError('Пользователь не существует'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Запрашиваемый пользователь не найден'));
      }
      next(err.message);
    });
};

module.exports.createUser = async (req, res, next) => {
  // С помощью body-parser, легко вытаскиваем поля переданные в тело запросом POST,
  // на стороне клиента
  const body = { ...req.body };

  // Пароль хэшируется в момент сохранения в БД, в моделе, хуком.
  await User.create(body)
    .then((user) => {
      res.send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      }
      // Не хочу два раза запрос к БД делать, думаю это неправильно
      if (err.name === 'MongoError') {
        next(new Conflict('Пользователь с таким Email уже существует'));
      }
      next(err.message);
    });
};

module.exports.updateProfile = (req, res, next) => {
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
        next(new BadRequest('Переданы некорректные данные при обновлении профиля'));
      }
      if (err.name === 'CastError') {
        next(new BadRequest('Запрашиваемый пользователь не найден'));
      }
      next(err.message);
    });
};

module.exports.getProfile = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return next(new NotFoundError('Пользователь не существует, либо был удален'));
    })
    .catch((err) => next(err.message));
};

module.exports.updateProfileAvatar = (req, res, next) => {
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
        next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
      }
      next(err.message);
    });
};

// Если пользователь зашел успешно, создаю token, и сохраняю его в куки
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  // Применил собственный метод
  User.findUserByCredentials(email, password)
    .then((user) => {
      // jwt.sign - создать токен. Первый параметр id, для хэша, второй токен, третий время жизни
      const token = jwt.sign({ _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' });

      // Куки хранятся 7 дней. httpOnly не доступен из js
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true, // кука доступна только на одной хостинге
      });
      return res.send({ token: req.cookies.jwt });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      }
    });
};
