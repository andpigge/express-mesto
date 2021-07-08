// Инфы не было что заголовки не нужны. Наставник рекомендовал выставить,
// но там скорее заголовки в postman неправильные задавались.
// Да и статусы не совсем правильные, у некоторых есть 201 например
// const headers = {
//   json: res => {
//     return res.header({
//       'Content-Type': 'application/json; charset=utf8'
//     })
//     .status(200);
//   }
// };

// Лучше их занести в .env
// Введены некорректные значения в запрос
const VALID_ERROR_CODE = 400;
// Ресурс не найдет
const CAST_ERROR_CODE = 404;
// Ошибка сервера
const SERVER_ERROR_CODE = 500;

module.exports = {
  VALID_ERROR_CODE,
  CAST_ERROR_CODE,
  SERVER_ERROR_CODE,
};
