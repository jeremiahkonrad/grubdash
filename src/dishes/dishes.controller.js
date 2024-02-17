const path = require("path");
const { validateDish } = require("../utils/validation");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const { idsMatch } = require("../utils/validation");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res) => {
  res.json({ data: dishes });
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
    message: `Dish does not exist: ${dishId}.`,
  });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.dish });
};

const update = (req, res, next) => {
  const dishToUpdate = res.locals.dish;
  const updatedDish = {
    ...dishToUpdate,
    ...req.body.data,
    // always use the id from the existing record
    id: dishToUpdate.id,
  };
  const dishIndex = dishes.findIndex((d) => d.id === dishToUpdate.id);

  dishes[dishIndex] = updatedDish;

  res.json({ data: updatedDish });
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
  update: [
    dishExists,
    idsMatch("Dish", "dishId"),
    validateDish("description"),
    validateDish("name"),
    validateDish("image_url"),
    validateDish("price"),
    update,
  ],
  list,
};
