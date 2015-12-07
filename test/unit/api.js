/* jshint esnext: true */
/* globals require, process, global */

var picc = require('../../js/src/picc');
var assert = require('assert');
var extend = require('extend');

const DEFAULT_API_URL = 'https://api.data.gov/ed/collegescorecard/v1/';

// expected default parameters
const EXPECTED_DEFAULTS = {
  '2013.student.size__range': '0..',
  'school.degrees_awarded.predominant__range': '2..3',
  'school.operating': '1'
};

var xhr = require('xmlhttprequest');
// make XMLHttpRequest available to d3
global.XMLHttpRequest = xhr.XMLHttpRequest;

// use the API_BASE_URL environment variable,
// or production API by default
picc.API.url = process.env.API_BASE_URL || DEFAULT_API_URL;

// XXX you'll need to set the API_KEY environment varible
// for this to work
picc.API.key = process.env.API_KEY;

/**
 * Merge defaults into a set of parameters and optionally exclude one
 * or more named parameters from the result.
 *
 * @param Object  params    an object literal of API parameters
 * @param Array   [except]  an optional list of keys to exclude from
 *                          the resulting object
 * @return Object
 */
var fromDefaults = function(params, except) {
  params = extend({}, EXPECTED_DEFAULTS, params);
  if (except) {
    except.forEach(function(key) {
      delete params[key];
    });
  }
  return params;
};

describe('picc.API', function() {
  // 10-second timeout on API requests
  this.timeout(10000);

  it('can request stuff', function(done) {
    var params = {'school.name': 'appalachian'};
    picc.API.get('schools/', params, function(error, data) {
      assert.ok(!error);
      assert.ok(data.results.length > 1,
                'results: ' + data.results.length);
      done();
    });
  });
});

/**
 * picc.form.prepareParams() is the function that we pass the search
 * form input values to to generate the right API parameters.
 */
describe('picc.form.prepareParams()', function() {
  var prep = picc.form.prepareParams;

  it('defaults: `size > 0`, `preddeg = 2..3`, `curroper = 1`', function() {
    assert.deepEqual(prep({}), EXPECTED_DEFAULTS);
  });

  it('uses "school.name" instead of "name"', function() {
    assert.deepEqual(prep({name: 'foo'}), fromDefaults({
      'school.name': 'foo'
    }));
  });

  describe('majors', function() {

    it('can query associates degrees', function() {
      assert.deepEqual(prep({
        degree: 'a',
        major: 'science_technology'
      }), fromDefaults({
        'school.degrees_awarded.predominant': '2',
        '2013.academics.program.assoc.science_technology__range': '1..'
      }, [
        'school.degrees_awarded.predominant__range'
      ]));
    });

  });

});
