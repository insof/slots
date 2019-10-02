import Layout from "../utils/Layout"
import Tile from "../engine/Tile"
import Slots from "../engine/Slots"
import {Tween, Easing, autoPlay} from 'es6-tween'

import '../vendor/pixi-4.5.1.js';

class GameField extends PIXI.Sprite {

    constructor() {
        super();
        autoPlay(true);
        this.back = this.addChild(new PIXI.Sprite.from("back"));
        this.back.anchor.set(0.5);

        this.slots = null;
        this.addSlots();

        this.button = null;
        this.addButton();

        this._spinNumber = 0;

        // ACTIVATION
        this.chargeSpin();

        this.shader = this.addChild(new PIXI.Graphics());
        this.shader.visible = false;

        this.rotateImage = this.shader.addChild(new PIXI.Sprite.from("rotate"));
        this.rotateImage.anchor.set(0.5);

        this.onResize();

    }

    addSlots() {
        let config = {
            margin: 2,
            preRollTiles: 0.33,
            postRollTiles: 0.33,
            xPeriod: 200,
            yPeriod: 180,
            rollEasing: false, // if present bounce effect will be made by Easing, else pre/post rolls will // Easing.Bounce.InOut
            // showMask: true, // shows masks
        };

        let elements = [
            Tile.create('P'), Tile.create('P'), Tile.create('10'), Tile.create('J'), Tile.create('A'),
            Tile.create('A'), Tile.create('10'), Tile.create('K'), Tile.create('K'), Tile.create('K'),
            Tile.create('K'), Tile.create('J'), Tile.create('Q'), Tile.create('P'), Tile.create('Q'),
            Tile.create('10'), Tile.create('K'), Tile.create('J'), Tile.create('10'), Tile.create('P'),
            Tile.create('J'), Tile.create('A'), Tile.create('P'), Tile.create('K'), Tile.create('J'),
        ];

        this.slots = this.addChild(Slots.fromObjects(elements, 5, config));

        // SIDE MARKERS

        let marker = new PIXI.Graphics()
            .beginFill(0xff5500)
            .drawRect(-20, -5, 40, 10)
            .endFill();
        marker = this.slots.addChild(marker.clone());
        marker.x -= 530;
        marker = this.slots.addChild(marker.clone());
        marker.x += 530;
    }

    addButton() {
        let btn = new PIXI.Graphics().beginFill(0x5555ff).drawRoundedRect(-100, -40, 200, 80, 20).endFill();
        btn.y += 390;

        let title = new PIXI.Text('Spin', {
            fill: 0xcccccc,
            fontFamily: 'Arcade',
            fontSize: 44,
            fontWeight: 'bold',
        });
        title.anchor.set(0.5);
        btn.addChild(title);
        title.y = 5;

        this.button = this.addChild(btn);
        this.button.interactive = true;
    }

    showMatch(data) {
        let row = data.slots.getRow(1),
            type = row[0].type,
            matchTiles = [],
            i, tile;

        for (i = 0; i < row.length; i++) {
            tile = row[i];
            if (type === tile.type) {
                matchTiles.push(tile);
            }
        }

        if (matchTiles.length === row.length) {

            // MATCH ANIMATION - Tweens have strange behavior here
            for (let i = 0; i < matchTiles.length; i++) {
                tile = matchTiles[i];
                tile.tween = new Tween(tile)
                    .to({alpha: 0.5}, 300)
                    .repeat(3)
                    .easing(Easing.Elastic.InOut)
                    .yoyo(true)
                    .on("complete", () => {
                        if (tile.tween) {
                            tile.tween = null;
                        }
                    })
                    .start();
            }
        }
    };

    chargeSpin() {
        this.button.once('pointerdown', this.spinRandom, this);
        this.slots.once('finish', this.showMatch, this);
        this.slots.once('finish', this.chargeSpin, this);
        this.slots.once('predictedResult', this.computePredictedResult, this);
    };

    computePredictedResult(data) {
        let row = [],
            type,
            matchTiles = [],
            i, tileType;

        for (let j = 0; j < data.tilesMap.length; j++) {
            row.push(data.tilesMap[j][1].type);
        }

        type = row[0];

        console.log("predicted spin result = " + row);
        this.showPrediction(row);

        for (i = 0; i < row.length; i++) {
            tileType = row[i];
            if (type === tileType) {
                matchTiles.push(tileType);
            }
        }

        if (matchTiles.length === row.length) {
            console.log("SPIN WILL BE WINNING!");
            console.log("predicted win result = " + matchTiles);
        }
    }

    showPrediction(arr) {
        let text = 'Predicted spin result = ' + arr.join(", ");
        if (this.predictionText) {
            this.predictionText.text = text;
        } else {
            this.predictionText = new PIXI.Text(text, {
                fill: 0xcccccc,
                fontFamily: 'Arcade',
                fontSize: 45,
                fontWeight: 'bold',
            });
            this.predictionText.anchor.set(0.5);
            this.addChild(this.predictionText);
            this.predictionText.y = 330;
        }
    }

    spinRandom() {
        // STOP TWEENS
        this.slots.tilesMap.forEach(function (ree) {
            for (let i = 0; i < ree.length; i++) {
                if (ree[i].tween) {
                    ree[i].tween.stop();
                    ree[i].alpha = 1;
                    ree[i].tween = null;
                }
            }
        });

        // SPIN DISTANCES - first - winning
        let spinTiles = null;
        if (this._spinNumber === 0) {
            spinTiles = [1, 1, 2, 4, 3]
        } else {
            spinTiles = [
                1 + Math.random() * 19,
                1 + Math.random() * 19,
                1 + Math.random() * 19,
                1 + Math.random() * 19,
                1 + Math.random() * 19,
            ];
        }

        this.slots.rollBy(spinTiles);
        this._spinNumber++
    };

    onResize() {
        if (Layout.orientation === Layout.LANDSCAPE) {
            this.shader.visible = false;
            if (this.predictionText) this.predictionText.visible = true;
            this.back.height = Layout.gameHeight;
            this.back.scale.x = this.back.scale.y;
            this.slots.position.set(0, -35);
        } else {
            this.predictionText.visible = false;
            this.shader.clear();
            this.shader.beginFill(0x555555, 1);
            this.shader.drawRect(-Layout.gameWidth / 2, -Layout.gameHeight / 2, Layout.gameWidth, Layout.gameHeight);
            this.shader.endFill();
            this.shader.visible = true;
        }
    }
}

export default GameField;