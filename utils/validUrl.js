// Простой пакет для валидации данных
const validator = require('validator');

// Валидация url с помощью validator для celebrate
// В первый параметр автоматически запишется url для валидации при использовании функции в celebrate
const validUrl = (url) => {
  const result = validator.isURL(url);
  if (result) {
    return url;
  }
  throw new Error('Неправильный URL');
};

module.exports = validUrl;
