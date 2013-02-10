var besync = require('..');

describe('besync', function () {
  describe('waterfall', function () {
    it('works with 0 functions', function (done) {
      besync.waterfall(done, []);
    });

    it('works with 1 function', function (done) {
      var mochaRun = this;
      besync.waterfall(function(err, x) {
        if (x != 1) {
          done(new Error('should have gotten 1'));
        } else {
          done();
        }
      }, [
        function(next) {return next(null, 1);},
      ], this);
    });

    it('works with 2 functions', function (done) {
      var mochaRun = this;
      besync.waterfall(done, [
        function(next) {return next(null, 1);},
        function(x, next) {
          if (x != 1) {
            next(new Error('should have gotten 1'));
          } else if (this != mochaRun) {
            next(new Error('should have maintained this'));
          } else {
            next();
          }
        }
      ], this);
    });
  });
});
