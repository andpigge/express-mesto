// dotenv позволяет писать конструкции
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
// npm i body-parser
// const bodyParser = require('body-parser');

// Позволяет удобно вытаскивать куки
const cookieParser = require('cookie-parser');

const routerUsers = require('./routes/users');

const routerCards = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

// Мидлвэа для защиты маршрутов
const { auth } = require('./middlewares/auth');

// Мидлвэа центральный обрабртчик ошибок
const error = require('./middlewares/errors');

// Запусть монго сервисы mongod
// Сгенерировать свой собственный jwt
/* const crypto = require('crypto'); // экспортируем crypto

const randomString = crypto
  .randomBytes(16) // сгенерируем случайную последовательность 16 байт (128 бит)
  .toString('hex'); // приведём её к строке

console.log(randomString); // 5cdd183194489560b0e6bfaf8a81541e */

// Подключение к серверу MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Настройки body-parser. Используем с помощью use как middleware
// Существует уже в новой версии express встроенный парсер
// Подключение
app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// Подключаем cookieParser как мидлвэа
app.use(cookieParser());

// Временное решение. Какой-то непонятный мидлвэа
// app.use((req, res, next) => {
//   // Пока не понятно как занесли в обьект запроса, обьект user
//   req.user = {
//     _id: '60e431741ba49c36089e2716',
//   };

//   next();
// });

// Экспортирую маршруты
app.use('/users', routerUsers);
// Третий параметр, функция предварительной обработки, мидлвэа
app.use('/cards', auth, routerCards);
// Если нет корректного маршрута
app.use('*', (req, res) => res.status(404).send({ messageError: 'Запрашиваемый ресурс не найден' }));

// app.use(error());

// Ругается eslint на консоль, не знаю почему, выдает ошибку warning.
app.listen(PORT/* , () => console.log(`Приложение запущенно на порту ${PORT}`) */);
