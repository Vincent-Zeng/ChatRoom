var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.db, function (err) {
  if (err) {
    console.log('Connect to database %s error: %s', config.db, err.message);
  }
})

require('./user');
require('./message')

exports.User = mongoose.model('User');
exports.Message = mongoose.model('Message');
