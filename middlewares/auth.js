const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config.js");
const { UNAUTHORIZED_ERROR } = require("../utils/constants");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(UNAUTHORIZED_ERROR).send({ message: "Authorization required" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error(err);
    res.status(UNAUTHORIZED_ERROR).send({ message: "Authorization required" });
  }
  req.user = payload;
  return next();
};
