var mongoose = require('mongoose');

var userSchema =mongoose.Schema({
  loginname: {type: String},
  email: {type: String},
  password: {type: String},

  avatar: {type: String, default:"/static/anonym.jpg"},
  location: {type: String, default: ''},
  gender: {type: String, default: ''},
  phone: {type: String, default: ''},
  realname: {type: String, default: ''},

})

userSchema.index({loginname: 1});
userSchema.index({email: 1});

mongoose.model('User', userSchema);
