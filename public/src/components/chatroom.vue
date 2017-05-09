<template>
  <div class="chat-room">
    <el-dialog title="用户资料" size="tiny" v-model="userInfo.show" class="user-info">
      <div>
        <span class="info-left">头像</span>
        <span class="info-right"><img :src="userInfo.avatar" /></span>
      </div>
      <div>
        <span class="info-left">用户名</span>
        <span class="info-right">{{ userInfo.loginname }}</span>
      </div>
      <div>
        <span class="info-left">邮箱</span>
        <span class="info-right">{{ userInfo.email }}</span>
      </div>
      <div>
        <span class="info-left">性别</span>
        <span class="info-right">{{ userInfo.gender }}</span>
      </div>
      <div>
        <span class="info-left">真实姓名</span>
        <span class="info-right">{{ userInfo.realname }}</span>
      </div>
      <div>
        <span class="info-left">电话</span>
        <span class="info-right">{{ userInfo.phone }}</span>
      </div>
      <div>
        <span class="info-left">住址</span>
        <span class="info-right">{{ userInfo.location }}</span>
      </div>

    </el-dialog>

    <audio  class="prompt-sound" src="/static/prompt.wav"></audio>

    <div class="video-box" v-show="media.videoBox">
      <div>
        <span>{{media.loginname}}</span>
        <span @click="closeVideo">X</span>
      </div>
      <video autoplay id="video" v-show="!media.audioOnly"></video>
    </div>
    <div class="prompt" v-show="media.beingCalled">
      <span>来自 <span>{{media.loginname}}</span> 的{{media.audioOnly ? "音频" : "视频"}}请求</span>
      <button @click="acceptVideo(true)">接受</button>
      <button @click="acceptVideo(false)">拒绝</button>
    </div>
    <div class="prompt" v-show="media.waiting">
      <button @click="cancelVideo">取消</button>
    </div>
    <div class="emoj-panel" v-show="emojPanel.show">
      <img v-for="item in emojPanel.emoj" :src="item.src" @click="addEmoj(item.index)" />
    </div>
    <div class="panel-wrap">
      <div class="left-panel">
        <div class="user-item" :class="{active: chatList.receiver_id === null}" data-user_id=null @click="toggleChattingUser(null)">
          <img src="./../assets/logo.png"/>
          <span class="loginname">群聊</span>
          <span class="unread-num"><el-badge class="mark" :value="chatList.groupUnreadNum" /></span>
        </div>
        <div class="user-item" :class="{active: chatList.receiver_id === user.user_id}" v-for="user in liveUser" :data-user_id="user.user_id" @click="toggleChattingUser(user.user_id)">
          <img :src="user.avatar" @click="showUserInfo($event,user.user_id)"/>
          <span class="loginname">{{user.loginname}}</span>
          <span class="unread-num"><el-badge class="mark" :value="user.unreadNum" /></span>
        </div>
      </div><div class="right-panel">
        <div class="content-panel">
          <div class="load-more" v-show="history.loadMore" @click="loadMoreHistory">
            加载更多
          </div>
          <div class="message-item" :class="{itemLeft: !item.me,itemRight: item.me}" v-for="item in chatPanel.messages">
            <div class="user-info">
              <img :src="user.avatar" v-show="item.me" />
              <img :src="item.sender_avatar" v-show="!item.me" @click="showUserInfo($event,item.sender_id)" class="cursor" />
              <span>{{item.sender_loginname}}</span>
            </div>
            <div class="content" v-html="item.content">
            </div>
          </div>
        </div>
        <div class="input-panel">
          <div class="chat-function-panel">
            <span @click="showEmojPanel"><icon name="smile-o" class="icon" scale="1.5"></icon></span>
            <label for="img-upload"><icon name="file-image-o" class="icon" scale="1.5"></icon></label>
            <input type="file" id="img-upload" accept="image/*" style="display:none"/>
            <span @click="requestMedia(true)" v-show="chatList.receiver_id !== null && chatList.receiver_id !== user.user_id"><icon name="phone" class="icon" scale="1.5"></icon></span>
            <span @click="requestMedia(false)" v-show="chatList.receiver_id !== null && chatList.receiver_id !== user.user_id"><icon name="caret-square-o-right" class="icon" scale="1.5"></icon></span>
          </div>
          <div class="input-content">
            <textarea v-model="chatPanel.send_content" class="send-box" @keyup="sendMessaage($event)"></textarea>
          </div>
          <div class="send-button">
            <span @click="sendMessaage"><icon name="send" class="icon" scale="1.5"></icon></span>
            <span @click="clearSendBox"><icon name="eraser" class="icon" scale="1.5"></icon></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import backgroundImg from '../assets/background.jpg'
  import config from '../../../config'
  import socketClient from 'socket.io-client'
  export default {
    data () {
      return {
        history: {
          loadMore: true,
          page: 0
        },
        userInfo: {
          show: false
        },
        liveUser: [],
        chatUser: [],
        chatList: {
          receiver_id: null,
          groupUnreadNum: 0
        },
        chatPanel: {
          send_content: '',
          messages: [],
          scroll: false
        },
        socket: null,
        media: {
          isCaller: false,
          waiting: false,
          beingCalled: false,
          oppositeId: null,
          videoBox: false,
          loginname: null,
          pc: null,
          audioOnly: false,
          inMedia: false
        },
        emojPanel: {
          show: false,
          emoj: []
        },
        show: true
      }
    },
    props: ['user'],
    methods: {
      loadMoreHistory () {
        this.history.page++
        var user_id = this.chatList.receiver_id
        this.loadHistory(user_id)
      },
      showUserInfo (e, user_id) {
        e.stopPropagation()
        this.userInfo.show = true
        var socket = this.socket
        var that = this

        socket.on('get-info', function (user) {
          let info = {
            show: that.userInfo.show,
            loginname: user.loginname,
            email: user.email,
            avatar: user.avatar,
            location: user.location,
            gender: user.gender,
            phone: user.phone,
            realname: user.realname
          }
          that.userInfo = info
        })

        socket.emit('get-info', user_id)
      },
      getUserInList (userId) {
        var liveUser = this.liveUser
        var result = null
        liveUser.forEach(function (user) {
          if (user.user_id === userId) {
            result = user
            return false
          }
        })
        return result
      },
      logout (liveUser, user) {
        var that = this
        for (var i in liveUser) {
          if (liveUser[i].user_id === user) {
            liveUser.splice(i,1)
            break
          }
        }
      },
      addWithoutRepeat (arr, obj) {
        var that = this
        var isIn = false

        var equals = function ( x, y ) {
          if (x.user_id === y.user_id) {
            return true
          }
          return false
        }
        arr.forEach(function (item) {
          if (equals(item, obj)) {
              isIn = true
              return false
          }
        })
        if (!isIn) {
          arr.push(obj)
        }
        return arr
      },
      closeVideo () {
        var socket = this.socket
        socket.emit('close-video', {
          receiver_id: this.media.oppositeId
        })
        this.media.pc.close()
        this.media.videoBox = false

        this.media =  {
          isCaller: false,
          waiting: false,
          beingCalled: false,
          oppositeId: null,
          videoBox: false,
          loginname: null,
          pc: null,
          audioOnly: false,
          inMedia: false
        }

        var socket = this.socket
        socket.removeAllListeners('offer')
        socket.removeAllListeners('answer')
        socket.removeAllListeners('ice_candidate')
      },
      acceptVideo (data) {
        var that = this
        if (!data) {
          that.media.inMedia = false
        }
        var socket = this.socket
        socket.emit('acc-video', {
          accept: data,
          receiver_id: this.media.oppositeId,
          loginname: this.user.loginname
        })
        if (data === true) {
          this.video()
          this.media.videoBox = true
        }
        this.media.beingCalled = false
      },
      cancelVideo () {
        var socket = this.socket
        socket.emit('cancel-video', {
          sender_id: this.$cookie.get('user_id'),
          receiver_id: this.chatList.receiver_id
        })
        this.media.waiting = false
        this.media.inMedia = false
      },
      show() {
        this.$notify.success({
          title: '成功',
          message: '这是一条成功的提示消息',
          offset: 100
        })
      },
      imgUpload () {
        var imgEle = document.getElementById('img-upload')
        var socket = this.socket
        var that = this
        imgEle.onchange = function () {
          if (this.files.length !== 0 ) {
            var file = this.files[0]
            var reader = new FileReader ()
            reader.onload = function (e) {
              this.value = ''
              var content = "<img class='content-img' src="+ "'" + e.target.result+ "'" + "/>"
              socket.emit('chat', {
                type: 'img',
                content: content,
                receiver_id: that.chatList.receiver_id,
                sender_loginname: that.user.loginname
              })
            }
            reader.readAsDataURL(file)
          }
        }
      },
      addEmoj (index) {
        var emoj = '[emoj:'+ index + ']'
        this.chatPanel.send_content = this.chatPanel.send_content.concat(emoj)
        document.getElementsByClassName('send-box')[0].focus()
        this.showEmojPanel ()
      },
      showEmojPanel () {
        this.emojPanel.show = !this.emojPanel.show
      },
      initialEmojPanel () {
        for (var i = 1; i <= 94; i++) {
          var src = require('./../assets/emoj/' + i + '.gif')
          var data = {
            src: src,
            index: i
          }
          this.emojPanel.emoj.push(data)
        }
      },
      requestMedia (audioOnly) {
        var that = this
        if (this.media.inMedia) {
          that.$message("您已经在进行语音聊天。")
          return
        }

        this.media.inMedia = true

        if (audioOnly) {
          this.media.audioOnly = true
        }

        if (this.chatList.receiver_id === null) {
          this.$message("群聊不能视频。")
          return
        }
        if(this.user.user_id === this.chatList.receiver_id) {
          this.$message("不能和自己视频。")
          return
        }
        var socket = this.socket
        socket.emit('req-video', {
          receiver_id: this.chatList.receiver_id,
          loginname: this.user.loginname,
          audioOnly: audioOnly
        })
        this.media.waiting = true
      },
      video () {
        var that = this
        var socket = this.socket
        var iceServer = {
          "iceServers": [{
              "url": "stun:stun.l.google.com:19302"
          }]
        }

        var getUserMedia = (navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia)

        var PeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)

        var nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);

        var nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);

        var moz = !!navigator.mozGetUserMedia

        var pc = new PeerConnection(iceServer)
        this.media.pc = pc

        var i = 0

        pc.onicecandidate = function (event) {

          if (event.candidate !== null ) {
            socket.emit('ice_candidate', {
              "candidate": event.candidate
            })
          }
        }
        pc.onaddstream = function(event){
          document.getElementById('video').src = URL.createObjectURL(event.stream)
        }

        var that = this
        getUserMedia.call(navigator, {
          'audio': true,
          'video': !that.media.audioOnly
        }, function (stream) {
          pc.addStream(stream)
          if (that.media.isCaller === true) {
            var sendOffer = function (sdp) {
              pc.setLocalDescription(sdp)
              socket.emit('offer', {
                'sdp': sdp
              })
            }
            pc.createOffer(sendOffer, function (err) {
              console.log(err)
            })
          }
        }, function (err) {
          console.log(err)
        })




        socket.on('offer', function (data) {
          var sendAnswer = function (sdp) {
            pc.setLocalDescription(sdp)
            socket.emit('answer', {
              'sdp': sdp
            })
          }
          pc.setRemoteDescription(new nativeRTCSessionDescription(data.sdp), function () {
            pc.createAnswer(sendAnswer, function (err) {
              console.log(err)
            })
          }, function (err) {
            console.log(err)
          })
        })

        socket.on('answer', function (data) {
          pc.setRemoteDescription(new nativeRTCSessionDescription(data.sdp))
        })

        socket.on('ice_candidate', function (data) {
          pc.addIceCandidate(new nativeRTCIceCandidate(data.candidate))
        })
      },
      transformEmoj (text) {
        var regExp = /\[emoj:\d+\]/g
        var that = this
        var match = null
        while (match=regExp.exec(text)) {
          var index = match[0].slice(6, -1)
          if (index > that.emojPanel.emoj.length) {
            text = text.replace(match[0], '[X]')
          } else {
            var pic = require('./../assets/emoj/' + index + '.gif')
            var  emoj = '<img  class="emoj-pic" src='+ pic + ' />'
            text = text.replace(match[0], emoj)
          }
        }
        return text
      },
      messageRouter (message) {
        var that = this
        var socket = this.socket

        if (message.dowhat === 'login') {
          let user = {
            loginname: message.user.loginname,
            avatar: message.user.avatar,
            user_id: message.who,
            currentChattingUser: false,
            unreadNum: message.unreadNum
          }
          that.addWithoutRepeat (that.liveUser, user)
        }

        if (message.dowhat === 'logout') {
          that.logout(that.liveUser, message.who)
          if (that.chatList.receiver_id === message.who) {
            that.toggleChattingUser (null)
          }
        }

        if (message.dowhat === 'live-user') {
          that.liveUser = message.liveUserDetail
        }

        if (message.dowhat === 'chat') {
          var me = false
          if (message.sender_loginname === that.user.loginname) {
            me = true
          }

          if (!me) {
            document.getElementsByClassName("prompt-sound")[0].play()
          }

          if (message.receiver_id === null && that.chatList.receiver_id !== null) {
            that.chatList.groupUnreadNum++
            return
          }

          if (message.sender_id !== that.chatList.receiver_id && message.receiver_id !==null && !me) {
              var user = that.getUserInList(message.sender_id)
              user.unreadNum++
              return
          }

          message.content = this.transformEmoj (message.content)

          let messageItem = {
            me: me,
            sender_loginname: message.sender_loginname,
            sender_id: message.sender_id,
            sender_avatar: message.sender_avatar,
            receiver_id: message.receiver_id,
            content: message.content
          }

          this.chatPanel.messages.push(messageItem)
          this.chatPanel.scroll = true

          if (message.receiver_id !== null) {
            socket.emit('clear-unread-status', {
              sender_id: message.sender_id
            })
          }
        }
        if (message.dowhat === 'load-history') {
          if (message.messages.length < 10) {
            this.history.loadMore = false
          }
          var messages = []

          var temp = message.messages.pop()
          while (temp) {
            var me = false
            if (temp.sender_name === that.user.loginname) {
              me = true
            }

            temp.content = this.transformEmoj (temp.content)

            let messageItem = {
              me: me,
              sender_loginname: temp.sender_name,
              sender_id: temp.sender_id,
              sender_avatar: temp.sender_avatar,
              receiver_id: temp.receiver_id,
              content: temp.content
            }
            messages.push(messageItem)
            temp = message.messages.pop()
          }

          messages = messages.concat(that.chatPanel.messages)

          this.chatPanel.messages = messages

          if (this.history.page === 0) {
            this.chatPanel.scroll = true
          }

          if (messages.length < 10) {
            this.history.loadMore = false
          }
        }

        if (message.dowhat === 'req-video') {
          if (that.media.inMedia) {
            socket.emit('in-media', {
              receiver_id: message.sender_id
            })
            return
          }
          this.media.beingCalled = true
          this.media.oppositeId = message.sender_id
          this.media.loginname = message.loginname
          this.media.inMedia = true
          this.media.audioOnly = message.audioOnly
        }

        if (message.dowhat === 'acc-video') {
          if (message.accept) {
            this.media.waiting = false
            this.media.isCaller = true
            this.video()
            this.media.oppositeId = message.sender_id
            this.media.videoBox = true
            this.media.loginname = message.loginname
          } else {
            this.media.waiting = false
            this.media.inMedia = false
            this.media.audioOnly = false
          }
        }

        if (message.dowhat === 'in-media') {
          this.media.waiting = false
          this.media.inMedia = false
          this.media.audioOnly = false
          this.$message("对方正在进行语音聊天，不能接收。")
        }

        if (message.dowhat === 'close-video') {
          this.media.pc.close()
          this.media.videoBox = false

          this.media =  {
            isCaller: false,
            waiting: false,
            beingCalled: false,
            oppositeId: null,
            videoBox: false,
            loginname: null,
            pc: null,
            audioOnly: false,
            inMedia: false
          }

          var socket = this.socket
          socket.removeAllListeners('offer')
          socket.removeAllListeners('answer')
          socket.removeAllListeners('ice_candidate')
        }
      },
      toggleChattingUser (user_id) {
        var that = this
        var socket = this.socket
        this.chatList.receiver_id = user_id

        if (user_id === null) {
          this.chatList.groupUnreadNum = 0
        } else {
          var user = that.getUserInList (user_id)
          user.unreadNum = 0
        }

        this.history = {
          loadMore: true,
          page: 0
        }
        this.clearSendBox ()
        this.clearContentPanel ()

        document.getElementsByClassName('send-box')[0].focus()
        this.loadHistory(user_id)
        if (user_id !== null) {
          socket.emit('clear-unread-status', {
            sender_id: user_id
          })
        }
      },
      clearContentPanel () {
        this.chatPanel.messages = []
      },
      scrollToBottom (className) {
        var ele = document.getElementsByClassName(className)[0]
        ele.scrollTop = ele.scrollHeight
      },
      loadHistory (user_id) {
        var socket = this.socket
        var that = this
        socket.emit('load-history', {
          user_id: user_id,
          page: that.history.page
        })
      },
      sendMessaage (e) {
        if( (e.keyCode === 13 && e.ctrlKey) || e.type === 'click') {
          var socket = this.socket
          socket.emit('chat', {
            content: this.chatPanel.send_content,
            receiver_id: this.chatList.receiver_id,
            sender_loginname: this.user.loginname,
            sender_avatar: this.user.avatar
          })
          this.clearSendBox ()
        }
      },
      clearSendBox () {
        this.chatPanel.send_content = ''
      }
    },
    mounted () {
      var div = document.getElementsByClassName("video-box")[0]
  　　 div.onmousedown = function(ev){
  　　　　var oevent = ev || event

  　　　　var distanceX = oevent.clientX - div.offsetLeft
  　　　　var distanceY = oevent.clientY - div.offsetTop

  　　　　document.onmousemove = function(ev){
  　　　　　　var oevent = ev || event
  　　　　　　div.style.left = oevent.clientX - distanceX + 'px'
  　　　　　　div.style.top = oevent.clientY - distanceY + 'px'
  　　　　}
  　　　　document.onmouseup = function(){
  　　　　　　document.onmousemove = null
  　　　　　　document.onmouseup = null
  　　　　}
      }

      document.getElementsByClassName('send-box')[0].focus()
      var that = this
      if (!this.$cookie.get("user_id")) {
        this.$message("请先登录")
        this.$router.push(`/signin`)
        return
      } else {
        var backendURL = config.origin + ":" + config.backend_port
        var socket = socketClient(backendURL)
        that.socket = socket
        socket.on('connect', function () {
          socket.emit('login')
          socket.emit('live-user')

          socket.on('message', that.messageRouter)

          that.$emit("valueUp", socket)
        })
        this.toggleChattingUser(null)
        this.initialEmojPanel()
        this.imgUpload ()
      }
    },
    updated (data) {
      if (this.chatPanel.scroll) {
        this.scrollToBottom('content-panel')
        this.chatPanel.scroll = false
      }
    }
  }
