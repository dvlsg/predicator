"use strict";

import { equals } from 'zana-util';
import Literal from './literal-expression.js';
import Parameter from './parameter-expression.js';
import Accessor from './accessor-expression.js';

export const BINARY_OPERATORS = {
    'DEEP_EQUAL'            : 'equal()', // not really an expression in the javascript sense.
    'EQUAL'                 : '===',
    'FALSY'                 : '!', // not binary
    'GREATER_THAN'          : '>',
    'GREATER_THAN_OR_EQUAL' : '>=',
    'LESS_THAN'             : '<',
    'LESS_THAN_OR_EQUAL'    : '<=',
    'NOT_EQUAL'             : '!==',
    'TRUTHY'                : '!!', // not binary

    '$deq'    : 'equal()',  // again, not really an expression in the javascript sense.
    '$eq'     : '===',
    '$falsy'  : '!', // not binary
    '$gt'     : '>',
    '$gte'    : '>=',
    '$lt'     : '<',
    '$lte'    : '<=',
    '$neq'    : '!==',
    '$truthy' : '!!' // not binary. make unary-expression class?
};

const FUNCTIONS = {
      [BINARY_OPERATORS.DEEP_EQUAL]            : (a, b) => equals(a, b)
    , [BINARY_OPERATORS.EQUAL]                 : (a, b) => a === b
    , [BINARY_OPERATORS.FALSY]                 : (a)    => !a // do falsy and truthy belong here? not really binarys.
    , [BINARY_OPERATORS.GREATER_THAN]          : (a, b) => a > b
    , [BINARY_OPERATORS.GREATER_THAN_OR_EQUAL] : (a, b) => a >= b
    , [BINARY_OPERATORS.LESS_THAN]             : (a, b) => a < b
    , [BINARY_OPERATORS.LESS_THAN_OR_EQUAL]    : (a, b) => a <= b
    , [BINARY_OPERATORS.NOT_EQUAL]             : (a, b) => a !== b
    , [BINARY_OPERATORS.TRUTHY]                : (a)    => Boolean(a)
    , [BINARY_OPERATORS.IN]                    : (a, b) => b.indexOf(a) > -1
};

export default class BinaryExpression {

    constructor(left, type, right) {
        // throw error if bad type?
        if (BINARY_OPERATORS.hasOwnProperty(type))
            this.type = BINARY_OPERATORS[type];
        else
            this.type = type; // or what?
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
        map.set(Literal, (x) => x.val);
        map.set(Parameter, (x, y) => y);
        map.set(Accessor, (x, y) => x.access(y));

        // a and b may or may not need to be provided, based on number of Literals.
        // there has to be a more efficient way of determining this.
        return (a, b) => {
            let l = null;
            if (left instanceof Literal)
                l = left.val;
            if (left instanceof Accessor) // is this the job of the binary expression? not really... leaving for now.
                l = left.access(a);
            if (left instanceof Parameter)
                l = a;

            let r = null;
            if (right instanceof Literal)
                r = right.val;
            if (right instanceof Accessor) // same as above.
                r = right.access(b);
            if (right instanceof Parameter)
                r = b;
            return fn(l, r);
        };
    }
}
