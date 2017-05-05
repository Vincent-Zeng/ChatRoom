// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import VueResource from 'vue-resource'
import VueCookie from 'vue-cookie'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import config from'./../../config'

Vue.use(VueCookie)
Vue.use(VueResource)
Vue.component('icon', Icon)

const baseURL = config.host + ":" + config.backend_port
Vue.http.interceptors.push(function (request,next) {
  request.credentials = true
  request.url = `${baseURL}${request.url}`
  next ()
})

Vue.config.productionTip = false

Vue.use(ElementUi);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
