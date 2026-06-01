function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `No API route found for ${req.method} ${req.originalUrl}`,
    });
  }

  return next();
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      statusCode,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    })
  );

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Request Error',
    message: statusCode === 500 ? 'An unexpected API error occurred.' : err.message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
