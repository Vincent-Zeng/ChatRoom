import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import SignUp from '@/components/signup'
import SignIn from '@/components/signin'
import ChatRoom from '@/components/chatroom'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
      children: [
        {
          name: 'signup',
          path: '/signup',
          component: SignUp
        },
        {
          name: 'signin',
          path: '/signin',
          component: SignIn
        },
        {
          name: 'chatroom',
          path: '/chatroom',
          component: ChatRoom
        }
      ]
    }
  ]
})
