var express = require('express');
var router = express.Router();
var steam = require('steam-login');
var User = require('../models/user');
var Game = require('../models/game');
var keys = {
  STEAM: process.env.STEAM,
  GIANT_BOMB: process.env.GIANT_BOMB
};
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
  query.findOne()
  .populate('games')
  .execQ()
  .then(function(result) {res.json(result);})
  .catch(function(err) {res.send(err);})
  .done();
});

/** Get a single game from the collection by Steam appid */
router.get('/game/:appid', function(req, res, next) {
  var appid = req.params.appid;
  var query = {'steam.appid': appid};
  Game.findOneQ(query)
  .then(function(game) {
    res.json(game);
  })
  .catch(function(err) {
    res.json(err);
  })
  .done();
});

/* Get a User's populated game list from DB */
router.get('/user/games/:id', function(req, res, next) {
  var query = User.where({steamid: req.params.id});
  query.findOne()
  .populate('games')
  .execQ()
  .then(function(user) {
    res.json(user.games);
  })
  .catch(function(err) {
    res.json({
      message: 'Error encountered while looking for this user\'s games.',
      error: err
    });
  });
});

/** Get games from user's Steam account, and associated data from Giant Bomb */
router.get('/games/:id', function(req, res, next) {
  var steamid = req.params.id;
  var gbFields = 'api_detail_url,concepts,deck,developers,id,name,publishers,original_release_date';
  var steamUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + keys.STEAM + '&steamid=' + steamid + '&include_appinfo=1';

  // outer request, to Steam Web API
  request(steamUrl, function(error, response, body) {
    var steam = JSON.parse(body).response.games;
    var names = steam.map(function(game) {return game.name;});

    async.concat(names, function(name, callback) {
      var searchQuery = name;
      var gbSearchUrl = 'http://www.giantbomb.com/api/search/?api_key=' + keys.GIANT_BOMB + '&resources=game&format=json&query=' + searchQuery + '&field_list=' + gbFields;
      // use either Giant Bomb search endpoint or direct game endpoint
      var gbUrl = mustHandle(name) ? getGameDirectly(name, gbFields) : gbSearchUrl;
      // inner request to Giant Bomb API to fetch data on each game
      request(gbUrl, function(err, res, bdy) {
        var gb = JSON.parse(bdy);
        var gameData = gb.results.length ? gb.results[0] : gb.results;
        callback(null, gb);
      });
    },
    function(err, gbs) {
      var gbRes = gbs.map(function(gb) {
        return gb.results.length ? gb.results[0] : gb.results;
      });
      res.json({'steam': steam, 'gb': gbRes});
    });
  });
});

/** Get achievements for a game from Steam */
router.get('/game/:appid/:steamid/achievements', function(req, res, next) {
  var appid = req.params.appid;
  var steamid = req.params.steamid;
  var url = 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=' + appid + '&key=' + keys.STEAM + '&steamid=' + steamid + '&l=en';

  request(url, function(error, response, body) {
    res.json(JSON.parse(body).playerstats);
  });
});

/* Iterate over an array of games, add to Games collection if new */
router.post('/games', function (req, res, next) {
  var games = mapGamesForMongo(req.body);
  // var saved = [];

  // add to the Games collection
  async.concat(games, function(game, callback) {
    new Game(game).saveQ()
    .then(function(result) {
      if (result[0].steam.appid === game.steam.appid.toString()) {
        callback(null, result[0]);
      }
    })
    .catch(function(err) {
      /* error code 11000 means that there's already a Game in
       * the database with the same appid */
      if (err.code === 11000) {
        console.log('Item is already in the database.');
        callback(null, null);
      }
      else {
        callback(err);
      }
    })
    .done();
  }, function(err, games) {
    if (err) { res.json({error: err}); }
    /* filter out any null values that may occur due to
     * attempting to save a game that already exists */
    var filteredGames = games.filter(function(game) { return game !== null; });
    res.json({
      numSaved: filteredGames.length,
      games: filteredGames
    });
  });
});

/** Update a User's list of games in the DB */
router.post('/user/games/:steamid', function(req, res, next) {
  var games = {'games': mapGamesForUser(req.body)};
  var userQuery = {steamid: req.params.steamid};
  var options = {
    upsert: true,
    new: true
  };

  User.findOneAndUpdateQ(userQuery, games, options)
  .then(function(result) {
    return result.populateQ('games');
  })
  .then(function(populatedUser) {
    res.json({
      message: 'User games updated successfully!',
      success: true,
      user: populatedUser
    });
  })
  .catch(function(err) {
    res.json(err);
  })
  .done();
});

/** Get a User's list of games from Steam */
router.get('/steamlist/:steamid', function(req, res, next) {
  var id = req.params.steamid;
  var steamUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + keys.STEAM + '&steamid=' + id;

  request(steamUrl, function(error, response, body) {
    var games = JSON.parse(body).response.games;
    res.json({gameList: games});
  });
});

module.exports = router;

/*** Helpers ***/

/** Maps incoming array to an array of their ObjectIds.
 * assumes these are games already in the Games collection,
 * and therefore have ObjectIds. */
function mapGamesForUser(gamesArray) {
  return gamesArray.map(function(game) {
    return game._id;
  });
}

/** Maps the incoming array to the Game schema. */
function mapGamesForMongo(gamesArray) {
  var newGames = gamesArray.filter(function(game) {
    return game._id === undefined;
  });
  return newGames.map(function(game) {
    return {
      gb: {
        api_detail_url: game.gb.api_detail_url,
        deck: game.gb.deck,
        id: game.gb.id,
        name: game.gb.name,
        original_release_date: game.gb.original_release_date
      },
      steam: {
        appid: game.steam.appid,
        name: game.steam.name,
        img_logo_url: game.steam.img_logo_url
      }
    };
  });
}

/** Determines whether the game is one that has to be handled by getGameDirectly */
function mustHandle(steamName) {
  var names = ['Uplink', 'Arma 2', 'Arma 2: Operation Arrowhead', 'Arma 2: Operation Arrowhead Beta (Obsolete)', 'Arma 2: DayZ Mod', 'Patch testing for Chivalry'];
  if (names.indexOf(steamName) !== -1) { return true; }
  return false;
}

/** Deals with some discrepancies between the GB database and Steam's */
function getGameDirectly(steamName, fieldList) {
  // model is {steamAppName: giantBombId - the unique identifier in the GB database}
  var names = {
    'Uplink': '3030-389',
    'Arma 2': '3030-21528',
    'Arma 2: Operation Arrowhead': '3030-27936',
    'Arma 2: Operation Arrowhead Beta (Obsolete)': '3030-27936',
    'Arma 2: DayZ Mod': '3030-39256',
    'Patch testing for Chivalry': '3030-38006'
  };
  return 'http://www.giantbomb.com/api/game/' + names[steamName] + '/?api_key=' + keys.GIANT_BOMB + '&format=json&field_list=' + fieldList;
}
