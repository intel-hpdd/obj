// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

type ArrayAny = Array<any>;
type Iterable = Object | ArrayAny;

export function merge(...args: any[]): Iterable {
  const visited = [];

  let target = args[0];
  const numObjects = args.length;
  for (let index = 1; index < numObjects; index++)
    target = mergeItem(target, args[index]);

  return target;

  function mergeItem(lhs, rhs) {
    if (isObject(rhs)) {
      checkForCycles(rhs);

      const rhsKeys = Object.keys(rhs);
      const rhsKeysLength = rhsKeys.length;

      if (!isObject(lhs)) lhs = {};

      for (let index = 0; index < rhsKeysLength; index++) {
        const rhsKey = rhsKeys[index];
        lhs[rhsKey] = mergeItem(lhs[rhsKey], rhs[rhsKey]);
      }
    } else if (Array.isArray(rhs)) {
      lhs = cloneArray(rhs, mergeItem);
    } else {
      return rhs;
    }

    return lhs;
  }

  function checkForCycles(val) {
    if (visited.indexOf(val) >= 0) {
      visited.length = 0;
      throw new Error('Cycle detected, cannot merge.');
    }

    visited.push(val);
  }
}

export const clone = (x: Iterable): Iterable => JSON.parse(JSON.stringify(x));

type Values<T> = ({ [key: any]: T }) => T[];
export const values: Values<*> = xs => (Object.values(xs): any);

type Entries<T> = ({ [key: any]: T }) => Array<[string, T]>;
export const entries: Entries<*> = xs => (Object.entries(xs): any);

export const reduceArr = function reduce<A, B: A[]>(
  accum: () => B,
  fn: (v: A, k: string, out: B) => B,
  obj: Object
): B {
  return Object.keys(obj).reduce((out, key) => fn(obj[key], key, out), accum());
};

export const reduce = function reduce<A: Object>(
  accum: () => A,
  fn: (v: any, k: string, out: A) => A,
  obj: Object
): A {
  return Object.keys(obj).reduce((out, key) => fn(obj[key], key, out), accum());
};

export const pickBy = (
  pred: (v: any, k: string) => boolean,
  obj: Object
): Object =>
  reduce(
    () => ({}),
    (val, key: string, out: Object): Object => {
      if (pred(val, key)) out[key] = val;

      return out;
    },
    obj
  );

export const pick = (toPick: string[], obj: Object): Object =>
  pickBy((val, key: string): boolean => toPick.indexOf(key) !== -1, obj);

export const map = (fn: Function, obj: Object) =>
  reduce(
    () => ({}),
    (val, key: string, out: Object): Object => {
      out[key] = fn(val, key);
      return out;
    },
    obj
  );

export function isObject(item: any): boolean {
  let type = Object.prototype.toString.call(item);
  type = type.substring(type.indexOf(' ') + 1, type.length - 1);
  return type === 'Object';
}

function cloneArray(xs: ArrayAny, merger: Function): ArrayAny {
  const out = [];

  for (let index = 0; index < xs.length; index++)
    out[index] = merger(null, xs[index]);

  return out;
}
