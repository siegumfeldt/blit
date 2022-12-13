import { Position } from "./position.js";
import { absoluteDirections, EAST, HERE, relativeDirections, WEST } from './direction.js'
import { PixiRenderer } from './render.js'

const chars = {
    "#": {
        "isSolid": true,
        "isTarget": false,
        "isPainted": false
    },
    "-": {
        "isSolid": false,
        "isTarget": false,
        "isPainted": false
    },
    "o": {
        "isSolid": false,
        "isTarget": true,
        "isPainted": false
    },
}

export function fromURL(renderer) {
    let params = new URLSearchParams(window.location.search);

    const cols = parseInt(params.get("cols")) ?? 20;
    const rows = parseInt(params.get("rows")) ?? 20;
    const startCol = parseInt(params.get("startCol") ?? 0);
    const startRow = parseInt(params.get("startRow") ?? 0);
    const startPosition = new Position(startCol, startRow);
    const startDirection = absoluteDirections[params.get("startDirection") ?? "NORTH"];
    
    const pixelString = params.get("pixels");
    if(!pixelString) "Missing requires parameter 'pixels'"
    const pixelChars = pixelString.match(/[-#o]/ig);
    if(pixelChars.length != cols*rows) throw "Incorrect pixel string length"
    const pixels = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = (rows-row-1)*cols + col;
            const char = pixelChars[index];
            const value = chars[char];
            const pixel = {
                position: new Position(col, row),
                isSolid: value.isSolid,
                isTarget: value.isTarget,
                isPainted: value.isPainted
            }
            pixels.push(pixel);
        }    
    }

    const blit = new Blit(cols, rows, startPosition, startDirection, pixels);

    return blit;
}

export class Blit {
    constructor(cols, rows,
                startPosition=null,
                startDirection=null,
                pixels=[]
                ) {
        this.cols = cols;
        this.rows = rows;
        this.pixels = Array(cols*rows);
        this.startPixels = Array(cols*rows);
        this.position = this.startPosition = startPosition;
        this.direction = this.startDirection = startDirection;
        this.speed = 10.0;

        this.renderer = new PixiRenderer(this);   
        
        pixels.forEach((pixel) => {
            const index = pixel.position.row*this.cols + pixel.position.col;
            this.pixels[index] = pixel;
            this.startPixels[index] = {...pixel};
            this.renderer.setPixel(pixel);
        })
    }
    
    go(code) {
        const NORTH = "NORTH";
        const EAST = "EAST";
        const SOUTH = "SOUTH";
        const WEST = "WEST";
        const HERE = "HERE";
        const LEFT = "LEFT";
        const RIGHT = "RIGHT";
        const BACK = "BACK";

        const RED = "RED";
        const GREEN = "GREEN";
        const BLUE = "BLUE";
        const BLACK = "BLACK";

        const look = this.look.bind(this);
        const feel = this.feel.bind(this);
        const turn = this.turn.bind(this);
        const move = this.move.bind(this);
        const paint = this.paint.bind(this);
        const reset = this.reset.bind(this);

        const setSpeed = this.setSpeed.bind(this);

        function range(length) {
            const a = [];
            for(let i=0; i<length; i++) {
                a.push(i);
            }
            return a;
        }

        eval(code);
    }

    getPixel(position) {
        const index = position.row*this.cols + position.col;
        const pixel = this.pixels[index];
        if(pixel) { return pixel; }
        return {
            position,
            isSolid: true
        }        
    }

    resolveDirection(direction) {
        if(direction in relativeDirections) {
            return this.direction.turns[relativeDirections[direction]];
        } else if(direction in absoluteDirections) {
            return absoluteDirections[direction];
        } else {
            throw `Invalid direction: ${direction}`;
        }
    }

    feel(direction="FORWARD") {
        const position = this.position.plus(this.resolveDirection(direction));
        this.renderer.add({
            type: "feel",
            position: position,
            speed: this.speed
        });
        return this.getPixel(position).isSolid;
    }

    look(direction="FORWARD") {
        const position = this.position.plus(this.resolveDirection(direction));
        this.renderer.add({
            type: "look",
            position: position,
            speed: this.speed
        });
        return this.getPixel(position).isPainted;
    }

    turn(direction="RIGHT") {
        const newDirection = this.resolveDirection(direction);
        this.renderer.add({
            type: "turn",
            fromDirection: this.direction,
            toDirection: newDirection,
            speed: this.speed
        });
        this.direction = newDirection;
    }

    move(steps=1) {
        if(steps == 0) return;
        let moveDirection = this.direction;
        if(steps < 0) {
            moveDirection = moveDirection.plus(relativeDirections.BACK);
            steps = -steps;
        }
        for (let step = 0; step < steps; step++) {
            this.step(moveDirection);
        }
    }

    step(moveDirection) {
        const newPosition = this.position.plus(moveDirection);
        if(this.getPixel(newPosition).isSolid) {
            this.renderer.add({
                type: "shake",
                position: this.position,
                direction: moveDirection,
                speed: this.speed
            })
            // throw?
            return; // Cancel rest of moves
        }
        this.renderer.add({
            type: "move",
            fromPosition: this.position,
            toPosition: newPosition,
            speed: this.speed
        })
        this.position = newPosition;
    }

    paint(color) {
        this.renderer.add({
            type: "paint",
            position: this.position,
            speed: this.speed
//            fromColor: this.getPixel(this.position).color.toUpperCase(),
//            toColor: color
        });
        this.getPixel(this.position).isPainted = true;
    }

    reset() {
        this.speed = 10.0;
        this.renderer.reset()
        this.renderer.add({
            type: "jump",
            fromPosition: this.position,
            toPosition: this.startPosition,
            speed: this.speed
        })
        this.renderer.add({
            type: "turn",
            fromDirection: this.direction,
            toDirection: this.startDirection,
            speed: this.speed
        })
        this.position = this.startPosition;
        this.direction = this.startDirection;
        this.pixels = structuredClone(this.startPixels);
        this.pixels.forEach((pixel) => {
            console.log("reset", pixel)
            this.renderer.setPixel(pixel)
        })
}

    setSpeed(speed) {
        if(speed < 1.0 || speed > 100.0) throw "Invalid speed";
        console.log("Setting speed to", speed);
        this.speed = speed;
    }
}
