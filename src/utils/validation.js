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

module.exports = {
  idsMatch,
};
