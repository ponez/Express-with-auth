exports.notFound = (req, res) => {
  res.status(404).render("err/404");
};
exports.err = (req, res, next) => {
  res.status(500).render("err/500");
};
