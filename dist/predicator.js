/* eslint no-loop-func: 0 */

"use strict";

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _Object$entries = require('babel-runtime/core-js/object/entries')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _zanaCheck = require('zana-check');

var _zanaCheck2 = _interopRequireDefault(_zanaCheck);

var _zanaUtil = require('zana-util');

var _treeNodeJs = require('./tree-node.js');

var _treeNodeJs2 = _interopRequireDefault(_treeNodeJs);

var _predicatesJs = require('./predicates.js');

var predicates = _interopRequireWildcard(_predicatesJs);

var _predicatorErrorJs = require('./predicator-error.js');

var _predicatorErrorJs2 = _interopRequireDefault(_predicatorErrorJs);

var log = console.log.bind(console); // eslint-disable-line no-unused-vars

// const EQ  = '$eq';
// const LT  = '$lt';
// const LTE = '$lte';
// const GT  = '$gt';
// const GTE = '$gte';
// const MOD = '$mod';
// const AND = '$and';
// const OR  = '$or';
// const NOT = '$not';

var OPERATORS = {
    COMPARISON: new _Map([['$eq', 'eq'], ['$lt', 'lt'], ['$lte', 'lte'], ['$gt', 'gt'], ['$gte', 'gte'], ['$mod', 'mod'], ['$neq', 'neq']]),
    LOGICAL: new _Map([['$and', 'and'], ['$or', 'or'], ['$not', 'or']])
};

function branch(pred, val) {
    if (!pred.head) {
        var node = new _treeNodeJs2['default'](val);
        pred.head = node;
        pred.current = node;
    } else {
        var node = new _treeNodeJs2['default'](val);
        pred.current.add(node);
        pred.current = node;
    }
    return pred;
}

function leaf(pred, val) {
    if (!pred.head) branch(pred, '$and'); // proper data type later
    pred.current.add(val);
    pred.hasLeaf = true; // better way?
    return pred;
}

function iterate(node, val) {
    if (!node.isLeaf()) {
        var res = undefined,
            child = undefined,
            logical = node.val;
        if (logical === '$not') {
            res = true;
            for (var i = 0; i < node.children.length; i++) {
                child = node.children[i];
                res = !iterate(child, val); // ^ flip
                if (res) return res; // short circuit on false? or true? or dependent? :\
            }
            return res;
        } else {
            for (var i = 0; i < node.children.length; i++) {
                child = node.children[i];
                res = iterate(child, val);
                if (!res && logical === '$and') // short circuit and
                    return false;
                if (res && logical === '$or') // short circuit or
                    return true;
            }
            return logical === '$and'; // return false for $or, true for $and
        }
    } else {
            var fn = node.val;
            return fn(val);
        }
}

function _parse(pred, current) {
    if (current instanceof Object) {
        var entries = _Object$entries(current);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function () {
                var _step$value = _slicedToArray(_step.value, 2);

                var key = _step$value[0];
                var val = _step$value[1];

                if (OPERATORS.LOGICAL.has(key)) {
                    branch(pred, key);
                    if (_zanaCheck2['default'].instance(val, Array)) {
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;

                        try {
                            for (_iterator2 = _getIterator(val); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var logicalVal = _step2.value;

                                _parse(pred, logicalVal);
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                    _iterator2['return']();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    } else _parse(pred, val);
                    pred.up();
                } else if (val instanceof Object) {
                    _iteratorNormalCompletion3 = true;
                    _didIteratorError3 = false;
                    _iteratorError3 = undefined;

                    try {
                        for (_iterator3 = _getIterator(_Object$entries(val)); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var _step3$value = _slicedToArray(_step3.value, 2);

                            var operatorKey = _step3$value[0];
                            var actualVal = _step3$value[1];

                            if (OPERATORS.COMPARISON.has(operatorKey)) pred[OPERATORS.COMPARISON.get(operatorKey)](function (x) {
                                return x[key];
                            }, actualVal); //eslint-disable-line no-loop-func
                            // hole?
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                _iterator3['return']();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                } else pred.eq(function (x) {
                        return x[key];
                    }, val);
            };

            for (var _iterator = _getIterator(entries), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _iteratorNormalCompletion2;

                var _didIteratorError2;

                var _iteratorError2;

                var _iterator2, _step2;

                var _iteratorNormalCompletion3;

                var _didIteratorError3;

                var _iteratorError3;

                var _iterator3, _step3;

                _loop();
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
}

var Predicator = (function () {
    function Predicator() {
        _classCallCheck(this, Predicator);

        this.head = null;
        this.current = null;
    }

    // consider using a weakmap, as well

    _createClass(Predicator, [{
        key: 'build',
        value: function build() {
            var _this = this;

            if (!this.head) throw new _predicatorErrorJs2['default']('Predicator#build() was called before an ExpressionTree was made!');
            if (!this.hasLeaf) throw new _predicatorErrorJs2['default']('Predicator#build() was called before the ExpressionTree had leaves!');
            return function (val) {
                return iterate(_this.head, val);
            };
        }
    }, {
        key: 'not',
        value: function not() {
            if (!this.head) branch(this, '$and');
            return branch(this, '$not');
        }
    }, {
        key: 'and',
        value: function and() {
            return branch(this, '$and');
        }
    }, {
        key: 'or',
        value: function or() {
            return branch(this, '$or');
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.current !== this.head) {
                var _parent = this.current.parent;
                this.current = _parent;
            }
            return this;
        }
    }, {
        key: 'push',
        value: function push(method) {
            return leaf(this, method);
        }
    }], [{
        key: 'parse',
        value: function parse(obj) {
            var pred = new Predicator();
            if (!obj || !_zanaCheck2['default'].is(obj, Object)) throw new _predicatorErrorJs2['default']('Predicator.parse() received an invalid definition! Received: ' + (0, _zanaUtil.inspect)(obj));
            _parse(pred, obj);
            var built = pred.build();
            return built;
        }
    }]);

    return Predicator;
})();

exports['default'] = Predicator;
var _iteratorNormalCompletion4 = true;
var _didIteratorError4 = false;
var _iteratorError4 = undefined;

try {
    var _loop2 = function () {
        var _step4$value = _slicedToArray(_step4.value, 2);

        var key = _step4$value[0];
        var predicate = _step4$value[1];

        switch (predicate.length) {
            case 1:
                Predicator.prototype[key] = function () {
                    var selector = arguments.length <= 0 || arguments[0] === undefined ? function (x) {
                        return x;
                    } : arguments[0];

                    return this.push(function (a) {
                        return predicate(selector(a));
                    });
                };
                break;
            case 2:
                Predicator.prototype[key] = function (selector, b) {
                    if (b === undefined) {
                        b = selector;
                        selector = function (x) {
                            return x;
                        };
                    }
                    return this.push(function (a) {
                        return predicate(selector(a), b);
                    });
                };
                break;
        }
    };

    for (var _iterator4 = _getIterator(_Object$entries(predicates)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        _loop2();
    }
} catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
        }
    } finally {
        if (_didIteratorError4) {
            throw _iteratorError4;
        }
    }
}

module.exports = exports['default'];