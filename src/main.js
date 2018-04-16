import Vue    from 'vue';
import App    from './App';
import Buffer from './modules/Buffer';

window.Buffer = Buffer;
const app     = new Vue( {
                           el:         '#app',
                           components: { App },
                           template:   '<App/>'
                         } );

window.app = app;
