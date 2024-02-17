const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res) => {
  res.json({ data: dishes });
};

const validateDish = (field) => {
  return (req, res, next) => {
    const fieldValue = req.body.data[field];

    switch (field) {
      case "description":
      case "name":
      case "image_url":
        if (!fieldValue || fieldValue.length === 0) {
          return next({
            status: 400,
            message: `please provide a value for ${field}`,
          });
        }
        return next();
      case "price":
        // implicitly checks presence of price
        if (typeof fieldValue !== "number") {
          return next({
            status: 400,
            message: `price must be a number`,
          });
        }
        if (fieldValue <= 0) {
          return next({
            status: 400,
            message: `price must be more than 0`,
          });
        }
        return next();
      default:
        return next({
          status: 400,
          message: "cannot validate unrecognized field",
        });
    }
  };
};

const create = (req, res, next) => {
  const newDish = { ...req.body.data, id: nextId() };

  dishes.push(newDish);

  res.status(201).json({ data: newDish });
};

const dishExists = (req, res, next) => {
  const dishId = req.params.dishId;

  const maybeDish = dishes.find((d) => d.id === dishId);

  if (maybeDish) {
    res.locals.dish = maybeDish;

    return next();
  }

  return next({
    status: 404,
    message: `dish with id ${dishId} does not exist`,
  });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.dish });
};

module.exports = {
  create: [
    validateDish("description"),
    validateDish("name"),
    validateDish("image_url"),
    validateDish("price"),
    create,
  ],
  read: [dishExists, read],
  list,
};
