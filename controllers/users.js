const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const { REQUEST_CREATED, CONFLICT } = require("../utils/constants");

const { BadRequestError } = require("../utils/errors/BadRequestError");
const { NotFoundError } = require("../utils/errors/NotFoundError");
const { ConflictError } = require("../utils/errors/ConflictError");
const { UnauthorizedError } = require("../utils/errors/UnauthorizedError");
const { InternalServerError } = require("../utils/errors/InternalServerError");

// CREATE USER
const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!name || !avatar || !email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(new ConflictError("The user already exists"));
      }
      return User.create({
        name,
        avatar,
        email,
        password,
      });
    })
    .then((user) => {
      const userData = {
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      };
      return res.status(REQUEST_CREATED).send(userData);
    })
    .catch((err) => {
      if (err.message === "User already exists!") {
        return res.status(CONFLICT).send({ message: "Email already exists" });
      }
      console.error("ERROR CODE:", err.code);
      console.error("ERROR:", err);

      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data provided"));
      }
      return next(new InternalServerError("Internal Server Error"));
    });
};

// GET USER BY ID
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const { _id, email, avatar, name } = user;
      res.status(200).send({
        _id,
        email,
        avatar,
        name,
      });
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user ID format"));
      }
      return next(new InternalServerError("Internal server error"));
    });
};

// LOGIN
const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return next(new UnauthorizedError("Incorrect email or password"));
      }
      return next(new InternalServerError("Internal server error"));
    });
};

// UPDATE USER

const updateUserInfo = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then(() => res.status(200).send({ name, avatar }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid user data"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      return next(new InternalServerError("Internal server error"));
    });
};

module.exports = { getCurrentUser, createUser, login, updateUserInfo };
