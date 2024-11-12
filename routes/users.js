const router = require("express").Router();
const auth = require("../middlewares/auth");

router.use(auth);
const { getCurrentUser, updateUserInfo } = require("../controllers/users");

router.get("/me", getCurrentUser);

router.patch("/me", updateUserInfo);

module.exports = router;
