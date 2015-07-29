"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var eq = function eq(a, b) {
  return a === b;
};
exports.eq = eq;
var falsy = function falsy(a) {
  return !a;
};
exports.falsy = falsy;
var gt = function gt(a, b) {
  return a > b;
};
exports.gt = gt;
var gte = function gte(a, b) {
  return a >= b;
};
exports.gte = gte;
var lt = function lt(a, b) {
  return a < b;
};
exports.lt = lt;
var lte = function lte(a, b) {
  return a <= b;
};
exports.lte = lte;
var mod = function mod(a, b) {
  return a % b === 0;
}; //tbd
exports.mod = mod;
var neq = function neq(a, b) {
  return a !== b;
};
exports.neq = neq;
var truthy = function truthy(a) {
  return !!a;
};
exports.truthy = truthy;