const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const Forbidden = require('../errorsHandler/Forbidden');
const UnauthorizedError = require('../errorsHandler/UnauthorizedError');

// Мидлвэа для защиты маршрутов. Если пользователь не зашел
module.exports.auth = (req, res, next) => {
  // Приходит от сервера с заголовками. authorization: TOKEN. Если конкретный пользователь вошел,
  // клиент отправит токен в знак подтверждения, иначе токена не будет.
  // Но мы также делали отдельный запрос checkTokenApi
  const { authorization } = req.headers;

  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Необходимо авторизироваться'));
  }

  let payload;

  // Вместо if
  try {
    const token = authorization.replace('Bearer ', '');
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new Forbidden('Необходимо авторизироваться'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next();
};
