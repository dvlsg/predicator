"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class PredicatorError extends Error {

    constructor(message) {
        super();
        if (Error.captureStackTrace && Error.captureStackTrace instanceof Function) Error.captureStackTrace(this, this.constructor);else {
            let stack = new Error().stack;
            Object.defineProperty(this, 'stack', {
                value: stack
            });
        }

        Object.defineProperty(this, 'message', {
            value: message
        });
    }

    get name() {
        return this.constructor.name;
    }

    get [Symbol.toStringTag]() {
        return 'PredicatorError';
    }
}
exports.default = PredicatorError;