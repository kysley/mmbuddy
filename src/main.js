import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource'
import 'babel-polyfill'
import store from './store.js'

Vue.use(VueResource)

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})

// https://github.com/atomiks/reddit-user-analyser/tree/master/src/components