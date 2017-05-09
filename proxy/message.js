var Message = require('../models').Message;

exports.newMessage = function (data, callback) {
  var message = new Message(data);
  message.save(callback);
}

exports.loadHistory = function (query, options, callback) {
  Message.find(query, null, options, callback)
}


exports.getUnreadNumByUserId = function (sender_id, user_id, callback) {
  Message.find({'sender_id': sender_id, 'receiver_id': user_id, 'readed': false}, function (err, messages) {
    callback(err, messages.length, sender_id, user_id)
  })
}

exports.clearUnreadStatus = function (sender_id, receiver_id, callback) {
  Message.find({'sender_id': sender_id, 'receiver_id': receiver_id}, function (err, messages) {
    for (var i in messages) {
      messages[i].readed = true
      messages[i].save(function (err) {
        if (err) {
          console.log(err)
        }
      })
    }
    callback(err)
  })
}
