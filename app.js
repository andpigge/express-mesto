// dotenv позволяет писать конструкции
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// Защита заголовков
const helmet = require('helmet');

// Обработка ошибок
const { errors } = require('celebrate');

// Позволяет без капчи зашитится от автоматических входов
const rateLimit = require('express-rate-limit');

// Позволяет удобно вытаскивать куки
const cookieParser = require('cookie-parser');

// Ошибки
const NotFoundError = require('./errorsHandler/NotFoundError');

// Мидлвэа, центральный обработчик ошибок
const errHandler = require('./middlewares/errHandler');

// Маршруты
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const routerAuth = require('./routes/auth');

// Мидлвэа для защиты маршрутов
const { auth } = require('./middlewares/auth');

const { PORT = 3000 } = process.env;

const app = express();

// Подключение к серверу MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 минут
  max: 100, // можно совершить максимум 100 запросов с одного IP
});
app.use(limiter);

// Вроде как все по умолчанию выставленно, не очень разбираюсь в заголовках
app.use(helmet());

// Подключение встроенного парсера в express, чтобы вытаскивать из тела данные
// Вот так: const { name, about, avatar } = req.body;
app.use(express.json());

// Подключаем cookieParser как мидлвэа
app.use(cookieParser());

// Экспортирую маршруты
app.use('/users', auth, routerUsers);
app.use('/cards', /* auth, */ routerCards);
app.use('/', routerAuth);
// Если нет корректного маршрута
app.use((req, res, next) => next(new NotFoundError('Запрашиваемый ресурс не найден')));

// Обработка ошибок celebrate
app.use(errors());

// Подключаю ко всем маршрутам, центральный обработчик ошибок
app.use(errHandler);

// Ругается eslint на консоль, не знаю почему, выдает ошибку warning.
app.listen(PORT/* , () => console.log(`Приложение запущенно на порту ${PORT}`) */);
