var fs = require('fs'),
    TokenStream = require("./TokenStream"),
    InputStream = require("./InputStream"),
    Parser = require("./Parser"),
    Environment = require("./Enviornment"),
    Evaluate = require("./Evaluate"),
    util = require("util");
fs.readFile("./test.gf", {encoding: "utf8"}, function (err, data) {
    "use strict";
    if (!err) {
        var globalEnv = new Environment();

        globalEnv.def("time", function (func) {
            try {
                console.time("time");
                return func();
            } finally {
                console.timeEnd("time");
            }
        });
        globalEnv.def("println", function (val) {
            util.puts(val);
        });
        globalEnv.def("print", function (val) {
            util.print(val);
        });

        var prog = Parser(TokenStream(InputStream(data)));
        Evaluate(prog, globalEnv);
    }
});

