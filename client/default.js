module.exports = function anonymous(obj
/**/) {

  function escape(html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  function section(obj, prop, negate, thunk) {
    var val = obj[prop];
    if (Array.isArray(val)) return val.map(thunk).join('');
    if ('function' == typeof val) return val.call(obj, thunk(obj));
    if (negate) val = !val;
    if (val) return thunk(obj);
    return '';
  };

  return "<!doctype html>\n<html>\n  <head>\n    <title>" + escape(obj.name) + "</title>\n    <link rel=\"stylesheet\" href=\"/mocha.css\">\n    <script src=\"/saucelabs.js\"></script>\n    <script src=\"/mocha.js\"></script>\n  </head>\n  <body>\n    <div id=\"mocha\"></div>\n    <script>mocha.setup(" + escape(obj.opts) + ")</script>\n    <script src=\"/build.js\"></script>\n    <script>\n      (function(){\n        var m = window.mochaPhantomJS || mocha;\n        var s = window.saucelabs || function(){};\n        s(mocha.run());\n      })();\n    </script>\n  </body>\n</html>\n"
}