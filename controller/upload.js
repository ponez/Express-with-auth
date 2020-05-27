const picModel = require("../model/pictures");

exports.getUpload = (req, res) => {
  picModel
    .findAll()
    .then((data) => {
      if (!data) {
        console.log("no file");
      } else {
        res.render("upload", { data });
      }
    })
    .catch((err) => console.log("getupload", err));
};
exports.postUpload = (req, res) => {
  let file = req.file;
  const files = new picModel({
    picPath: file.path,
  });
  files
    .save()
    .then((data) => {
      res.redirect("/upload");
    })
    .catch((err) => console.log(err));
};
exports.getDownload = (req, res) => {
  picModel
    .findOne({ where: { id: req.params.id } })
    .then((data) => {
      console.log(data);
      if (!data) {
        res.redirect("/404");
      } else {
        console.log(__dirname);
        let path = __dirname + "\\..\\" + data.picPath;
        res.download(path);
      }
    })
    .catch((err) => console.log(err));
};
