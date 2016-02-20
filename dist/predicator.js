/* eslint no-loop-func: 0 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _zanaCheck = require('zana-check');

var _zanaCheck2 = _interopRequireDefault(_zanaCheck);

var _predicates = require('./predicates.js');

var predicates = _interopRequireWildcard(_predicates);

var _predicatorError = require('./predicator-error.js');

var _predicatorError2 = _interopRequireDefault(_predicatorError);

var _accessorExpression = require('./accessor-expression.js');

var _accessorExpression2 = _interopRequireDefault(_accessorExpression);

var _literalExpression = require('./literal-expression.js');

var _literalExpression2 = _interopRequireDefault(_literalExpression);

var _binaryExpression = require('./binary-expression.js');

var _binaryExpression2 = _interopRequireDefault(_binaryExpression);

var _logicalExpression = require('./logical-expression.js');

var _logicalExpression2 = _interopRequireDefault(_logicalExpression);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const inspect = obj => _util2.default.inspect(obj, { depth: null });

let log = console.log.bind(console); // eslint-disable-line no-unused-vars

function branch(pred, val) {
    let node = new _logicalExpression2.default(val);
    if (!pred.head) {
        pred.head = node;
        pred.current = node;
    } else {
        pred.current.add(node);
        pred.current = node;
    }
    return pred;
}

function leaf(pred, val) {
    if (!pred.head) branch(pred, _logicalExpression.LOGICAL_OPERATORS.AND); // proper data type later
    pred.current.add(val);
    pred.hasLeaf = true; // better way?
    return pred;
}

function iterate(node, val) {
    if (node instanceof _logicalExpression2.default) {
        let res = null;
        let child = null;
        let logical = node.val;
        if (logical === _logicalExpression.LOGICAL_OPERATORS.NOT) {
            res = true;
            for (let i = 0; i < node.subexpressions.length; i++) {
                child = node.subexpressions[i];
                res = !iterate(child, val); // ^ flip
                if (res) return res; // short circuit on false? or true? or dependent? :\
            }
            return res;
        }
        // else
        for (let i = 0; i < node.subexpressions.length; i++) {
            child = node.subexpressions[i];
            res = iterate(child, val);
            if (!res && logical === _logicalExpression.LOGICAL_OPERATORS.AND) // short circuit and
                return false;
            if (res && logical === _logicalExpression.LOGICAL_OPERATORS.OR) // short circuit or
                return true;
        }
        return logical === _logicalExpression.LOGICAL_OPERATORS.AND; // return false for $or, true for $and
    }
    // else
    let fn = node;
    if (fn instanceof _binaryExpression2.default) fn = fn.build(); // do we want to cache the built version by writing to node.val?
    return fn(val);
}

const PARSE_ACTIONS = {
    NON_OPERATOR: (pred, accessor, val) => {
        // assume object equality
        leaf(pred, new _binaryExpression2.default(accessor, '$eq', new _literalExpression2.default(val))); // similar to the val instanceof Object section above. stands for compression.
    },
    ONE_OPERATOR: (pred, accessor, val) => {
        // assume standard, carry on
        parse(pred, val, accessor); // eslint-disable-line no-use-before-define
    },
    MULTIPLE_OPERATORS: (pred, accessor, val) => {
        // assume implicit logical and
        branch(pred, _logicalExpression.LOGICAL_OPERATORS.AND);
        for (let nestedKey of Object.keys(val)) {
            let nestedVal = val[nestedKey];
            parse(pred, { [nestedKey]: nestedVal }, accessor); // eslint-disable-line no-use-before-define
        }
        pred.up();
    }
};

function parse(pred, current, accessor) {
    if (current instanceof Object) {
        // log('current was an object');
        let keys = Object.keys(current);

        let keyCount = keys.length;
        if (keyCount > 1) // if object and more than one property defined, assume we want an implicit $and branch to group them.
            branch(pred, '$and');

        for (let key of keys) {
            let val = current[key];
            if (_logicalExpression.LOGICAL_OPERATORS.hasOwnProperty(key)) {
                branch(pred, key);
                if (_zanaCheck2.default.instance(val, Array)) {
                    // $and, $or
                    for (let logicalVal of val) parse(pred, logicalVal); // no accessor yet
                } else // $not
                    parse(pred, val); // no accessor yet
                pred.up();
            } else if (_binaryExpression.BINARY_OPERATORS.hasOwnProperty(key)) {
                // else if (OPERATORS.COMPARISON.has(key)) {
                // log('found comparator, should be the end of parsing');
                // log('accessor?', accessor);
                let binary = new _binaryExpression2.default(accessor, key, new _literalExpression2.default(val));
                leaf(pred, binary);
            } else {
                // log('found accessor');
                // don't support accessor stack.
                // assume that if there is a stack with non-operators, that we actually want to test object equality.
                // for nested access keys, the 'a.b.c' format should be used.
                // this is done for consistency, and matches existing object comparison expectations (ie - mongodb)
                accessor = new _accessorExpression2.default(...key.split('.'));

                // what if val instanceof Array? do we want to $deq that one as well? probably.

                if (!(val instanceof Object)) {
                    // log('found accessor + compressed, done parsing');
                    log('assuming comparator should be $eq');
                    let binary = new _binaryExpression2.default(accessor, '$eq', new _literalExpression2.default(val));
                    // accessor = null; // accessor is consumed (??)
                    leaf(pred, binary);
                } else {
                    let valKeys = Object.keys(val);

                    // todo: we probably need to ensure that we don't have a mix of operators and non-operators

                    let action = null;
                    if (valKeys.length === 1) {
                        let singleKey = valKeys[0];
                        if (_binaryExpression.BINARY_OPERATORS.hasOwnProperty(singleKey)) action = PARSE_ACTIONS.ONE_OPERATOR;else action = PARSE_ACTIONS.NON_OPERATOR;
                    } else {
                        let hasNonOperator = false;
                        for (let nestedKey of valKeys) {
                            if (!_binaryExpression.BINARY_OPERATORS.hasOwnProperty(nestedKey)) {
                                hasNonOperator = true;
                                break;
                            }
                        }
                        if (hasNonOperator) // { k1: { k2: val, k3: val } }
                            action = PARSE_ACTIONS.NON_OPERATOR;else // { key: { $lt: 2, $gt: 0 }
                            action = PARSE_ACTIONS.MULTIPLE_OPERATORS;
                    }
                    if (action && action instanceof Function) action(pred, accessor, val); // is accessor consumed?
                }
            }
        }
        if (keyCount > 1) pred.up(); // go up from the implicit $and branch.
    }
}

class Predicator {

    constructor() {
        this.head = null;
        this.current = null;
        this.hasLeaf = false;
    }

    build() {
        if (!this.head) throw new _predicatorError2.default(`Predicator#build() was called before an ExpressionTree was made!`);
        if (!this.hasLeaf) throw new _predicatorError2.default(`Predicator#build() was called before the ExpressionTree had leaves!`);
        return val => iterate(this.head, val);
    }

    static parse(obj) {
        let pred = new Predicator();
        if (!obj || !_zanaCheck2.default.is(obj, Object)) throw new _predicatorError2.default(`Predicator.parse() received an invalid definition! Received: ${ inspect(obj) }`);
        parse(pred, obj);
        let built = pred.build();
        return built;
    }

    not() {
        if (!this.head) branch(this, _logicalExpression.LOGICAL_OPERATORS.AND);
        return branch(this, _logicalExpression.LOGICAL_OPERATORS.NOT);
    }

    and() {
        return branch(this, _logicalExpression.LOGICAL_OPERATORS.AND);
    }

    or() {
        return branch(this, _logicalExpression.LOGICAL_OPERATORS.OR);
    }

    up() {
        if (this.current !== this.head) {
            let parent = this.current.parent;
            this.current = parent;
        }
        return this;
    }

    push(method) {
        return leaf(this, method);
    }
}

exports.default = Predicator; // consider using a weakmap, as well

for (let key of Object.keys(predicates)) {
    let predicate = predicates[key];
    key = key.replace(/[_]/g, '');
    switch (predicate.length) {
        case 1:
            Predicator.prototype[key] = function () {
                let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

                return this.push(a => predicate(selector(a)));
            };
            break;
        case 2:
            Predicator.prototype[key] = function (selector, b) {
                if (b === undefined) {
                    b = selector;
                    selector = x => x;
                }
                return this.push(a => predicate(selector(a), b));
            };
            break;
        default:
            break; // or throw error?
    }
}