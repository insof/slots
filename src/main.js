import FontFaceObserver from 'fontfaceobserver';
import Game from './Game';
import CONFIG from './config/config.json';
import ASSETS from './config/assets.json';


//----------------------------------------------------------------------------------------------------------------------
export default function () {

    function embedFont(name, src, callback) {
        let s = document.createElement('style');
        s.type = "text/css";
        s.appendChild(document.createTextNode("@font-face {font-family: " + name + "; src: url(" + src + ");" + "}"));

        document.getElementsByTagName('head')[0].appendChild(s);

        let font = new FontFaceObserver(name);

        font.load().then(function () {
            if (callback) callback();
        });
    }

    let GAME = new Game(CONFIG);

    for (let image of ASSETS.images) {
        GAME.app.loader.add(image.name, "assets/images/" + image.src);
    }
    GAME.app.loader.onComplete.add(() => {
        embedFont("Arcade", "assets/fonts/Arcade.ttf", () => {
            preloadComplete();
        });
    });

    GAME.app.loader.load();

    function preloadComplete() {
        GAME.run();
    }
}
