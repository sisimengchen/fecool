const map = require("map-stream");
const { printer } = require("../../util");

module.exports = function gulpPrinter(format) {
  if (!format) {
    format = filepath => filepath;
  }
  function mapFile(file, cb) {
    const filepath = file.path;
    const formatted = format(filepath);
    if (formatted) {
      printer.log(formatted);
    }
    cb(null, file);
  }
  return map(mapFile);
};
