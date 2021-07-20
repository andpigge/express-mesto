const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

// Мидлвэа для защиты маршрутов. Если пользователь не зашел
module.exports.auth = (req, res, next) => {
  // Приходит от сервера с заголовками. authorization: TOKEN. Если конкретный пользователь вошел,
  // клиент отправит токен в знак подтверждения, иначе токена не будет.
  // Но мы также делали отдельный запрос checkTokenApi
  const { authorization } = req.headers;

  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Необходимо авторизироваться' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  // Вместо if
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(403).send({ message: 'Необходимо авторизироваться' });
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next();
};
