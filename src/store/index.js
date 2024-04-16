import Vue from 'vue'
import Vuex from 'vuex'
import routes from './routes.js'
import use from './use'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isPhone: false,
        navOpen: true,
    },
    modules: {
	      routes,
          use
    }
  
})
