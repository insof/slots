export default class Tile extends PIXI.Container {
    constructor(regular, type) {
        super();

        this.parts = {//parts needed for other tiles stateds, like blured
            regular: null
        };

        this.type = type;

        this.zIndex = 100;

        if(type === "P") this.zIndex = 200;

        if (regular) {
            this.parts.regular = this.addChild(regular);
        }
    }

    static create(frameRegular) {

        let regular = frameRegular ? new PIXI.Sprite.from(frameRegular) : null;
        regular.anchor.set(0.5);

        return new Tile(regular, frameRegular);
    };
};