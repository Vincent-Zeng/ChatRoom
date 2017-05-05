<template>
  <div class="hello">
    <router-view class="router-view" :user="user"></router-view>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {

    }
  },
  props: ['user'],
  mounted () {
    if (this.$route.path === '/') {
      this.$router.push(`/signin`)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
}
.hello{
  width: 100%;
  .router-view {
    width: 100%;
  }
}
</style>
