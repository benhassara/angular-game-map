var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  username: String,
  steamid: {type: String, unique: true},
  profile: String,
  avatar: {
    small: String,
    medium: String,
    large: String
  },
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }]
});

module.exports = mongoose.model('users', User);
