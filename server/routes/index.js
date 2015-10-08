var express = require('express');
var router = express.Router();
var steam = require('steam-login');
var User = require('../models/user');
var key = require('../auth/_openidconfig.js');
var request = require('request');
var mongoose = require('mongoose-q')(require('mongoose'), {spread:true});
var async = require('async');


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

//get single user from db
router.get('/user/:id', function(req, res, next) {
  var query = User.where({steamid: req.params.id});
  query.findOneQ()
  .then(function(result) {res.json(result);})
  .catch(function(err) {res.send(err);})
  .done();
});

//get games for steam user
router.get('/games/:id', function(req, res, next) {
  var id = req.params.id;
  var gbFields = 'api_detail_url,concepts,deck,developers,id,name,publishers,original_release_date';
  var steamUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + key.STEAM + '&steamid=' + id + '&include_appinfo=1';

  // outer request, to Steam Web API
  request(steamUrl, function(error, response, body) {
    var steam = JSON.parse(body).response.games;
    var names = steam.map(function(game) {return game.name;});

    async.concat(names, function(name, callback) {
      var query = name;
      var gbUrl = 'http://www.giantbomb.com/api/search/?api_key=' + key.GIANT_BOMB + '&resources=game&format=json&query=' + query + '&field_list=' + gbFields;
      request(gbUrl, function(err, res, bdy) {
        var gb = JSON.parse(bdy);
        callback(null, gb);
      });
    },
    function(err, gbs) {
      res.json({'steam': steam, 'gb': gbs});
    }
    );
  });
});

module.exports = router;
