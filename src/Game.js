import './vendor/pixi-4.5.1.js';
import GameField from './ui/GameField';

let INSTANCE = null;

class Game {

    constructor(config = {}) {
        INSTANCE = this;
        this.currentWindow = null;
        this.size = {w: config.size.width, h: config.size.height};
        this.fps = 0;
        this.fpsDelay = 0;
        this.app = new PIXI.Application(this.size.w, this.size.h, {backgroundColor: 0x000000});
        document.body.appendChild(this.app.view);
        this.app.view.style.position = "absolute";
        this.app.view.style.left = "0";
        this.app.view.style.top = "0";
    }

    static get i() {
        return INSTANCE;
    }

    run() {
        this.stage = this.app.stage.addChild(new PIXI.Container());
        this.app.ticker.add(this.tick.bind(this));
        this.addFPSView();
        this.showMenu();
    }

    addFPSView() {
        this.fpsView = this.app.stage.addChild(new PIXI.Text("FPS: 0", {
            fontFamily: this.getSystemFont(),
            fill: "#000000",
            fontSize: 52,
            lineJoin: "round",
            miterLimit: 10,
            stroke: "#ffffff",
            strokeThickness: 5
        }));
        this.fpsView.x = 12;
        this.fpsView.y = 6;
    };

    updateFPS(delta) {
        this.fps++;
        this.fpsDelay += delta;

        if (this.fpsDelay >= 1000) {
            while (this.fpsDelay > 1000) this.fpsDelay -= 1000;
            this.lastFPS = this.fps;
            this.fps = 0;
            this.fpsView.text = "FPS: " + this.lastFPS;
        }
    };

    getSystemFont() {
        return '-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif';
    };

    closeCurrentWindow() {
        if (this.currentWindow) {
            this.app.stage.removeChild(this.currentWindow);
            this.currentWindow = null;
        }
    }

    showWindow(view) {
        this.closeCurrentWindow();
        this.app.stage.addChildAt(view, 0);
        this.currentWindow = view;
        if (this.currentWindow.onResize) this.currentWindow.onResize();
        view.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
    }

    showMenu() {
        this.menu = new GameField();
        this.showWindow(this.menu);
    }

    tick() {
        let delta = PIXI.ticker.shared.elapsedMS;
        // if (delta > 200) delta = 200; //dirty hack
        this.updateFPS(delta);

        if (this.currentWindow && this.currentWindow.tick) {
            this.currentWindow.tick(delta);
        }
    }

    onResize() {
        if (this.currentWindow) {
            this.currentWindow.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
            if (this.currentWindow.onResize) this.currentWindow.onResize();
        }
    };
}

export default Game;