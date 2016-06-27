var express = require('express'),
  R = require('ramda'),
  Promise = require('bluebird'),
  router = express.Router(),
  bluemix = new (require('../lib/bluemix'))();

/* GET home page. */
router.get('/', function(req, res, next) {
  bluemix.getApps().then( (data) => {
    res.render('index', {
      title: 'Bluemix Status',
    });
  })
});

router.get('/api/bluemix', function(req, res, next) {
  bluemix.getApps().then(function(apps){
    // Format Data Structure and get Detailed Stats
    var getAppData = function() {
      var promises = R.map(function(data){
        var app = {
          guid: data.metadata.guid,
          name: data.entity.name,
          url: data.metadata.url,
          state: data.entity.state,
          instance_count: data.entity.instances
        };

        return bluemix.getSpace(data.entity.space_guid)
        .then(function(space){
          app.space = {
            name: space.entity.name,
            guid: space.metadata.guid
          }
          return app;
        })
        .then(function(app){
          if (app.state === 'STARTED') {
            return bluemix.getStats(data.metadata.guid)
            .then(function(stats){
              app.instances = stats;
              return app;
            });
          }
          else {
            return app;
          }
        })
      }, apps)

      return Promise.all(promises);
    };

    getAppData().done(function(final){
      res.send({data: final});
    });
  });
});

module.exports = router;
