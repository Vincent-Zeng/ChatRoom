<template>
  <div id="app">
    <input type="file" id="avatar" accept="image/*" style="display:none"/>
    <el-dialog title="我的资料" v-model="myInfo.show" class="my-info">
      <el-form label-position="left" label-width="80px">
        <el-form-item label="头像">
          <img :src="myInfo.avatar" />
          <el-button type="primary" @click=""><label for="avatar">上传</label></el-button>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="myInfo.loginname" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="myInfo.email" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="myInfo.gender" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="myInfo.realname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="myInfo.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="住址">
          <el-input v-model="myInfo.location" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="myInfo.show = false">取 消</el-button>
        <el-button type="primary" @click="updateInfo">确 定</el-button>
      </div>
    </el-dialog>

    <el-menu theme="dark" class="top-bar" mode="horizontal" @select="">
      <div class="content">
        <el-menu-item index="1" v-show="isLogin" @click="showMyInfo">{{ user.loginname }}</el-menu-item>
        <el-menu-item index="2" v-show="isLogin" @click="logout">注销</el-menu-item>
        <el-menu-item index="3" v-show="!isLogin"><router-link to="signin">登录</router-link></el-menu-item>
        <el-menu-item index="4" v-show="!isLogin"><router-link to="signup">注册</router-link></el-menu-item>
      </div>
    </el-menu>
    <router-view class="router-view" :user="user" @valueUp="valueUp"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      isLogin: false,
      socket: null,
      user: {
        loginname: '',
        email: '',
        user_id: ''
      },
      myInfo: {
        show: false,
        loginname: '',
        email: '',
        avatar: '',
        location: '',
        gender: '',
        phone: '',
        realname: ''
      }
    }
  },
  methods : {
    valueUp (value) {
      this.socket = value
    },
    updateInfo () {
      var socket = this.socket
      let user = this.myInfo
      delete user['show']
      socket.emit('update-info', user)
    },
    showMyInfo () {
      this.myInfo.show = true
      var socket = this.socket
      var that = this

      socket.on('get-info', function (user) {
        let info = {
          show: that.myInfo.show,
          loginname: user.loginname,
          email: user.email,
          avatar: user.avatar,
          location: user.location,
          gender: user.gender,
          phone: user.phone,
          realname: user.realname
        }
        that.myInfo = info
      })

      socket.emit('get-info')

    },
    logout () {
      this.$cookie.delete('user_id')
      this.$router.push('/signin')
    },
    initUserInfo () {
      if (this.$cookie.get('user_id')) {
        this.$http.get(`/auth`) //前后端分离必须在socket连接之前发起一个request请求以进行一些中间件操作
        .then(res => {
          return res.json()
        }).then(json => {
          this.user = json.message
          this.isLogin = true
          this.user_id = json.user_id
        }).catch(err => {
          console.log(err)
        })
      }
    },
    imgUpload () {
      var imgEle = document.getElementById('avatar')
      var that = this
      imgEle.onchange = function () {
        if (this.files.length !== 0) {
          var file = this.files[0]
          var reader = new FileReader ()
          reader.onload = function (e) {
            this.value = ''
            that.myInfo.avatar = e.target.result
          }
          reader.readAsDataURL (file)
        }
      }
    }
  },
  updated () {
    this.initUserInfo ()  // 因为由/signin路由到/chatroom过程中created、mounted钩子不再执行，所以要在updated钩子再调用一次这个函数。
  },
  mounted () {
    this.imgUpload ()
  },
  created () {
    this.initUserInfo ()
  }
}
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  .my-info {
    img {
      width:50px;
      vertical-align: middle;
      margin-right: 20px;
    }
  }
  .router-view {
    width: 100%;
  }
  .top-bar {
    .content{
      float: right;
    }
  }
}
</style>
