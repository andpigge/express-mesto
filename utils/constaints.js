const headers = {
  json: res => {
    return res.header({
      'Content-Type': 'application/json; charset=utf8'
    })
    .status(200);
  }
};

// Лучше их занести в .env
const VALID_ERROR_CODE = 400;
const CAST_ERROR_CODE = 404;
const SERVER_ERROR_CODE = 500;

module.exports = {
  headers
};
