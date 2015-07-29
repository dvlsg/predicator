"use strict";

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Symbol$toStringTag = require('babel-runtime/core-js/symbol/to-string-tag')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var PredicatorError = (function (_Error) {
    _inherits(PredicatorError, _Error);

    function PredicatorError(message) {
        _classCallCheck(this, PredicatorError);

        _get(Object.getPrototypeOf(PredicatorError.prototype), 'constructor', this).call(this);
        if (Error.captureStackTrace && Error.captureStackTrace instanceof Function) Error.captureStackTrace(this, this.constructor);else {
            var stack = new Error().stack;
            Object.defineProperty(this, 'stack', {
                value: stack
            });
        }

        Object.defineProperty(this, 'message', {
            value: message
        });
    }

    _createClass(PredicatorError, [{
        key: 'name',
        get: function get() {
            return this.constructor.name;
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'PredicatorError';
        }
    }]);

    return PredicatorError;
})(Error);

exports['default'] = PredicatorError;
module.exports = exports['default'];