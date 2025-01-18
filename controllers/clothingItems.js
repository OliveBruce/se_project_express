const ClothingItem = require("../models/clothingItem");
const {
  REQUEST_CREATED,
  FORBIDDEN_REQUEST,
  BAD_REQUEST,
  NOT_FOUND,
  DEFAULT,
} = require("../utils/constants");
const { BadRequestError } = require("../utils/errors/BadRequestError");
const { NotFoundError } = require("../utils/errors/NotFoundError");
const { InternalServerError } = require("../utils/errors/InternalServerError");
const { ForbiddenError } = require("../utils/errors/ForbiddenError");

const createItem = (req, res, next) => {
  const { name, imageUrl, weather } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, imageUrl, weather, owner })
    .then((item) => res.status(REQUEST_CREATED).send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data provided"));
      }
      return next(
        new InternalServerError("An error occurred while creating the item")
      );
    });
};

const deleteItem = (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      const ownerId = item.owner.toString();

      if (userId !== ownerId) {
        return next(
          new ForbiddenError("You are not authorized to delete this item")
        );
      }
      return ClothingItem.findByIdAndDelete(itemId)
        .orFail()
        .then((deletedItem) => res.send(deletedItem));
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID format"));
      }
      return next(
        new InternalServerError("An error occurred while deleting the item")
      );
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      return next(
        new InternalServerError("An error occurred while fetching items")
      );
    });
};

const likeItem = (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true }
  )
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID format"));
      }
      return next(
        new InternalServerError("An error occurred while liking the item")
      );
    });
};

const deleteLike = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID format"));
      }
      return next(
        new InternalServerError("An error occurred while unliking the item")
      );
    });
};

module.exports = { createItem, getItems, deleteItem, likeItem, deleteLike };
