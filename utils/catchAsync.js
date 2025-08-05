module.exports = (fn) =>
  function (req, res, next) {
    return fn(req, res, next).catch((err) => next(err));
  };
