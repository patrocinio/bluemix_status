var express = require('express'),
  R = require('ramda'),
  Promise = require('bluebird'),
  router = express.Router(),
  bluemix = new (require('../lib/bluemix'))();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Bluemix Status',
  });
});

router.get('/api/bluemix/org', function(req, res, next){
  bluemix.getOrgs().then((data) => {
    res.send(data);
  });
});

router.get('/api/bluemix/space/:space/apps', function(req, res, next){
  bluemix.getSpaceApps(req.params.space).done((promises) => {
    res.send({data: promises});
  });
});

module.exports = router;
