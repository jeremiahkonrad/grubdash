const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const list = (req, res, next) => {
  res.json({ data: orders });
};

const validateOrder = (field) => {
  return (req, res, next) => {
    const fieldValue = req.body.data[field];

    switch (field) {
      case "deliverTo":
      case "mobileNumber":
        if (!fieldValue || fieldValue.length === 0) {
          return next({
            status: 400,
            message: `Order must include a ${field}`,
          });
        }
        return next();
      case "dishes":
        if (!fieldValue) {
          return next({
            status: 400,
            message: `Order must include a dish`,
          });
        }
        if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
          return next({
            status: 400,
            message: `Order must include at least one dish`,
          });
        }
        const invalidDishIndex = fieldValue.findIndex(
          (d) =>
            d.quantity === undefined ||
            typeof d.quantity !== "number" ||
            d.quantity <= 0
        );
        if (invalidDishIndex > -1) {
          return next({
            status: 400,
            message: `Dish ${invalidDishIndex} must have a quantity that is an integer greater than 0`,
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
  const newOrder = { ...req.body.data, id: nextId() };

  orders.push(newOrder);

  res.status(201).json({ data: newOrder });
};

const orderExists = (req, res, next) => {
  const orderId = req.params.orderId;

  const maybeOrder = orders.find((o) => o.id === orderId);

  if (maybeOrder) {
    res.locals.order = maybeOrder;
    return next();
  }

  return next({
    status: 404,
    message: `Order ${orderId} does not exist`,
  });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.order });
};

module.exports = {
  list,
  create: [
    validateOrder("deliverTo"),
    validateOrder("mobileNumber"),
    validateOrder("dishes"),
    create,
  ],
  read: [orderExists, read],
};
