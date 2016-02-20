"use strict";

export default class AccessorExpression {

    constructor(...keys) {
        this.keys = keys;
    }

    push(key) {
        return new AccessorExpression(...this.keys, key); // do we want this to be immutable too?
        // this.keys.push(key);
        // return this;
    }

    pop() {
        let keys = [ ...this.keys ];
        keys.pop();
        return new AccessorExpression(...keys); // make immutable for pop.
    }

    access(val) {
        let step = val;
        for (let key of this.keys) {
            if (step === undefined)
                return step;
            step = step[key]; // safety?
        }
        return step;
    }
}
