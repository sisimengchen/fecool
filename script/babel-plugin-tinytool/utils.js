let uid = 0;

const KEYWORD = "tinytooljs";

const getID = function(name) {
  return `name_${KEYWORD}_${uid++}`;
};

module.exports = {
  KEYWORD,
  getID
};
