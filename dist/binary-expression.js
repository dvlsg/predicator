"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BINARY_OPERATORS = undefined;

var _zanaUtil = require('zana-util');

var _literalExpression = require('./literal-expression.js');

var _literalExpression2 = _interopRequireDefault(_literalExpression);

var _parameterExpression = require('./parameter-expression.js');

var _parameterExpression2 = _interopRequireDefault(_parameterExpression);

var _accessorExpression = require('./accessor-expression.js');

var _accessorExpression2 = _interopRequireDefault(_accessorExpression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BINARY_OPERATORS = exports.BINARY_OPERATORS = {
    'DEEP_EQUAL': 'equal()', // not really an expression in the javascript sense.
    'EQUAL': '===',
    'FALSY': '!', // not binary
    'GREATER_THAN': '>',
    'GREATER_THAN_OR_EQUAL': '>=',
    'LESS_THAN': '<',
    'LESS_THAN_OR_EQUAL': '<=',
    'NOT_EQUAL': '!==',
    'TRUTHY': '!!', // not binary

    '$deq': 'equal()', // again, not really an expression in the javascript sense.
    '$eq': '===',
    '$falsy': '!', // not binary
    '$gt': '>',
    '$gte': '>=',
    '$lt': '<',
    '$lte': '<=',
    '$neq': '!==',
    '$truthy': '!!' // not binary. make unary-expression class?
};

const FUNCTIONS = {
    [BINARY_OPERATORS.DEEP_EQUAL]: (a, b) => (0, _zanaUtil.equals)(a, b),
    [BINARY_OPERATORS.EQUAL]: (a, b) => a === b,
    [BINARY_OPERATORS.FALSY]: a => !a // do falsy and truthy belong here? not really binarys.
    , [BINARY_OPERATORS.GREATER_THAN]: (a, b) => a > b,
    [BINARY_OPERATORS.GREATER_THAN_OR_EQUAL]: (a, b) => a >= b,
    [BINARY_OPERATORS.LESS_THAN]: (a, b) => a < b,
    [BINARY_OPERATORS.LESS_THAN_OR_EQUAL]: (a, b) => a <= b,
    [BINARY_OPERATORS.NOT_EQUAL]: (a, b) => a !== b,
    [BINARY_OPERATORS.TRUTHY]: a => Boolean(a),
    [BINARY_OPERATORS.IN]: (a, b) => b.indexOf(a) > -1
};

class BinaryExpression {

    constructor(left, type, right) {
        // throw error if bad type?
        if (BINARY_OPERATORS.hasOwnProperty(type)) this.type = BINARY_OPERATORS[type];else this.type = type; // or what?
        this.parent = null;
        this.left = left;
        this.right = right;
    }

    static make(left, type, right) {
        let binary = new BinaryExpression(left, type, right);
        return binary.build();
    }

    get [Symbol.toStringTag]() {
        return 'BinaryExpression';
    }

    build() {
        // strategy here... huge default lookups? eval? new Function()?
        let left = this.left;
        let right = this.right;
        let fn = FUNCTIONS[this.type];

        let map = new WeakMap(); // lookup by constructor?
        map.set(_literalExpression2.default, x => x.val);
        map.set(_parameterExpression2.default, (x, y) => y);
        map.set(_accessorExpression2.default, (x, y) => x.access(y));

        // a and b may or may not need to be provided, based on number of Literals.
        // there has to be a more efficient way of determining this.
        return (a, b) => {
            let l = null;
            if (left instanceof _literalExpression2.default) l = left.val;
            if (left instanceof _accessorExpression2.default) // is this the job of the binary expression? not really... leaving for now.
                l = left.access(a);
            if (left instanceof _parameterExpression2.default) l = a;

            let r = null;
            if (right instanceof _literalExpression2.default) r = right.val;
            if (right instanceof _accessorExpression2.default) // same as above.
                r = right.access(b);
            if (right instanceof _parameterExpression2.default) r = b;
            return fn(l, r);
        };
    }
}
exports.default = BinaryExpression;