const express = require('express');
const mongoose = require('mongoose');
// npm i body-parser
const bodyParser = require('body-parser');

const routerUsers = require('./routes/users');

const routerCards = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

// Подключение к серверу MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Настройки body-parser. Используем с помощью use как middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Временное решение. Какой-то непонятный мидлвэа
app.use((req, res, next) => {
  // Пока не понятно как занесли в обьект запроса, обьект user
  req.user = {
    _id: '60e431741ba49c36089e2716',
  };

  next();
});

// Экспортирую маршруты
app.use('/users', routerUsers);
// Третий параметр, функция предварительной обработки, мидлвэа
app.use('/cards', routerCards);
// Если нет корректного маршрута
app.use('*', (req, res) => res.status(404).send({ messageError: 'Запрашиваемый ресурс не найден' }));

// Ругается eslint на консоль, не знаю почему, выдает ошибку warning.
app.listen(PORT/* , () => console.log(`Приложение запущенно на порту ${PORT}`) */);
