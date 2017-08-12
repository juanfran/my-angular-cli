"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob = require("glob");
exports.getModules = function (pattern) {
    return new Promise(function (resolve, reject) {
        glob(pattern, {}, function (er, files) {
            resolve(files);
        });
    });
};
