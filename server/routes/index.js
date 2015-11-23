var express = require('express');
var router = express.Router();
var steam = require('steam-login');
var User = require('../models/user');
var Game = require('../models/game');
var keys = require('../auth/_openidconfig.js');
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
  var steamUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + keys.STEAM + '&steamid=' + id + '&include_appinfo=1';

  // outer request, to Steam Web API
  request(steamUrl, function(error, response, body) {
    var steam = JSON.parse(body).response.games;
    var names = steam.map(function(game) {return game.name;});

    async.concat(names, function(name, callback) {
      var query = name;
      var gbUrl = 'http://www.giantbomb.com/api/search/?api_key=' + keys.GIANT_BOMB + '&resources=game&format=json&query=' + query + '&field_list=' + gbFields;
      request(gbUrl, function(err, res, bdy) {
        var gb = JSON.parse(bdy);
        callback(null, gb);
      });
    },
    function(err, gbs) {
      var gbRes = gbs.map(function(gb) {return gb.results[0];});
      res.json({'steam': steam, 'gb': gbRes});
    });
  });
});

// get achievements for a game from Steam
router.get('/game/:appid/:steamid/achievements', function(req, res, next) {
  var appid = req.params.appid;
  var steamid = req.params.steamid;
  var url = 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=' + appid + '&key=' + keys.STEAM + '&steamid=' + steamid + '&l=en';

  request(url, function(error, response, body) {
    res.json(JSON.parse(body).playerstats);
  });
});

router.post('/games', function (req, res, next) {
  console.log(req.body);
  var games = req.body.games;
  var count = 0;
  var saved = [];

  async.forEachOf(games, function(game, index, callback) {
    var query = game.steam.appid;
    new Game(game).saveQ()
      .then(function() {
        saved.push(game.steam.name);
        if (index === games.length -1) {
          res.json({'numSaved': saved.length, 'saved': saved});
        }
      })
      .catch(function(err) {
        console.log('Item already in database.');
        if (index === games.length -1) {
          res.json({'numSaved': saved.length, 'saved': saved});
        }
      })
      .done();
    });

});

/** Update a User's list of games */
router.post('/user:steamid', function(req, res, next) {
  var games = req.body.games;
  var query = {steamid: req.params.steamid};

  User.findOneAndUpdateQ(query, games, {upsert: true})
  .then(function(result) {
    res.json({message: 'User games updated successfully!'});
  })
  .catch(function(err) {res.json(err);})
  .done();
});

router.get('/steamlist/:steamid', function(req, res, next) {
    var steamUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + keys.STEAM + '&steamid=' + id;

    request(steamUrl, function(error, response, body) {
      console.log(JSON.parse(body));
      var games = JSON.parse(body).response.games;
      res.json({gameList: games});
    });
});

module.exports = router;
