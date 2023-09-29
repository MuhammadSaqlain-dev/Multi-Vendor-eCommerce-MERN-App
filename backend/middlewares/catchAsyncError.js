module.exports = (theFun) => async (req, res, next) => {
  Promise.resolve(theFun(req, res, next)).catch(next);
};
