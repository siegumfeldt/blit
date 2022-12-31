import { absoluteDirections, relativeDirections } from './direction.js'

export class Game {
    constructor(level) {
        this.pixels = [...level.pixels]
        this.cols = level.cols;
        this.rows = level.rows;

        this.position = this.startPosition = level.startPosition;
        this.direction = this.startDirection = level.startDirection;

        this.speed = 1.0;
        this.actions = Array();
    }

    setSpeed(speed) {
        if(!speed || speed <= 0.0) throw "Invalid speed";
        this.speed = speed;
    }

    checkPosition(position) {
        return position.col >= 0 && position.row >= 0 && position.col < this.cols && position.row < this.rows;
    }

    getPixel(position) {
        if(this.checkPosition(position)) {
            return this.pixels[position.row*this.cols + position.col];
        }
        else {
            return {
                "position": position,
                "type": "wall",
                "isSolid": true,
                "hasBlit": false
            }
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

    emit(action) {
        console.log(action.text);
        action.speed = this.speed;
        this.actions.push(action);
    }
    
    look(direction="FORWARD", projection=null) {
        const position = this.position.plus(this.resolveDirection(direction));
        const pixel = this.getPixel(position);
        const _projection = projection ?? ((pixel) => pixel);
        this.emit({
            type: "look",
            text: `Look at ${position}`,
            id: pixel.pixelID
        });
        return _projection(pixel);
    }

    turn(direction="RIGHT") {
        const newDirection = this.resolveDirection(direction);
        this.emit({
            type: "turn",
            text: `Turn from ${this.direction.name} to ${newDirection.name}`,
            fromDirection: this.direction,
            toDirection: newDirection
        });
        this.direction = newDirection;
    }

    moveMany(steps=1, direction="FORWARD") {
        if(steps <= 0) return;
        move(direction);
        this.moveMany(steps-1)

    }

    move(direction="FORWARD") {
        const _direction = this.resolveDirection(direction);
        const newPosition = this.position.plus(_direction);
        if(this.getPixel(newPosition).isSolid) {
            this.emit({
                type: "shake",
                text: `Trying to move ${direction} from ${this.position}`,
                fromPosition: this.position,
                toPosition: newPosition
            })
        } else {
            this.emit({
                type: "move",
                text: `Moving ${direction} from ${this.position} to ${newPosition}`,
                fromPosition: this.position,
                toPosition: newPosition
            })
            this.position = newPosition;
        }
    }

    blit() {
        const pixel = this.getPixel(this.position);
        if (!pixel.hasBlit) {
            return;
        }
        if (pixel.isBlitted) {
            return;
        }
        pixel.isBlitted = true;
        this.emit({
            type: "blit",
            text: `Blit ${this.position}`,
            position: pixel.position,
            id: pixel.blitID,
            blitsDone: this.pixels.filter(pixel => pixel.hasBlit && pixel.isBlitted).length
        });
        if(!this.pixels.some(pixel => pixel.hasBlit && !pixel.isBlitted)) {
            this.emit({
                type: "win",
                text: `Win!`
            });        
        }
    }

    reset() {
        this.position = this.startPosition;
        this.direction = this.startDirection;
        this.pixels.forEach(pixel => {
            if(pixel.isBlitted) pixel.isBlitted = false;
        })
        this.emit({
            type: "reset",
            text: `Reset`,
            position: this.startPosition,
            direction: this.startDirection
        });    
}

    wait() {
        this.emit({ type: "wait" });
    }

    go(code) {
        this.actions.length = 0;
        const goFast = () => this.setSpeed(10.0);
        const goSlow = () => this.setSpeed(10.0);
        const look = this.look.bind(this);
        const turn = this.turn.bind(this);
        const move = this.move.bind(this);
        const blit = this.blit.bind(this);
        const reset = this.reset.bind(this);
        const wait = this.wait.bind(this);

        function range(length) {
            const a = [];
            for(let i=0; i<length; i++) {
                a.push(i);
            }
            return a;
        }

        eval(code);
    }

}
