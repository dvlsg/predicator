/* eslint no-loop-func: 0 */

"use strict";

import check from 'zana-check';
import {
    inspect
} from 'zana-util';
import Node from './tree-node.js';
import * as predicates from './predicates.js';
import PredicatorError from './predicator-error.js';

let log = ::console.log; // eslint-disable-line no-unused-vars

// const EQ  = '$eq';
// const LT  = '$lt';
// const LTE = '$lte';
// const GT  = '$gt';
// const GTE = '$gte';
// const MOD = '$mod';
// const AND = '$and';
// const OR  = '$or';
// const NOT = '$not';

const OPERATORS = {
    COMPARISON: new Map([
        ['$eq',  'eq'],
        ['$lt',  'lt'],
        ['$lte', 'lte'],
        ['$gt',  'gt'],
        ['$gte', 'gte'],
        ['$mod', 'mod'],
        ['$neq', 'neq']
    ]),
    LOGICAL: new Map([
        ['$and', 'and'],
        ['$or', 'or'],
        ['$not', 'or']
    ])
};

function branch(pred, val) {
    if (!pred.head) {
        let node = new Node(val);
        pred.head = node;
        pred.current = node;
    }
    else {
        let node = new Node(val);
        pred.current.add(node);
        pred.current = node;
    }
    return pred;
}

function leaf(pred, val) {
    if (!pred.head)
        branch(pred, '$and'); // proper data type later
    pred.current.add(val);
    pred.hasLeaf = true; // better way?
    return pred;
}

function iterate(node, val) {
    if (!node.isLeaf()) {
        let res,
            child,
            logical = node.val;
        if (logical === '$not') {
            res = true;
            for (let i = 0; i < node.children.length; i++) {
                child = node.children[i];
                res = !(iterate(child, val)); // ^ flip
                if (res)
                    return res; // short circuit on false? or true? or dependent? :\
            }
            return res;
        }
        else {
            for (let i = 0; i < node.children.length; i++) {
                child = node.children[i];
                res = iterate(child, val);
                if (!res && logical === '$and') // short circuit and
                    return false;
                if (res && logical === '$or') // short circuit or
                    return true;
            }
            return logical === '$and'; // return false for $or, true for $and
        }
    }
    else {
        let fn = node.val;
        return fn(val);
    }
}

function parse(pred, current) {
    if (current instanceof Object) {
        let entries = Object.entries(current);
        for (let [key, val] of entries) {
            if (OPERATORS.LOGICAL.has(key)) {
                branch(pred, key);
                if (check.instance(val, Array)) {
                    for (let logicalVal of val)
                        parse(pred, logicalVal);
                }
                else
                    parse(pred, val);
                pred.up();
            }
            else if (val instanceof Object) {
                for (let [operatorKey, actualVal] of Object.entries(val)) {
                    if (OPERATORS.COMPARISON.has(operatorKey))
                        pred[OPERATORS.COMPARISON.get(operatorKey)](x => x[key], actualVal); //eslint-disable-line no-loop-func
                    // hole?
                }
            }
            else
                pred.eq(x => x[key], val);
        }
    }
}

export default class Predicator {

    constructor() {
        this.head = null;
        this.current = null;
    }

    build() {
        if (!this.head)
            throw new PredicatorError(`Predicator#build() was called before an ExpressionTree was made!`);
        if (!this.hasLeaf)
            throw new PredicatorError(`Predicator#build() was called before the ExpressionTree had leaves!`);
        return val => iterate(this.head, val);
    }

    static parse(obj) {
        let pred = new Predicator();
        if (!obj || !check.is(obj, Object))
            throw new PredicatorError(`Predicator.parse() received an invalid definition! Received: ${inspect(obj)}`);
        parse(pred, obj);
        let built = pred.build();
        return built;
    }

    not() {
        if (!this.head)
            branch(this, '$and');
        return branch(this, '$not');
    }

    and() {
        return branch(this, '$and');
    }

    or() {
        return branch(this, '$or');
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

// consider using a weakmap, as well
for (let [key, predicate] of Object.entries(predicates)) {
    switch(predicate.length) {
        case 1:
            Predicator.prototype[key] = function(selector = x => x) {
                return this.push(a => predicate(selector(a)));
            };
            break;
        case 2:
            Predicator.prototype[key] = function(selector, b) {
                if (b === undefined) {
                    b = selector;
                    selector = x => x;
                }
                return this.push(a => predicate(selector(a), b));
            };
            break;
    }
}
