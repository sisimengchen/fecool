"use strict";

require("../clean/index")();

require("../other/move")();

require("../css/compile-css")();

require("../css/compile-stylus")();

require("../css/compile-less")();

require("../js/compile-js")();

require("../js/compile-jsx")();

require("../js/common-concat")();

require("../templates/compile-html")(); // require("../image/move")();


require("../image/compress")();

require("./build-dev")();

require("./build")();

require("./watch")();