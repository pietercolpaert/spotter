var Promise = require("bluebird");
var _ = require('lodash');
var rp = require('request-promise');

var spotter = Promise.method(function (data, property, options) {
  return new Promise(function (resolve, reject) {
    var opts = (options == undefined) ? {} : options;
    var opts = _.defaults(opts, { pace: false });
    var parsedObjects = [];

    if (opts.pace) {
      var pace = require('pace')(data.length);
    }

    var current = Promise.fulfilled();
    Promise.all(data.map(function(object) {
      current = current.then(function() {
        return rp.head({uri: object[property], resolveWithFullResponse: true})
          .then(function (response) {
            object.response = response.statusCode;
            if (opts.pace) {
              pace.op();
            }
            return object;
          }).catch(function (error) {
          // Handle error
        });
      });
      return current;
    })).then(function(results) {
      resolve(results)
    });
  });
});

module.exports = spotter;
