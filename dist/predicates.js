"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const eq = exports.eq = (a, b) => a === b;
const exists = exports.exists = a => a !== undefined && a !== null;
const falsy = exports.falsy = a => !a;
const gt = exports.gt = (a, b) => a > b;
const gte = exports.gte = (a, b) => a >= b;
const lt = exports.lt = (a, b) => a < b;
const lte = exports.lte = (a, b) => a <= b;
const neq = exports.neq = (a, b) => a !== b;
const truthy = exports.truthy = a => Boolean(a);
const _in = exports._in = (a, b) => b.indexOf(a) > -1; // type safety?
const nin = exports.nin = (a, b) => b.indexof(a) === -1;