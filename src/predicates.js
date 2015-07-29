"use strict";

export var eq     = (a, b) => a === b;
export var falsy  = (a)    => !a;
export var gt     = (a, b) => a > b;
export var gte    = (a, b) => a >= b;
export var lt     = (a, b) => a < b;
export var lte    = (a, b) => a <= b;
export var mod    = (a, b) => a % b === 0; //tbd
export var neq    = (a, b) => a !== b;
export var truthy = (a)    => !!a;
