const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  deleteLike,
} = require("../controllers/clothingItems");

const {
  validateItemId,
  validateCardBody,
} = require("../middlewares/validation");

router.get("/", getItems);
router.delete("/:itemId", auth, validateItemId, deleteItem);
router.post("/", auth, validateCardBody, createItem);
router.put("/:itemId/likes", auth, validateItemId, likeItem);
router.delete("/:itemId/likes", auth, validateItemId, deleteLike);

module.exports = router;
