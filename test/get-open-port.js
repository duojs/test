
var getPort = require('portfinder').getPort;

/**
 * Yieldable version of portfinder.getPort.
 */

module.exports = function*(){
  return yield new Promise(function(resolve, reject){
    require('portfinder').getPort(function(err, port){
      err ? reject(err) : resolve(port);
    });
  });
};
