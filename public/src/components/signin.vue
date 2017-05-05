<template>
  <div class="sign-in-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="line-height: 36px;">登录</span>
      </div>
      <el-form label-position="left" label-width="80px" :model="formLabelAlign">
        <el-form-item label="邮箱">
          <el-input v-model="formLabelAlign.email"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formLabelAlign.password" type="password"  @keyup.enter.native="signIn"></el-input>
        </el-form-item>
        <el-form-item class="form-button">
          <el-button type="primary" @click="signIn">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      formLabelAlign: {
        email: "",
        password: ""
      }
    }
  },
  methods: {
    signIn () {
      this.$http.post(`/signin`, {
        email: this.formLabelAlign.email,
        password: this.formLabelAlign.password
      }).then(res => {
        return res.json()
      }).then(json => {
        if (json.status === 200) {
          this.$router.push(`/chatroom`)
        } else {
          this.$message(json.message)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    resetForm () {
      this.formLabelAlign = {
        email: "",
        password: ""
      }
    }
  },
  mounted () {
    if (this.$cookie.get("user_id")) {
      this.$router.push(`/chatroom`)
    }
  }
}
</script>
<style lang="scss" scoped>
  .sign-in-page {
    .box-card {
      width: 480px;
      height: 270px;
      position: fixed;
      margin: 120px auto 0;
      top:0; left:0; bottom:0; right:0;
      .form-button {
        float: right;
        margin-right: 20px;
      }
    }
  }
</style>
