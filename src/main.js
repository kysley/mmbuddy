import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource'
import 'babel-polyfill'

Vue.use(VueResource)

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})

// https://github.com/atomiks/reddit-user-analyser/tree/master/src/components