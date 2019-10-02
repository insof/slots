import '../vendor/pixi-4.5.1.js';
import Game from "../Game";

class Layout {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.scale = 1;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.orientation = "";

        this.LANDSCAPE = 1;
        this.PORTRAIT = 2;

        this.eventEmitter = new PIXI.utils.EventEmitter();
    }

    hideAddressBar() {
        window.scrollTo(0, 1);
    };

    fitLayout(w, h) {

        if (typeof w != "number" || typeof h != "number") {
            w = window.innerWidth;
            h = window.innerHeight;
        }

        if (layout.width === w && layout.height === h) return;

        document.body.style.width = w + "px";
        document.body.style.height = h + "px";

        layout.width = w;
        layout.height = h;
        layout.orientation = w > h ? layout.LANDSCAPE : layout.PORTRAIT;

        var gw, gh;

        if (layout.orientation === layout.LANDSCAPE) {
            gh = Game.i.size.w;
            gw = Math.floor(gh * (w / h));

            if (gw < Game.i.size.h) {
                gw = Game.i.size.h;
                gh = Math.floor(Game.i.size.h * (h / w));
            }
        }
        else {
            gh = Game.i.size.h;
            gw = Math.floor(gh * (w / h));

            if (gw < Game.i.size.w) {
                gw = Game.i.size.w;
                gh = Math.floor(Game.i.size.w * (h / w));
            }
        }

        Game.i.app.renderer.resize(gw, gh);

        Game.i.app.view.style.width = w + "px";
        Game.i.app.view.style.height = h + "px";

        layout.gameWidth = gw;
        layout.gameHeight = gh;

        layout.scale = Math.min(w / gw, h / gh);

        Game.i.onResize();

        layout.eventEmitter.emit("resize", {
            width: this.gameWidth,
            height: this.gameHeight
        });

        setTimeout(this.hideAddressBar, 100); //to hide address bar
    };

    on(event, cb, context) {
        this.eventEmitter.on(event, cb, context);
    };

    once(event, cb, context) {
        this.eventEmitter.once(event, cb, context);
    };

    off(event, cb, context) {
        this.eventEmitter.off(event, cb, context);
    };
}

const layout = new Layout;

export default layout;
