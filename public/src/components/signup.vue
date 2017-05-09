<template>
  <div class="sign-up-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="line-height: 36px;">注册</span>
      </div>
      <el-form label-position="left" label-width="80px" :model="formLabelAlign">
        <el-form-item label="邮箱">
          <el-input v-model="formLabelAlign.email"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="formLabelAlign.loginname"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formLabelAlign.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="formLabelAlign.rePassword" type="password" @keyup.enter.native="signUp"></el-input>
        </el-form-item>
        <el-form-item class="form-button">
          <el-button type="primary" @click="signUp">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
  export default {
    name: 'signup',
    data() {
      var formLabelAlign = {
       loginname: '',
       email: '',
       password: '',
       rePassword: ''
     }
      return {
        formLabelAlign: formLabelAlign
      }
    },
    methods: {
      signUp () {
        this.$http.post(`/signup`, {
          loginname: this.formLabelAlign.loginname,
          email: this.formLabelAlign.email,
          password: this.formLabelAlign.password,
          rePassword: this.formLabelAlign.rePassword
        }).then(res => {
          return res.json()
        }).then(json => {
          this.$message(json.message)
        }).catch(err => {
          console.log(err)
        })
      },
      resetForm () {
        this.formLabelAlign = {
           loginname: '',
           email: '',
           password: '',
           rePassword: ''
         }
      }
    }
  }
</script>
<style lang="scss" scoped>
.sign-up-page {
  .box-card {
      width: 480px;
      height: 390px;
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
