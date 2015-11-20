//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2015 Intel Corporation All Rights Reserved.
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

(function (fp) {
  'use strict';

  var obj = {};

  function merge () {
    var visited = [];

    var args = new Array(arguments.length);

    for (var i = 0, l = arguments.length; i < l; i++) {
      args[i] = arguments[i];
    }

    var target = args[0];
    var numObjects = args.length;
    for (var index = 1; index < numObjects; index++) {
      target = mergeItem(target, args[index]);
    }

    return target;

    function mergeItem (lhs, rhs) {
      if (isObject(rhs)) {
        checkForCycles(rhs);

        var rhsKeys = Object.keys(rhs);
        var rhsKeysLength = rhsKeys.length;

        if (!isObject(lhs))
          lhs = {};

        for (var index = 0; index < rhsKeysLength; index++) {
          var rhsKey = rhsKeys[index];
          lhs[rhsKey] = mergeItem(lhs[rhsKey], rhs[rhsKey]);
        }
      } else if (Array.isArray(rhs)) {
        lhs = cloneArray(rhs, mergeItem);
      } else {
        return rhs;
      }

      return lhs;
    }

    function checkForCycles (val) {
      if (visited.indexOf(val) >= 0) {
        visited.length = 0;
        throw new Error('Cycle detected, cannot merge.');
      }

      visited.push(val);
    }
  }
  obj.merge = merge;

  function clone (x) {
    return JSON.parse(JSON.stringify(x));
  }
  obj.clone = clone;

  function values (x) {
    if (!isObject(x) && !Array.isArray(x))
      throw new TypeError('Obj.values must receive an object.');

    return Object.keys(x)
      .map(function mapValues (key) {
             return x[key];
           });
  }
  obj.values = values;

  var transform = fp.curry(2, function transform (fn, obj) {
    return Object.keys(obj).reduce(function reducer (out, key) {
      var r = fn(obj[key], key, out);

      return isObject(r) ? r : out;
    }, {});
  });
  obj.transform = transform;

  var pickBy = fp.curry(2, function pickBy (pred, obj) {
    return transform(function transformer (val, key, out) {
      if (pred(val, key))
        out[key] = val;

      return out;
    }, obj);
  });
  obj.pickBy = pickBy;

  var pick = fp.curry(2, function pick (toPick, obj) {
    return pickBy(function picker (val, key) {
      return toPick.indexOf(key) !== -1;
    }, obj);
  });
  obj.pick = pick;

  var map = fp.curry(2, function map (fn, obj) {
    return transform(function transformer (val, key, out) {
      out[key] = fn(val, key);
      return out;
    }, obj);
  });
  obj.map = map;

  function isObject (item) {
    var type = Object.prototype.toString.call(item);
    type = type.substring(type.indexOf(' ') + 1, type.length - 1);
    return type === 'Object';
  }

  function cloneArray (xs, merger) {
    var out = [];

    for (var index = 0; index < xs.length; index++) {
      out[index] = merger(null, xs[index]);
    }

    return out;
  }

  /* global angular */

  if (typeof module !== 'undefined')
    module.exports = obj;
  if (typeof angular !== 'undefined')
    angular.module('objModule', []).value('obj', obj);
  if (typeof window !== 'undefined')
    window.obj = obj;
}(require != null ? require('intel-fp') : window.fp));

