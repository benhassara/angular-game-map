var express = require('express');
var router = express.Router();
var steam = require('../auth/steam');

router.get('/auth/steam',
  steam.authenticate('steam'),
  function(req, res) {
});

router.get('/auth/steam/return',
  steam.authenticate(
    'steam',
    {failureRedirect: '/login'},
    function(req, res) {
      res.redirect('/');
    })
);
module.exports = router;
