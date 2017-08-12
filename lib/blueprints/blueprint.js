"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var writeFile = require("write");
var _ = require("lodash");
var Blueprint = (function () {
    function Blueprint(blueprintConfig) {
        this.blueprintConfig = blueprintConfig;
        this.compiledFiles = [];
    }
    Blueprint.prototype.compileFiles = function () {
        if (this.blueprintConfig.preCompile) {
            this.blueprintConfig.preCompile();
        }
        var context = __assign({}, this.blueprintConfig.context, { utils: {
                capitalize: _.capitalize,
                camelCase: _.camelCase,
                escape: _.escape,
                kebabCase: _.kebabCase,
                lowerCase: _.lowerCase
            } });
        for (var _i = 0, _a = this.blueprintConfig.files(); _i < _a.length; _i++) {
            var file = _a[_i];
            var compiledFile = {
                path: _.template(file.path)(context),
                text: _.template(file.text)(context)
            };
            this.compiledFiles.push(compiledFile);
        }
        return this.compiledFiles;
    };
    Blueprint.prototype.save = function () {
        this.compiledFiles.forEach(function (file) {
            writeFile(file.path, file.text, function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        });
    };
    return Blueprint;
}());
exports.Blueprint = Blueprint;
