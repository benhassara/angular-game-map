var User = require('../models/user');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var config = require('./_openidconfig.js');
var mongoose = require('mongoose-q')(require('mongoose'), {spread:true});

passport.use(new SteamStrategy(
  {
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: config
  },
  function(identifier, profile, done) {
    User.findOneQ({ openId: identifier })
      .then(function(result) {res.json(result);})
      .catch(function(err) {res.json(err);});
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

module.exports = passport;
