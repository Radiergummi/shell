import Vue        from 'vue';
import App        from './App';
import Buffer     from './modules/Buffer';
import Filesystem from './modules/Filesystem';
import Disk       from './modules/Filesystem/Disk';

window.Buffer = Buffer;
const app     = new Vue( {
                           el:         '#app',
                           components: { App },
                           template:   '<App/>'
                         } );

window.app = app;

window.fs = new Disk( 'test', new Filesystem('test-fs') );
