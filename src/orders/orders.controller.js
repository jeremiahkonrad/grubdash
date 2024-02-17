const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const { idsMatch } = require("../utils/validation");

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
      case "status":
        const VALID_STATUSES = [
          "pending",
          "preparing",
          "out-for-delivery",
          "delivered",
        ];
        if (
          !fieldValue ||
          fieldValue.length === 0 ||
          !VALID_STATUSES.includes(fieldValue)
        ) {
          return next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
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

const validDeletionTarget = (req, res, next) => {
  const orderToDelete = res.locals.order;
  if (orderToDelete.status !== "pending") {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending.`,
    });
  }
  return next();
};

const create = (req, res, next) => {
  const newOrder = { ...req.body.data, id: nextId() };

  orders.push(newOrder);

  res.status(201).json({ data: newOrder });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.order });
};

const update = (req, res, next) => {
  const orderToUpdate = res.locals.order;
  const updatedOrder = {
    ...orderToUpdate,
    ...req.body.data,
    id: orderToUpdate.id,
  };
  const orderIndex = orders.findIndex((o) => o.id === orderToUpdate.id);

  orders[orderIndex] = updatedOrder;

  res.json({ data: updatedOrder });
};

const destroy = (req, res, next) => {
  const orderToDestroy = res.locals.order;

  const orderIndex = orders.findIndex((o) => o.id === orderToDestroy.id);

  if (orderIndex > -1) {
    orders.splice(orderIndex, 1);
  }

  res.sendStatus(204);
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
  update: [
    orderExists,
    idsMatch("Order", "orderId"),
    validateOrder("deliverTo"),
    validateOrder("mobileNumber"),
    validateOrder("dishes"),
    validateOrder("status"),
    update,
  ],
  destroy: [orderExists, validDeletionTarget, destroy],
};
