const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
// npm i body-parser
const bodyParser = require('body-parser');

const routerUsers = require(path.resolve('routes/users'));
const routerCards = require(path.resolve('routes/cards'));

const { PORT = 3000 } = process.env;

const app = express();

// Подключение к серверу MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Настройки body-parser. Используем с помощью use как middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Временное решение. Какой-то непонятный мидлвэа
app.use((req, res, next) => {
  // Пока не понятно как занесли в обьект запроса, обьект user
  req.user = {
    _id: '60e431741ba49c36089e2716'
  };

  next();
});

// Экспортирую маршруты
app.use('/users', routerUsers);
// Третий параметр, функция предварительной обработки, мидлвэа
app.use('/cards', routerCards);

app.listen(PORT, () => {
  console.log(`Приложение запущенно на порту ${PORT}`)
});
