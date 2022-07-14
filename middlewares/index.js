// middleware.js
const errorLogger = (err, req, res, next) => {
  console.log("loggin out error");
  console.error("\x1b[31m", err); // adding some color to our logs
  next(err); // calling next middleware
};

const errorResponder = (err, req, res, next) => {
  res.header("Content-Type", "application/json");
  res.status(err.statusCode).send(JSON.stringify(err, null, 4)); // pretty print
};
const invalidPathHandler = (req, res, next) => {
  res.redirect("/error");
};

module.exports = { errorLogger, errorResponder, invalidPathHandler };
