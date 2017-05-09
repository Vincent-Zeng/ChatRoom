var mongoose = require('mongoose');

var MessageSchema =mongoose.Schema({
  content: {type: String},
  sender_id: {type: String},
  sender_name: {type: String},
  sender_avatar: {type: String,default:"/static/anonym.jpg"},
  receiver_id: {type: String},
  readed: {type:Boolean, default: false},
  created: {type:Date, default: Date.now}
})

MessageSchema.index({sender_id: 1});
MessageSchema.index({receiver_id: 1});

mongoose.model('Message', MessageSchema);
