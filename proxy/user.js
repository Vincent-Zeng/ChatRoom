var User = require('../models').User;

exports.getUserByLoginname = function (loginname, callback) {
  User.findOne({'loginname': loginname}, callback);
}

exports.getUserByEmail = function (email, callback) {
  User.findOne({'email': email}, callback);
}

exports.getUserById = function (id, callback) {
  User.findOne({'_id': id},callback)
}

exports.newUser = function (loginname, email, passwordHash, callback) {
  var user = new User();
  user.loginname = loginname;
  user.email = email;
  user.password = passwordHash;
  user.save(callback);
}
