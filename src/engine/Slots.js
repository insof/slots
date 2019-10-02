import Reel from './Reel'

export default class Slots extends PIXI.Sprite {
    constructor(tiles, maskPolygons, config) {
        super();
        config = config || {};
        maskPolygons = maskPolygons || [];
        // DEFAULT CONFIG
        this.config = {
            background: config.background || null,
            foreground: config.foreground || null,
            visibleRows: config.visibleRows || 3,
            xPeriod: config.xPeriod || 200,
            yPeriod: config.yPeriod || 150,
            offsetX: config.offsetX || 0,
            offsetY: config.offsetY || 0,
            margin: config.margin || 0,
            tileScale: config.tileScale || 1,
            showMask: config.showMask || false,
            speed: config.speed || 3,
            preRollTiles: isNaN(config.preRollTiles) ? 0.66 : config.preRollTiles,
            postRollTiles: isNaN(config.postRollTiles) ? 0.66 : config.postRollTiles,
            rollEasing: config.rollEasing || null
        };

        this.background = this.addSprite(this.config.background);

        // ADDING EVERY REEL
        this.reels = [];
        this.addReels(tiles, maskPolygons);
        this.foreground = this.addSprite(this.config.foreground);

        // SUBSCRIBTION
        for (let re = 0; re < this.reels.length; re++) {
            this.reels[re].on("start", this.onReelStart, this);
            this.reels[re].on("preroll", this.onReelPreroll, this);
            this.reels[re].on("roll", this.onReelRoll, this);
            this.reels[re].on("postroll", this.onReelPostroll, this);
            this.reels[re].on("finish", this.onReelFinish, this);
        }

        this.tilesMap = [];
        this.createTilesMap(tiles);
        this._rollingReels = 0;
    }


    getRow(rowNumber) {
        let row = [];
        for (let i = 0; i < this.tilesMap.length; i++) {
            row.push(this.tilesMap[i][rowNumber]);
        }
        return row;
    }

    getColumn(reelNumber) {
        return [].concat(this.tilesMap[reelNumber]);
    }

    getTile(col, row) {
        return this.tilesMap[col][row];
    }


    static fromObjects(displayObjects, reelsNumber, config, maskPolygons) {
        if (!Array.isArray(displayObjects)) {
            throw Error('displayObjects must be an array')
        }
        if (parseInt(reelsNumber) < 1) {
            throw Error('reelsNumber must be an 1 or more')
        }

        let tiles = Slots.buildSrcArray(displayObjects, reelsNumber, null);

        return new Slots(tiles, maskPolygons, config);
    };


    static buildSrcArray(srcArray, reelsNumber, srcHandler) {
        let tile, tiles = [];
        for (let r = 0; r < reelsNumber; r++) {
            tiles.push([]);
            for (let i = r; i < srcArray.length; i += reelsNumber) {
                if (Array.isArray(srcArray[i])) {
                    console.warn('srcArray: one-dimention array expected')
                }
                tile = srcHandler ? srcHandler(srcArray[i]) : srcArray[i];
                tiles[r].push(tile);
            }
        }
        return tiles;
    }


    addSprite(pictha) {
        if (!pictha) {
            return
        }
        if (pictha instanceof PIXI.DisplayObject) {
            return this.addChild(pictha);

        } else if (typeof pictha === "string") {
            let sprite = this.addChild(new PIXI.Sprite.from(pictha));
            sprite.anchor.set(0.5);
            return sprite;
        }
    };


    addReels(tilesArray, maskPolygons) {
        let margin = this.config.margin;
        let xPeriod = this.config.xPeriod;
        let yPeriod = this.config.yPeriod;
        let visibleRows = this.config.visibleRows;

        for (let i = 0; i < tilesArray.length; i++) {
            let reelNumber = i;
            let reelTiles = tilesArray[i];
            let maskPolygon = maskPolygons[i]
                || [
                    -xPeriod / 2 + margin, -yPeriod + margin,
                    xPeriod / 2 - margin, -yPeriod + margin,
                    xPeriod / 2 - margin, -yPeriod + yPeriod * (visibleRows + 1) - margin,
                    -xPeriod / 2 + margin, -yPeriod + yPeriod * (visibleRows + 1) - margin,
                    -xPeriod / 2 + margin, -yPeriod + margin
                ];

            let reel = new Reel(reelNumber, reelTiles, maskPolygon, this.config);
            this.addChild(reel);
            this.reels.push(reel);
            this.alignReels();
        }
    };


    rollBy(rollDistances) {
        let rollTiles = rollDistances.concat();
        this._rollingReels = 0;

        for (let i = 0; i < rollTiles.length; i++) {
            rollTiles[i] = parseInt(rollTiles[i]);
            if (isNaN(rollTiles[i])) {
                rollTiles[i] = null;
            } else {
                this._rollingReels++
            }

        }
        this._rollingReels = Math.min(this._rollingReels, this.tilesMap.length);

        this.emit("start", {slots: this, tilesMap: this.tilesMap});

        for (let i = 0; i < rollTiles.length, i < this.tilesMap.length; i++) {
            if (isNaN(parseInt(rollTiles[i]))) {
                continue
            }
            // VIEW
            this.reels[i].roll(rollTiles[i]);
            // LOGIC
            for (let r = 0; r < rollTiles[i]; r++) {
                this.tilesMap[i].unshift(this.tilesMap[i].pop());
            }
        }

        this.emit("predictedResult", {slots: this, tilesMap: this.tilesMap});
    };


    onReelStart(e) {
        this.emit("startreel", {slots: this, reel: e, reelNumber: e.reelNumber});
    };

    onReelPreroll(e) {
        this.emit("prerollreel", {slots: this, reel: e, reelNumber: e.reelNumber});
    };

    onReelRoll(e) {
        this.emit("rollreel", {slots: this, reel: e, reelNumber: e.reelNumber});
    };

    onReelPostroll(e) {
        this.emit("postrollreel", {slots: this, reel: e, reelNumber: e.reelNumber});
    };

    onReelFinish(e) {
        this.emit("finishreel", {slots: this, reel: e, reelNumber: e.reelNumber});
        if (!this._rollingReels) {
            return
        }
        this._rollingReels--;

        if (this._rollingReels === 0) {

            this.emit("finish", {slots: this, tilesMap: this.tilesMap});
        }
    };


    alignReels() {
        for (let co = 0; co < this.reels.length; co++) {
            this.reels[co].x = (-this.reels.length / 2 + co + 0.5) * this.config.xPeriod + this.config.offsetX;
            this.reels[co].y = -this.config.yPeriod * (this.config.visibleRows - 1) / 2 + this.config.offsetY;
        }
    };


    createTilesMap(tilesArray) {
        if (!(tilesArray instanceof Array)) {
            return console.warn("Array Of Tiles Expected!")
        }

        this.tilesMap = [];
        for (let i = 0; i < tilesArray.length; i++) {
            if (!(tilesArray[i] instanceof Array)) {
                return console.warn("Array Of Tiles Expected!")
            }

            this.tilesMap.push([]);
            for (let j = 0; j < tilesArray[i].length; j++) {
                this.tilesMap[i].push(tilesArray[i][j]);
            }
        }
        return this.tilesMap;
    };

};
