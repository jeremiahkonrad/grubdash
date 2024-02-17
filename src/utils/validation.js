const idsMatch = (entity, routerParamId) => {
  return (req, res, next) => {
    const idFromBody = req.body.data.id;

    if (!idFromBody) return next();

    const idFromRouteParam = req.params[routerParamId];

    if (idFromBody === idFromRouteParam) {
      return next();
    }

    return next({
      status: 400,
      message: `${entity} Id does not match route id. ${entity}: ${idFromBody}, Route: ${idFromBody}`,
    });
  };
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

const validOrderDeletionTarget = (req, res, next) => {
  const orderToDelete = res.locals.order;
  if (orderToDelete.status !== "pending") {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending.`,
    });
  }
  return next();
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
            message: `Dish must include a ${field}`,
          });
        }
        return next();
      case "price":
        if (typeof fieldValue !== "number" || fieldValue <= 0) {
          return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`,
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

module.exports = {
  idsMatch,
  validateOrder,
  validOrderDeletionTarget,
  validateDish,
};
