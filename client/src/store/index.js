import Vuex from 'vuex';
import Vue from 'vue';
import state from './state';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions
});