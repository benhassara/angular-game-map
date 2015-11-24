var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Game = new Schema({
  gb: {
    api_detail_url: String,
    deck: String,
    id: String,
    name: String,
    original_release_date: String
  },
  steam: {
    appid: {type: String, unique: true},
    img_logo_url: String,
    name: String
  }
});

module.exports = mongoose.model('games', Game);
