
module.exports = function(app){
  app.use(function*(){
    if ('GET' != this.method) return;
    if ('/mw.js' != this.path) return;
    this.body = 'window.mw = true';
    this.type = 'js';
  });
};
