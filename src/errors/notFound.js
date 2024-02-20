// Middleware to return a 404 when a request route is not recognized
function notFound(request, response, next) {
  next({ status: 404, message: `Path not found: ${request.originalUrl}` });
}

module.exports = notFound;
