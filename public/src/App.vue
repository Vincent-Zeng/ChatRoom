<template>
  <div id="app">
    <el-menu theme="dark" class="top-bar" mode="horizontal" @select="">
      <div class="content">
        <el-menu-item index="1" v-show="isLogin">{{ user.loginname }}</el-menu-item>
        <el-menu-item index="2" v-show="isLogin" @click="logout">注销</el-menu-item>
        <el-menu-item index="3" v-show="!isLogin"><router-link to="signin">登录</router-link></el-menu-item>
        <el-menu-item index="4" v-show="!isLogin"><router-link to="signup">注册</router-link></el-menu-item>
      </div>
    </el-menu>
    <router-view class="router-view" :user="user"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      isLogin: false,
      user: {
        loginname: '',
        email: '',
        user_id: ''
      }
    }
  },
  methods : {
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
    }
  },
  updated () {
    this.initUserInfo ()  // 因为由/signin路由到/chatroom过程中created、mounted钩子不再执行，所以要在updated钩子再调用一次这个函数。
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
