const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { NOT_FOUND } = require("../utils/constants");
const { createUser, login } = require("../controllers/users");

router.use("/users", userRouter);
router.use("/items", itemRouter);

router.post("/login", login);
router.post("/register", createUser);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
