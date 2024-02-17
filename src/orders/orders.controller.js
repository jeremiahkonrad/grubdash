const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const {
  idsMatch,
  validOrderDeletionTarget,
  validateOrder,
} = require("../utils/validation");

// TODO: Implement the /orders handlers needed to make the tests pass
const list = (req, res, next) => {
  res.json({ data: orders });
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
  destroy: [orderExists, validOrderDeletionTarget, destroy],
};
