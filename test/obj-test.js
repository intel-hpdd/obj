// @flow

import {env, jasmine} from '../test';
const {describe, beforeEach, it, expect} = env;

import * as obj from '../obj';
import * as fp from 'intel-fp';

describe('obj module', () => {
  describe('merge function', () => {

    var obj1, obj2, obj3, obj4, obj5;
    beforeEach(() => {
      obj1 = {
        name: 'will',
        age: 33,
        hobby: 'surfing',
        prop1: {
          prop2: {
            some: 'val',
            foo: 'bar',
            prop3: {
              key: 'val'
            }
          }
        }
      };

      obj2 = {
        address: '123 ocean ave',
        state: 'FL',
        zip: '33617'
      };

      obj3 = {
        age: 2,
        make: 'gmc',
        model: 'terrain',
        prop1: {
          prop2: {
            baz: 'tastic',
            prop3: {
              a: '1',
              z: {
                turbo: true
              }
            }
          }
        }
      };

      obj4 = {
        key: 'val',
        names: ['will', 'nerissa', 'mariela', 'kali'],
        transportation: ['bike', 'car', 'bus'],
        fn () {
          return 1;
        }
      };

      obj5 = {
        names: ['joe', 'wayne', 'will'],
        transportation: {
          healthy: {
            bike: ['mountain', 'trick']
          },
          unhealthy: {
            car: ['2door', '4door'],
            bus: ['city', 'school']
          }
        }
      };
    });

    it('should throw an error when the rhs has a cycle', () => {
      // $FlowIgnore
      obj3.prop1.prop2.prop3 = obj3.prop1;
      expect(() => {
        obj.merge(obj1, obj3);
      }).toThrow(new Error('Cycle detected, cannot merge.'));
    });

    it('should merge two objects together with a mutually exclusive domain of keys', () => {
      obj.merge(obj1, obj2);
      expect(obj1).toEqual(
        {
          name: 'will',
          age: 33,
          hobby: 'surfing',
          prop1: {
            prop2: {
              some: 'val',
              foo: 'bar',
              prop3: {
                key: 'val'
              }
            }
          },
          address: '123 ocean ave',
          state: 'FL',
          zip: '33617'
        }
      );
    });

    it('should merge objects together with overlapping keys', () => {
      obj.merge(obj1, obj2, obj3, obj4);
      expect(obj1).toEqual({
        name: 'will',
        age: 2,
        hobby: 'surfing',
        address: '123 ocean ave',
        state: 'FL',
        zip: '33617',
        prop1: {
          prop2: {
            some: 'val',
            foo: 'bar',
            baz: 'tastic',
            prop3: {
              key: 'val',
              a: '1',
              z: {
                turbo: true
              }
            }
          }
        },
        fn: jasmine.any(Function),
        make: 'gmc',
        model: 'terrain',
        key: 'val',
        names: ['will', 'nerissa', 'mariela', 'kali'],
        transportation: ['bike', 'car', 'bus']
      });
    });

    it('should verify that objects passed in after the first argument are not mutated', () => {
      obj.merge(obj1, obj3);
      expect(obj3).toEqual({
        age: 2,
        make: 'gmc',
        model: 'terrain',
        prop1: {
          prop2: {
            baz: 'tastic',
            prop3: {
              a: '1',
              z: {
                turbo: true
              }
            }
          }
        }
      });
    });

    it('should be variadic', () => {
      var result = obj.merge({}, {}, {}, {}, {}, {}, {}, { a: 1 }, { b: 2 }, obj1, { name: 'robert' });
      expect(result).toEqual({
        a: 1,
        b: 2,
        name: 'robert',
        age: 33,
        hobby: 'surfing',
        prop1: {
          prop2: {
            some: 'val',
            foo: 'bar',
            prop3: {
              key: 'val'
            }
          }
        }
      });
    });

    it('should function as a "defaults" operation', () => {
      var defaults = {
        a: 1,
        b: 2
      };

      var newObj = {
        a: 7,
        key: 'val'
      };

      var result = obj.merge({}, defaults, newObj);
      expect(result).toEqual({
        a: 7,
        b: 2,
        key: 'val'
      });
    });

    it('should return the same object if it is only passed one object', () => {
      var result = obj.merge(obj1);
      expect(result).toEqual(obj1);
    });

    it('should return undefined if it doesn\'t receive any args', () => {
      expect(obj.merge()).toEqual(undefined);
    });

    it('should overwrite arrays', () => {
      obj.merge(obj4, obj5);
      expect(obj4).toEqual({
        key: 'val',
        names: ['joe', 'wayne', 'will'],
        transportation: {
          healthy: {
            bike: ['mountain', 'trick']
          },
          unhealthy: {
            car: ['2door', '4door'],
            bus: ['city', 'school']
          }
        },
        fn: jasmine.any(Function)
      });
    });

    it('should be a reference to the original object and not a copy', () => {
      var result = obj.merge(obj1, obj2);
      expect(result).toBe(obj1);
    });

    ['7', 7, [1, 2, 3], () => {
    }, true
    ].forEach((item) => {
      it('should overwrite the object if you pass in a non object', () => {
        expect(obj.merge(obj1, item)).toEqual(item);
      });
    });

    it('should not preserve any object references', () => {
      var x = {};
      var y = { foo: { bar: 'baz' } };

      obj.merge(x, y);

      expect(x.foo).not.toBe(y.foo);
    });

    it('should not preserve nested object references', () => {
      var x = {
        foo: {}
      };

      var y = {
        foo: {
          bar: {
            baz: 'bap'
          }
        }
      };

      obj.merge(x, y);

      expect(x.foo.bar).not.toBe(y.foo.bar);
    });

    it('should not preserve any array references', () => {
      var x = {};
      var y = { foo: [1, 2] };

      obj.merge(x, y);

      expect(x.foo).not.toBe(y.foo);
    });

    it('should not preserve obj references inside arrays', () => {
      var x = {};
      var y = { foo: [{}] };

      obj.merge(x, y);

      expect(x.foo[0]).not.toBe(y.foo[0]);
    });
  });

  describe('clone function', () => {

    var obj1, items;
    beforeEach(() => {
      obj1 = {
        name: 'will',
        residence: {
          address: '123 ocean dr.',
          state: 'FL'
        },
        prop1: {
          prop2: {
            prop3: {
              key: 'val'
            }
          }
        },
        phone: '1234567890'
      };

      items = ['sword', 'shield', 'potion'];
    });

    it('should clone an object', () => {
      expect(obj.clone(obj1)).toEqual({
        name: 'will',
        residence: {
          address: '123 ocean dr.',
          state: 'FL'
        },
        prop1: {
          prop2: {
            prop3: {
              key: 'val'
            }
          }
        },
        phone: '1234567890'
      });
    });

    it('should clone an array', () => {
      expect(obj.clone(items)).toEqual(['sword', 'shield', 'potion']);
    });

    it('should be a copy of the object and not a reference to it', () => {
      expect(obj.clone(obj1)).not.toBe(obj1);
    });

    it('should be a copy of the array and not a reference to it', () => {
      expect(obj.clone(items)).not.toBe(items);
    });

    it('should throw an error if a cycle is detected', () => {
      // $FlowIgnore
      obj1.prop1.prop2.prop3 = obj1.prop1;
      expect(() => obj.clone(obj1))
        .toThrowError(TypeError, 'Converting circular structure to JSON');
    });

    it('should not serialize non-serializable items', () => {
      // $FlowIgnore
      obj1.prop1 = () =>

      expect(obj.clone(obj1)).toEqual({
        name: 'will',
        residence: {
          address: '123 ocean dr.',
          state: 'FL'
        },
        phone: '1234567890'
      });
    });
  });

  describe('values function', () => {
    var myObj;
    beforeEach(() => {
      myObj = {
        foo: 7,
        bar: 'name',
        baz: true
      };
    });

    it('should extract the values from the object', () => {
      expect(obj.values(myObj)).toEqual([7, 'name', true]);
    });

    it('should return the array back if an array is passed in', () => {
      expect(obj.values([6, 3])).toEqual([6, 3]);
    });
  });

  describe('pick function', () => {
    var o;

    beforeEach(() => {
      o = {
        foo: 'bar',
        bar: 'baz',
        bap: 'boom'
      };
    });

    it('should exist on obj', () => {
      expect(obj.pick).toEqual(jasmine.any(Function));
    });

    it('should be curried', () => {
      expect(obj.pick(fp.__, fp.__)).toEqual(jasmine.any(Function));
    });

    it('should return the picked values', () => {
      expect(obj.pick(['foo', 'bar'], o)).toEqual({
        foo: 'bar',
        bar: 'baz'
      });
    });

    it('should return nothing if no matches', () => {
      expect(obj.pick(['blap'], o)).toEqual({});
    });
  });

  describe('pickBy', () => {
    var o;

    beforeEach(() => {
      o = {
        foo: 'bar',
        bar: 'baz',
        bap: 'boom'
      };
    });

    it('should exist on obj', () => {
      expect(obj.pickBy).toEqual(jasmine.any(Function));
    });

    it('should be curried', () => {
      expect(obj.pickBy(fp.__, fp.__)).toEqual(jasmine.any(Function));
    });

    it('should pick out objects that pass predicate', () => {
      var res = obj
        .pickBy(
          fp.eqFn(fp.identity, fp.view(fp.lensProp('length')), 3), o
        );

      expect(res).toEqual({
        foo: 'bar',
        bar: 'baz'
      });
    });

    it('should return an object if nothing passes', () => {
      expect(obj.pickBy(fp.always(false), o)).toEqual({});
    });
  });

  describe('map', () => {
    var o;

    beforeEach(() => {
      o = {
        foo: 'bar',
        bar: 'baz',
        bap: 'boom'
      };
    });

    it('should exist on obj', () => {
      expect(obj.map).toEqual(jasmine.any(Function));
    });

    it('should be curried', () => {
      expect(obj.map(fp.__, fp.__)).toEqual(jasmine.any(Function));
    });

    it('should map values', () => {
      var concat = fp.curry(2, ''.concat.bind(''));
      var res = obj.map(concat(fp.__, 't'), o);

      expect(res).toEqual({
        foo: 'bart',
        bar: 'bazt',
        bap: 'boomt'
      });
    });

    describe('reduce', () => {
      var o;

      beforeEach(() => {
        o = {
          foo: 'bar',
          bar: 'baz',
          bap: 'boom'
        };
      });

      it('should exist on obj', () => {
        expect(obj.reduce).toEqual(jasmine.any(Function));
      });

      it('should be curried', () => {
        expect(obj.reduce(fp.__, fp.__, fp.__)).toEqual(jasmine.any(Function));
      });

      it('should keep if reducer returns an object', () => {
        const result = obj.reduce({}, (val, key, out) => {
          if (key === 'foo')
            out.boom = 'blaaah';

          return out;
        }, o);

        expect(result).toEqual({
          boom: 'blaaah'
        });
      });

      it('should return nothing if reducer does not return obj', () => {
        var result = obj.reduce({}, fp.always(null), o);

        expect(result).toEqual({});
      });

      it('should reduce an object to an array', () => {
        var result = obj.reduce(fp.always([]), (val, key, arr) => {
          arr.push([key, val]);
        }, o);

        expect(result).toEqual([
          ['foo', 'bar'], ['bar', 'baz'], ['bap', 'boom']
        ]);
      });
    });
  });
});
