const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { createUser, login } = require("../controllers/users");
const {
  validateUserInfo,
  validateUserLogin,
} = require("../middlewares/validation");

const { NotFoundError } = require("../utils/errors/NotFoundError");

router.use("/users", userRouter);
router.use("/items", itemRouter);

router.post("/signin", validateUserLogin, login);
router.post("/signup", validateUserInfo, createUser);

router.use((req, res, next) => {
  next(new NotFoundError("Router not found"));
});

module.exports = router;
