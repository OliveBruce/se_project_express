const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST,
  UNAUTHORIZED_ERROR,
  NOT_FOUND,
  CONFLICT,
  DEFAULT,
} = require("../utils/constants");

// CREATE USER
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!name || !avatar || !email || !password) {
    return res.status(BAD_REQUEST).send({ message: "All fields are required" });
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new Error("User already exists!");
      }
      return User.create({
        name,
        avatar,
        email,
        password,
      });
    })
    .then((user) => {
      if (user) {
        const userData = {
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          _id: user._id,
        };
        return res.status(201).send(userData);
      }
    })
    .catch((err) => {
      if (err.message === "User already exists!") {
        return res.status(CONFLICT).send({ message: "Email already exists" });
      }
      console.error("ERROR CODE:", err.code);
      console.error("ERROR:", err);

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid data passed" });
      }

      return res.status(DEFAULT).send({
        message: "An error occurred while creating the user.",
      });
    });
};

// GET USER BY ID
const getCurrentUser = (req, res) => {
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
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid ID" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: err.message });
      }

      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server." });
    });
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(BAD_REQUEST).send({ message: "email is required" });
  }
  if (!password) {
    return res.status(BAD_REQUEST).send({ message: "password is required" });
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
        return res
          .status(UNAUTHORIZED_ERROR)
          .send({ message: "Incorrect email or password" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server." });
    });
};

// UPDATE USER

const updateUserInfo = (req, res) => {
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
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: err.message });
      }

      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server." });
    });
};

module.exports = { getCurrentUser, createUser, login, updateUserInfo };
