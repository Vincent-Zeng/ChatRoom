var eventproxy = require('eventproxy')
var UserProxy = require('../proxy').User
var MessageProxy = require('../proxy').Message
var userSocket = {}
var liveUser = {}
var hopeConnect = null

exports.chat = function (io) {
  io.on('connection', function (socket) {
    socket.on('login', function () {
      var user_id = socket.request.session.user._id
      userSocket[user_id] = socket
      clearTimeout(hopeConnect)
      if (!liveUser.hasOwnProperty(user_id)) {
        liveUser[user_id] = user_id
      }

      for (var i in userSocket) {
        MessageProxy.getUnreadNumByUserId(user_id, i, function (err, mesNum, user_id, receiver_id) {

          UserProxy.getUserById(user_id, function(err, user) {
            if (mesNum > 99) {
              mesNum = '99+'
            }
            if (receiver_id !== user_id ) {

              userSocket[receiver_id].emit('message',{
                who: user_id,
                  user: user,
                  dowhat: 'login',
                  unreadNum: mesNum
              })
            }
          })
        })
      }
    })

    socket.on('chat', function (data) {
      if (data.type !== 'img') {
        data.content = data.content.replace(/\n/g,"<br/>").replace(/\s/g,"&nbsp;")
      }
      var online = false
      if (liveUser[data.receiver_id] === data.receiver_id) {
        online = true
      }

      var model = {
        sender_id: socket.request.session.user._id,
        sender_name: data.sender_loginname,
        sender_avatar: data.sender_avatar,
        receiver_id: data.receiver_id,
        content: data.content
      }
      var ep = new eventproxy()
      MessageProxy.newMessage(model,function (err, message) {
        if (err) {
          return
        } else {
          ep.emit('message-saved', model)
        }
      })

      ep.on('message-saved', function (mes) {
        if (online || data.receiver_id === null) {
          let message = {
            sender_id: socket.request.session.user._id,
            sender_loginname: data.sender_loginname,
            sender_avatar: mes.sender_avatar,
            receiver_id: data.receiver_id,
            content: data.content,
            dowhat: 'chat'
          }
          if (message.receiver_id === null) {
            socket.emit('message',message)
            socket.broadcast.emit('message',message)
          } else {
            if (message.receiver_id !== message.sender_id) {
              userSocket[message.receiver_id].emit('message', message)
            }
            socket.emit('message', message)
          }
        }
      })
    })

    socket.on('live-user', function (data) {
      var length = 0
      var liveUserDetail = []
      for (var user_id in liveUser) {
        length++
      }
      var ep = new eventproxy()
      ep.after('one-user-load',length, function () {
        socket.emit('message', {
          dowhat: 'live-user',
          liveUserDetail: liveUserDetail
        })
      })
      for (var i in liveUser) {
        MessageProxy.getUnreadNumByUserId(liveUser[i], socket.request.session.user._id, function (err, mesNum, user_id) {
          UserProxy.getUserById(user_id, function(err, user) {
            if (mesNum > 99) {
              mesNum = '99+'
            }
            let data = {
              loginname: user.loginname,
              avatar: user.avatar,
              user_id: user._id,
              currentChattingUser: false,
              unreadNum: mesNum
            }
            liveUserDetail.push(data)
            ep.emit('one-user-load')
          })
        })
      }

    })

    socket.on('load-history', function (data) {
      var user_id_me = socket.request.session.user._id
      var user_id = data.user_id
      var skipNum = new Number(data.page)*10
      var query = {
        $or: [
          {
            'receiver_id': user_id_me,
            'sender_id': user_id
          },
          {
            'receiver_id': user_id,
            'sender_id': user_id_me
          }
        ]
      }
      if (user_id === null) {
        query = {
          'receiver_id': null
        }
      }
      var options = {
        skip: skipNum,
        limit: 10,
        sort: '-created'
      }
      MessageProxy.loadHistory(query, options, function (err, messages) {
        let data = {
          dowhat: 'load-history',
          messages: messages
        }
        socket.emit('message', data)
      })
    })

    socket.on('ice_candidate', function (data) {
      socket.broadcast.emit('ice_candidate', data)
    })

    socket.on('offer', function (data) {
      socket.broadcast.emit('offer', data)
    })

    socket.on('answer', function (data) {
      socket.broadcast.emit('answer', data)
    })

    socket.on('req-video', function (data) {
      let message = {
        sender_id: socket.request.session.user._id,
        dowhat: 'req-video',
        loginname: data.loginname,
        audioOnly: data.audioOnly
      }
      userSocket[data.receiver_id].emit('message', message)
    })

    socket.on('acc-video', function (data) {
      let message = {
        sender_id: socket.request.session.user._id,
        dowhat: 'acc-video',
        loginname: data.loginname,
        accept: data.accept
      }
      userSocket[data.receiver_id].emit('message', message)
    })

    socket.on('close-video', function (data) {
      let message = {
        dowhat: 'close-video'
      }
      userSocket[data.receiver_id].emit('message', message)
    })

    socket.on('in-media', function (data) {
      let message = {
        dowhat: 'in-media'
      }
      userSocket[data.receiver_id].emit('message', message)
    })

    socket.on('disconnect', function () {
      var user_id = socket.request.session.user._id
      delete liveUser[user_id]
      delete userSocket[user_id]
      hopeConnect = setTimeout(function () {
        socket.broadcast.emit('message', {
          dowhat: 'logout',
          who: user_id
        })
      }, 3000)
    })

    socket.on('clear-unread-status', function (data) {
      MessageProxy.clearUnreadStatus(data.sender_id, socket.request.session.user._id, function (err) {
        if (err) {
          console.log(err)
        }
      })
    })

    socket.on('get-info',function (data) {
      var user_id = null
      if (!data) {
        user_id = socket.request.session.user._id
      } else {
        user_id = data
      }
      UserProxy.getUserById(user_id, function (err, user) {
        let message = {
          loginname: user.loginname,
          email: user.email,
          avatar: user.avatar,
          location: user.location,
          gender: user.gender,
          phone: user.phone,
          realname: user.realname
        }
        socket.emit('get-info', message)
      })
    })

    socket.on('update-info', function (user) {
      UserProxy.updateUser(user, function (err) {
        if (err) {
          console.log(err)
        }
      })
    })

  })
}