</script>
<style lang="scss">
  .content {
    img {
      max-width:400px;
    }
  }
</style>
<style lang="scss" scoped>
$color1:gray;
$color2:#f5f5f5;
$color3:#0077d8;
$color4:#258bde;

*{
  margin: 0;
  padding: 0;
}
.chat-room {
  width:80%;
  position:relative;
  margin:0 auto;
  height:520px;
  background-image: url("../assets/background.jpg");

  .user-info {
    div {
      line-height: 40px;
      font-size: 16px;
      .info-left {
        display: inline-block;
        width: 100px;
        color: #888;
      }
      .info-right {
        display: inline-block;
        width: 210px;
        vertical-align: top;
        img {
          width: 80px;
          max-height: 80px;
        }
      }
    }
  }
  .video-box {
    width: 200px;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 3;
    div {
      width: 100%;
      height: 30px;
      background: #222;
    }
    #video {
      width: 200px;
      z-index: 4;
    }
    span {
      color: #ddd;
      line-height: 30px;
    }
    span:first-child{
      margin-left: 10px;
    }
    span:last-child{
      float: right;
      margin-right: 10px;
      cursor: pointer;
    }
  }
  .prompt {
    height: 40px;
    width: 500px;
    background: #333;
    z-index: 2;
    position: fixed;
    margin: 0 auto;
    top:0;bottom: 0;left: 0;right:0;
    border-radius: 4px;
    margin-top: 4px;
    line-height: 40px;
    span {
      color: white;
      margin-left: 20px;
      span {
        color: $color4;
        margin: 0;
      }
    }
    button {
      position: absolute;
      background: $color4;
      color: white;
      border-radius: 4px;
      border: none;
      padding: 6px 20px;
      margin: 0 20px;
      cursor: pointer;
      top: 6px;
    }
    button:nth-of-type(1) {
      right: 10px;

    }
    button:nth-of-type(2) {
      right: 100px;
    }
  }
  .emoj-panel {
    width:384px;
    padding:4px;
    height:160px;
    position: absolute;
    top: 147px;
    left: 400px;
    z-index: 2;
    background: white;
    border-radius: 4px;
    box-shadow: 4px -4px 10px #aaa;
    img {
      cursor: pointer;
    }
  }
  .panel-wrap {
    width: 80%;
    position: absolute;
    top:0;bottom:0;left:0;right:0;
    margin:0 auto;
    .left-panel {
      width: 25%;
      height: 520px;
      background-color: #ccc;
      opacity: 0.9;
      display: inline-block;
      overflow-y: auto; // 不能用scroll，否则不溢出的时候也会出现滚动条。
      overflow-x: hidden;
      .active {
        background: #666;
      }
      .user-item {
        height: 40px;
        width: 100%;
        line-height: 40px;
        box-sizing: border-box;
        cursor: pointer;
        img {
          margin-left:20px;
          height:30px;
          vertical-align: middle;
        }
        .loginname {
          margin-left: 20px;
        }
        .unread-num {
          clear: both;
          float:right;
          margin-right: 10px;
        }
      }
    },
    .right-panel {
      display: inline-block;
      position: absolute;
      top: 0;
      height: 520px;
      width: 75%;
      opacity: 0.9;

      .content-panel {
        overflow-y: auto;
        height:320px;
        box-sizing: border-box;
        background: white;
        opacity: 0.9;
        border-bottom: 1px solid #ccc;
        padding: 10px 0;

        .message-item {
          .user-info {
            .cursor {
              cursor: pointer;
            }
          }
        }
        .load-more {
          text-align: center;
          cursor: pointer;
          background: #ccc;
          height: 36px;
          line-height: 36px;
          width: 40%;
          border-radius: 4px;
          margin: 0 auto;
        }
        .itemLeft {
          width: 100%;
          float: left;
          clear: both;
          .user-info {
            float: left;
            clear: both;
            padding: 20px;
            img {
              width: 20px;
              vertical-align: middle;
              float: left;
              padding-right: 10px;
            }
            span {
              color: #888;
            }
          }
          .content {
            float: left;
            clear: both;
            padding: 0 40px;
            line-height: 24px;
            word-break: break-all;
            img {
              max-width: 200px;
            }
          }
        }
        .itemRight {
          width: 100%;
          float: right;
          clear: both;
          .user-info {
            float: right;
            clear: both;
            padding: 20px;
            img {
              width: 20px;
              vertical-align: middle;
              float: right;
            }
            span {
              padding-right: 10px;
              color: #888;
            }
          }
          .content {
            float: right;
            clear: both;
            padding: 0 40px;
            line-height: 24px;
            word-break: break-all;
            img {
              width: 200px;
            }
          }
        }
      }
      .input-panel {
        height: 200px;
        background: white;
        opacity: 0.9;
        position: relative;
        .chat-function-panel {
          height: 30px;
          line-height: 30px;
          span {
            cursor: pointer;
          }
          label {
            cursor: pointer;
          }
          .icon {
            margin-left: 10px;
            vertical-align: middle;
          }
        }
        .input-content {
          height: 140px;
          background: white;
          textarea {
            float:left;
            border: none;
            outline: none;
            resize: none;
            width: 100%;
            height: 140px;
            font-size: 16px;
            padding:4px 6px;
            box-sizing: border-box;
          }
        }
        .send-button {
          height: 30px;
          margin:0;
          padding: 0;
          background-color: #eee;
          // background: #eee;
          .icon {
            margin-right: 40px;
            float:right;
            height:30px;
            color: #888;
            line-height: 30px;
          }
        }
      }
    }
  }
}
</style>
