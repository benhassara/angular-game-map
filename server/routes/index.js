var express = require('express');
var router = express.Router();
var steam = require('steam-login');
var User = require('../models/user');
var mongoose = require('mongoose-q')(require('mongoose'), {spread:true});

router.get('/', function(req, res) {
  res.send(req.user === null ? 'not logged in' : 'hello ' + req.user.username).end();
});

router.get('/auth/steam', steam.authenticate(), function(req, res) {
  res.redirect('/');
});

//find user in DB or add if it doesn't exists and then send to dashboard page
router.get('/verify', steam.verify(), function(req, res) {
  var query = {'steamid': req.user.steamid};
  User.findOneAndUpdateQ(query, req.user, {upsert:true})
    .then(function (result) {res.redirect("/#/dashboard/" + req.user.steamid);})
    .catch(function (err) {res.send(err);})
    .done();
});

router.get('/logout', steam.enforceLogin('/'), function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/user/:id', function(req, res, next) {
  var query = User.where({steamid: req.params.id});
  query.findOneQ()
    .then(function(result) {res.json(result);})
    .catch(function(err) {res.send(err);})
    .done();
});

module.exports = router;
