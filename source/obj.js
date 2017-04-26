// @flow

//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2016 Intel Corporation All Rights Reserved.
//
// The source code contained or described herein and all documents related
// to the source code ("Material") are owned by Intel Corporation or its
// suppliers or licensors. Title to the Material remains with Intel Corporation
// or its suppliers and licensors. The Material contains trade secrets and
// proprietary and confidential information of Intel or its suppliers and
// licensors. The Material is protected by worldwide copyright and trade secret
// laws and treaty provisions. No part of the Material may be used, copied,
// reproduced, modified, published, uploaded, posted, transmitted, distributed,
// or disclosed in any way without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.

type ArrayAny = Array<any>;
type Iterable = Object | ArrayAny;

export function merge(): Iterable {
  const visited = [];

  const args = new Array(arguments.length);

  for (let i = 0, l = arguments.length; i < l; i++)
    args[i] = arguments[i];

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

export const values = (x: Object) => Object.keys(x).map(key => x[key]);

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
