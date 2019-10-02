import {Tween, Easing, autoPlay} from 'es6-tween'

export default class Reel extends PIXI.Sprite {
    constructor(reelNumber, reelTiles, maskPolygon, config) {
        super();
        config = config || {};
        autoPlay(true);
        // CONFIG DEFAULTS
        this.reelNumber = reelNumber;
        this.yPeriod = config.yPeriod || 150;
        this.tileScale = (config.tileScale >= 0) ? config.tileScale : 1;
        this.speed = config.speed || 2;
        this.rollEasing = config.rollEasing;
        this.preRollTiles = config.preRollTiles || 0;
        this.postRollTiles = config.postRollTiles || 0;
        this.showMask = config.showMask || false;

        this._startPositions = [];
        this._distance = 0;

        this.rolling = false;
        this.postrolled = false;
        this.finished = false;

        this.tiles = [];
        let tile = null;
        for (let f = 0; f < reelTiles.length; f++) {
            tile = reelTiles[f];
            tile.y = f * this.yPeriod;
            tile.scale.set(this.tileScale);
            this.addChild(tile);
            this.tiles.push(tile);
        }

        this._maxYposition = this.yPeriod * (this.tiles.length - 1);

        this.addMask(maskPolygon);
        this.rearrange();

        this.updatezOrder();
        this.visibilityCheck();

        // ROLLING BINDS
        this.setStartPositions = this.setStartPositions.bind(this);
        this.onPrerollStart = this.onPrerollStart.bind(this);
        this.onRollStart = this.onRollStart.bind(this);
        this.onPostRollStart = this.onPostRollStart.bind(this);
        this.onRollUpdate = this.onRollUpdate.bind(this);
        this.onPostRollFinish = this.onPostRollFinish.bind(this);
    }

    updatezOrder() {
        this.children.sort(function (a, b) {
            a.zIndex = a.zIndex || 0;
            b.zIndex = b.zIndex || 0;
            return (a.zIndex - b.zIndex);
        });
    };

    rearrange() {
        for (let t = 0; t < this.tiles.length; t++) {
            this.rearrangeTile(this.tiles[t]);
        }
    };

    rearrangeTile(tile) {
        while (tile.y >= this._maxYposition) {
            tile.y -= (this._maxYposition + this.yPeriod);
        }
        while (tile.y < -this.yPeriod) {
            tile.y += (this._maxYposition + this.yPeriod);
        }
    };

    addMask(maskData) {
        if (!maskData) return console.warn("mask polygon isn't found");
        let maskShape;

        if (maskData instanceof PIXI.Graphics) {
            maskShape = this.addChild(maskData);

        } else {
            maskShape = this.addChild(new PIXI.Graphics());
            maskShape.beginFill(0x00FF00, 0.5).lineStyle(2, 0xff0000, 1, 1)
                .drawPolygon(maskData).endFill();
        }

        if (!this.showMask) {
            this.mask = maskShape;
        }
    };

    setStartPositions() {
        this._startPositions = [];
        for (let t = 0; t < this.tiles.length; t++) {
            this._startPositions.push(this.tiles[t].y);
        }
    };

    roll(distanceTiles) {

        // PRE-ROLL TWEEN
        let preRollTiles = this.preRollTiles;

        let preHalfTime = this.yPeriod * preRollTiles / this.speed * 8;
        let preRollTween1 = new Tween({dti: 0}).to({dti: -preRollTiles}, preHalfTime)
            .easing(Easing.Quadratic.Out)
            .on("start", this.onPrerollStart)
            .on("update", this.onRollUpdate);
        let preRollTween2 = new Tween({dti: 0}).to({dti: preRollTiles}, preHalfTime / 4)
            .easing(Easing.Quadratic.In)
            .on("start", this.setStartPositions)
            .on("update", this.onRollUpdate);

        // ROLLING TWEEN
        distanceTiles = (distanceTiles >= 0) ? distanceTiles : 0;
        this._distance = distanceTiles * this.yPeriod;
        let rollTime = this._distance / this.speed;
        let rollTween = new Tween({dti: 0}).to({dti: distanceTiles}, rollTime)
            .on("start", this.onRollStart)
            .on("update", this.onRollUpdate);
        if (this.rollEasing) {
            rollTween.easing(this.rollEasing);
        }

        // POST-ROLL TWEENS
        let postRollTiles = this.postRollTiles;

        let postHalfTime = this.yPeriod * postRollTiles / this.speed * 8;
        let postTween1 = new Tween({dti: 0}).to({dti: postRollTiles}, postHalfTime / 2)
            .easing(Easing.Quadratic.Out)
            .on("start", this.onPostRollStart)
            .on("update", this.onRollUpdate);
        let postTween2 = new Tween({dti: 0}).to({dti: -postRollTiles}, postHalfTime)
            .easing(Easing.Quadratic.In)
            .on("start", this.setStartPositions)
            .on("update", this.onRollUpdate)
            .on("complete", this.onPostRollFinish); // FINISH

        if (!this.rollEasing) {
            //CHAINING work bad for this tweens lib, you can try

            // preRollTween1.chainedTweens(preRollTween2);
            // preRollTween2.chainedTweens(rollTween);
            // rollTween.chainedTweens(postTween1);
            // postTween1.chainedTweens(postTween2);

            preRollTween1.on("complete", ()=> {
                preRollTween2.start();
            });

            preRollTween2.on("complete", ()=> {
                rollTween.start();
            });

            rollTween.on("complete", ()=> {
                postTween1.start();
            });

            postTween1.on("complete", ()=> {
                postTween2.start();
            });

            // START
            preRollTween1.start();
        } else {
            rollTween.on("complete", this.onPostRollFinish);
            // START
            rollTween.start();
        }

    };

    onRollUpdate(o) {
        for (let t = 0; t < this.tiles.length; t++) {
            this.tiles[t].y = this._startPositions[t] + this.yPeriod * o.dti;
            this.rearrangeTile(this.tiles[t]);

        }
        this.visibilityCheck();
    };

    visibilityCheck() {
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            if ((tile.y >= -this.yPeriod && tile.y < -100) || (tile.y <= this._maxYposition && tile.y > this._maxYposition - (this.yPeriod*1.5))) {
                tile.visible = false;
            } else {
                tile.visible = true;
            }
        }
    }

    onPrerollStart() {
        this.emit("start", this);
        this.emit("preroll", this);
        this.setStartPositions();
        this.rolling = true;
        this.postrolled = false;
        this.finished = false;
    };

    onRollStart() {
        this.emit("roll", this);
        this.rolling = true;
        this.setStartPositions();
    };

    onPostRollStart() {
        this.emit("postroll", this);
        this.setStartPositions();
        this.rolling = false;
        this.postrolled = true;
        this.finished = false;
    };

    onPostRollFinish() {
        this.emit("finish", this);
        this.rolling = false;
        this.postrolled = true;
        this.finished = true;
    };
}