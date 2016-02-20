"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const LOGICAL_OPERATORS = exports.LOGICAL_OPERATORS = {
    AND: '$and',
    OR: '$or',
    NOT: '$not',

    '$and': '&&',
    '$or': '||',
    '$not': '!' // technically a unary expression, not a logical expression
};

class LogicalExpression {

    constructor(val) {
        this.val = val;
        this.parent = null;
        this.subexpressions = [];
        this.class = 'LogicalExpression';
    }

    get [Symbol.toStringTag]() {
        return 'LogicalExpression';
    }

    add(val) {
        // let node = (val instanceof TreeNode)
        //     ? val
        //     : new TreeNode(val);
        // node.parent = this; // do we need an expressionbuilder class to abstract this stuff away?
        // this.children.push(node);

        // set `val.parent` to `this`?
        val.parent = this;
        this.subexpressions.push(val);
        return this;
    }
}
exports.default = LogicalExpression;