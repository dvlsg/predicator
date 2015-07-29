"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Symbol$toStringTag = require("babel-runtime/core-js/symbol/to-string-tag")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var TreeNode = (function () {
    function TreeNode(val) {
        _classCallCheck(this, TreeNode);

        this.val = val;
        this.parent = null;
        this.children = [];
    }

    _createClass(TreeNode, [{
        key: "add",
        value: function add(val) {
            var node = val instanceof TreeNode ? val : new TreeNode(val);
            node.parent = this;
            this.children.push(node);
            return this;
        }
    }, {
        key: "isLeaf",
        value: function isLeaf() {
            return this.children.length === 0;
        }
    }, {
        key: "isRoot",
        value: function isRoot() {
            return this.parent === null;
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'TreeNode';
        }
    }]);

    return TreeNode;
})();

exports["default"] = TreeNode;
module.exports = exports["default"];