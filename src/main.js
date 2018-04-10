import Vue from 'vue';
import App from './App';

const app = new Vue( {
                       el:         '#app',
                       components: { App },
                       template:   '<App/>'
                     } );

window.app = app;
