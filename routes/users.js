const router = require("express").Router();
const auth = require("../middlewares/auth");

router.use(auth);
const { getCurrentUser, updateUserInfo } = require("../controllers/users");
const { validateUpdateUser } = require("../middlewares/validation");

router.get("/me", getCurrentUser);

router.patch("/me", validateUpdateUser, updateUserInfo);

module.exports = router;
