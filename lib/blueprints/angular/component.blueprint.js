"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var INPUT = require("../../inputs");
var ComponentBluePrint = (function () {
    function ComponentBluePrint() {
        this.context = {};
    }
    ComponentBluePrint.prototype.params = function () {
        return {
            root: ['', INPUT.REQUIRED],
            name: ['', INPUT.REQUIRED],
            inlineTemplate: [false, INPUT.OPTIONAL]
        };
    };
    ComponentBluePrint.prototype.preCompile = function () {
        var dependencies = [
            'Component'
        ];
        if (this.context.onPush) {
            dependencies.push('ChangeDetectionStrategy');
        }
        this.context.dependencies = dependencies;
    };
    ComponentBluePrint.prototype.files = function () {
        var files = [];
        if (!this.context.inlineTemplate) {
            files.push({
                path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.html'),
                text: "\n<%= utils.capitalize(name) %> Template\n        "
            });
        }
        if (!this.context.inlineStyles) {
            files.push({
                path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.css'),
                text: "\n:host {}\n        "
            });
        }
        files.push({
            path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.ts'),
            text: "import { <%= dependencies.join(', ') %> } from '@angular/core';\n\nexport @Component({\n  selector: '<%= name %>',\n  <% if (!inlineTemplate) { %>templateUrl: '<%= name %>.component.html',<% } else { %>template: `<%= utils.capitalize(name) %> Template`<% } %>\n  <% if (!inlineStyles) { %>styleUrls: ['<%= name %>.component.css'],<% } else { %>styles: ['']<% } %>\n  <% if (onPush) { %>changeDetection: ChangeDetectionStrategy.OnPush<% } %>\n})\nclass <%= utils.capitalize(name) %>Component {}\n      "
        });
        return files;
    };
    return ComponentBluePrint;
}());
exports.ComponentBluePrint = ComponentBluePrint;
;
