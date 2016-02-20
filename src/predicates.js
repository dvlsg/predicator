"use strict";

export const eq     = (a, b) => a === b;
export const exists = (a)    => a !== undefined && a !== null;
export const falsy  = (a)    => !a;
export const gt     = (a, b) => a > b;
export const gte    = (a, b) => a >= b;
export const lt     = (a, b) => a < b;
export const lte    = (a, b) => a <= b;
export const neq    = (a, b) => a !== b;
export const truthy = (a)    => Boolean(a);
export const _in    = (a, b) => b.indexOf(a) > -1; // type safety?
export const nin    = (a, b) => b.indexof(a) === -1;
