const mongoose = require('mongoose');

// Хэшируем пароль
const bcrypt = require('bcryptjs');

// Простой пакет для валидации данных
const validator = require('validator');

// Ошибки
const UnauthorizedError = require('../errorsHandler/UnauthorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(url) {
        return /https?:\/\/[\w-]+.[a-z.]+[\/*[a-z#]+]?/gim.test(url);
      },
      message: 'Неккоректный url адрес',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Когда обычной валидации не достаточно, поле validate
    validate: {
      // Специальная функция валидации, возвращает булев тип.
      // Первым параметром функция принимает поле для валидации.
      validator(email) {
        return validator.isEmail(email);
      },
      // Иначе сработает сообщение
      message: 'Неккоректный email',
    },
  },
  password: {
    type: String,
    required: true,
    // Этот параметр не нужен, валидация проверит на минимальное колличесво символов
    minlength: 8,
    // select работает при поиске, при create не работает. Оно не возвращает это поле в ответе
    select: false,
    validate: {
      validator(password) {
        return validator.isStrongPassword(password,
          {
            // Не люблю пароли, где требуют писать заглавную букву и доп символы
            minUppercase: false,
            minSymbols: false,
          });
      },
      message: 'Ненадежный пароль',
    },
  },
});

// Функция findUserByCredentials не должна быть стрелочной. Забываю
// Собственный метод. Поиск пользователя
userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password, next) {
  // Здесь нужен пароль
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new UnauthorizedError('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

// Хук сработает перед тем как сохранить данные в бд,
// для коректного валидирования пароля на уровне схемы.
// Срабатывает при создании и обновлении схемы
userSchema.pre('save', function fun(next) {
  if (!this.isModified('password')) return next();

  return bcrypt.hash(this.password, 10)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch((err) => next(err));
});

module.exports = mongoose.model('user', userSchema);
