import '../style/style.scss';
import picturefill from 'picturefill';
picturefill();
import Loading from './components/loading';
import Webgl from './components/webgl';

export default class App {
    constructor() {
        window.addEventListener(
            'DOMContentLoaded',
            () => {
                this.init();
            },
            false
        );
    }
    init() {
        new Loading();

        new Webgl();
    }
}
new App();
