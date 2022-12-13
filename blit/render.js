const Application = PIXI.Application,
    Texture = PIXI.Texture,
    Rectangle = PIXI.Rectangle,
    Sprite = PIXI.Sprite,
    Container = PIXI.Container,
    Point = PIXI.Point
    ;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

   
const blockSize = 32;
const sheet = await PIXI.Assets.load("sprites.png");
const solidTexture = new Texture(sheet, new Rectangle(0, 0, blockSize, blockSize));
const emptyTexture = new Texture(sheet, new Rectangle(blockSize, 0, blockSize, blockSize));
const targetTexture = new Texture(sheet, new Rectangle(2*blockSize, 0, blockSize, blockSize));
const botTexture = new Texture(sheet, new Rectangle(3*blockSize, 0, blockSize, blockSize));
const lookTexture = new Texture(sheet, new Rectangle(4*blockSize, 0, blockSize, blockSize));
const feelTexture = new Texture(sheet, new Rectangle(5*blockSize, 0, blockSize, blockSize));

function getColor(position) {
    return 0xff0000;
    const r = Math.floor(Math.sin(position.row+4)/5 * 127) + 128;
    const g = Math.floor(Math.sin(position.col)/5 * 127) + 128;
    const b = Math.floor(Math.sin(position.row+position.col)/10 * 127) + 128;
    return (r << 16) + (g << 8) + b;

}


class Turn {
    constructor(sprite, fromRotation, toRotation, speed) {
        this.sprite = sprite;
        this.fromRotation = fromRotation;
        this.toRotation = toRotation;
        this.time = 0.0;
        this.totalTime = 500.0 / speed ;
    }

    animate(delta) {
        this.time += delta;
        if(this.time > this.totalTime) this.time = this.totalTime;
        let totalRotation = this.toRotation - this.fromRotation;

        if(totalRotation > Math.PI) {
            totalRotation -= 2*Math.PI;
        } else if (totalRotation < -Math.PI) {
            totalRotation += 2*Math.PI;
        }
        this.sprite.rotation = this.fromRotation + totalRotation * this.proportionDone;
    }

    get proportionDone() {
        return this.time / this.totalTime;
    }
}

class Move {
    constructor(sprite, fromX, fromY, toX, toY, speed) {
        this.sprite = sprite;
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.distance = Math.hypot(toX-fromX, toY-fromY);
        this.speed = speed;

        this.time = 0.0;
        this.totalTime = 10.0 * this.distance / speed;
    }

    animate(delta) {
        this.time += delta;
        if(this.time > this.totalTime) this.time = this.totalTime;
        this.sprite.x = this.fromX + (this.toX - this.fromX) * this.proportionDone;
        this.sprite.y = this.fromY + (this.toY - this.fromY) * this.proportionDone;
    }

    get proportionDone() {
        return this.time / this.totalTime;
    }
}

class Jump {
    constructor(sprite, fromX, fromY, toX, toY, speed) {
        this.sprite = sprite;
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.proportionDone = 0.0;

    }

    animate(delta) {
        this.sprite.x = this.toX;
        this.sprite.y = this.toY;
        this.proportionDone = 1.0;
    }
}


class Paint {
    constructor(sprite, fromColor, toColor, speed) {
        this.sprite = sprite;
        this.fromColor = fromColor;
        this.toColor = toColor;
        this.time = 0.0;
        this.totalTime = 100.0 / speed;
    }

    animate(delta) {
        this.time += delta;
        if(this.time > this.totalTime) this.time = this.totalTime;
        const fromR = (this.fromColor & 0xff0000) >> 16;
        const fromG = (this.fromColor & 0x00ff00) >> 8;
        const fromB = this.fromColor & 0x0000ff;
        const toR = (this.toColor & 0xff0000) >> 16;
        const toG = (this.toColor & 0x00ff00) >> 8;
        const toB = this.toColor & 0x0000ff;
        const R = Math.floor(fromR + (toR - fromR) * this.proportionDone);
        const G = Math.floor(fromG + (toG - fromG) * this.proportionDone);
        const B = Math.floor(fromB + (toB - fromB) * this.proportionDone);
        this.sprite.tint = (R << 16) + (G << 8) + B;
    }

    get proportionDone() {
        return this.time / this.totalTime;
    }
}

class Blink {
    constructor(sprite, speed) {
        this.sprite = sprite;
        this.time = 0.0;
        this.totalTime = 160.0 / speed ;
    }

    animate(delta) {
        this.time += delta;
        if(this.time > this.totalTime) this.time = this.totalTime;
        this.sprite.alpha = (64.0 - (this.time-8.0)**2) / 64.0;
        if(this.time == this.totalTime) {
            this.sprite.destroy();
        }
    }

    get proportionDone() {
        return this.time / this.totalTime;
    }
}


class Shake {
    constructor(sprite, fromX, fromY, rotation, speed) {
        this.sprite = sprite;
        this.fromX = fromX;
        this.fromY = fromY;
        this.rotation = rotation;
        this.time = 0.0;
        this.totalTime = 500.0 / speed;
    }

    animate(delta) {
        this.time += delta;
        if(this.time > this.totalTime) {
            this.time = this.totalTime;
            this.sprite.x = this.fromX;
            this.sprite.y = this.fromY;
        } else {
            const shakeDistance = Math.random() * 10;
            this.sprite.x = this.fromX + shakeDistance * Math.sin(this.rotation);
            this.sprite.y = this.fromY - shakeDistance * Math.cos(this.rotation);
        }
        
    }

    get proportionDone() {
        return this.time / this.totalTime;
    }
}

export class PixiRenderer {
    constructor(blit){
        this.queue = [];
        this.rows = blit.rows;
        this.cols = blit.cols;
        this.pixels = Array(this.rows*this.cols);

        this.app = new Application({
            antialias: false,
            height: this.rows*blockSize,
            width: this.cols*blockSize,
            backgroundColor: 0x000000
            });

        this.pixelContainer = new Container();
        this.app.stage.addChild(this.pixelContainer);
        blit.pixels.forEach((pixel) => { this.setPixel(pixel); } );

        this.addBotSprite(blit.startPosition);
        this.app.ticker.add(this.loop.bind(this));
        document.getElementById("game").appendChild(this.app.view);
    }

    getIndex(position) {
        return position.row*this.cols + position.col;
    }

    setPixel(pixel) {
        let pixelSprite = this.getPixelSprite(pixel);
        pixelSprite.texture = this.getPixelTexture(pixel);
        pixelSprite.tint = 0xffffff;
    }

    getPixelSprite(pixel) {
        const index = this.getIndex(pixel.position);
        if(!this.pixels[index]) {
            const sprite = new Sprite();
            sprite.anchor = new Point(0.5, 0.5);
            this.moveToPosition(sprite, pixel.position);
            this.pixels[index] = sprite;
            this.pixelContainer.addChild(sprite);
        }
        return this.pixels[index]
    }

    getPixelTexture(pixel) {
        if(pixel.isTarget) { return targetTexture; }
        if(pixel.isSolid) { return solidTexture; }
        else { return emptyTexture; }
    }
   
    addBotSprite(position) {
        this.bot = new Sprite(botTexture);
        this.bot.anchor = new Point(0.5, 0.5);
        this.bot.alpha = 1.00;
        this.moveToPosition(this.bot, position)
        this.app.stage.addChild(this.bot);
    }

    moveToPosition(sprite, position) {
        sprite.x = this.getPositionX(position);
        sprite.y = this.getPositionY(position);
    }

    getPositionX(position){
        return position.col*blockSize + blockSize/2.0; 
    }
    
    getPositionY(position){
        return (this.rows-position.row-1)*blockSize + blockSize/2.0;
    }
    
    getDirectionRotation(direction){
        if(!direction) return 0;
        return Math.atan2(direction.cols, direction.rows);
    }
    
    add(action) {
        //console.log(action)
        if(this.queue.length >= 10000) throw "Render buffer overrun";
        if(action.type == "turn") {
            const turn = new Turn(
                this.bot,
                this.getDirectionRotation(action.fromDirection),
                this.getDirectionRotation(action.toDirection),
                action.speed
                );
            this.queue.push(turn);
        }
        else if(action.type == "move") {
            const move = new Move(
                this.bot,
                this.getPositionX(action.fromPosition),
                this.getPositionY(action.fromPosition),
                this.getPositionX(action.toPosition),
                this.getPositionY(action.toPosition),
                action.speed
            );
            this.queue.push(move);
        }
        else if(action.type == "jump") {
            const jump = new Jump(
                this.bot,
                this.getPositionX(action.fromPosition),
                this.getPositionY(action.fromPosition),
                this.getPositionX(action.toPosition),
                this.getPositionY(action.toPosition),
                action.speed
            );
            this.queue.push(jump);
        }
        else if(action.type == "paint") {
            const index = this.getIndex(action.position);
            const move = new Paint(
                this.pixels[index],
                0x000000,
                getColor(action.position),
                action.speed
            );
            this.queue.push(move);
        }
        else if(action.type == "shake") {
            const move = new Shake(
                this.bot,
                this.getPositionX(action.position),
                this.getPositionY(action.position),
                this.getDirectionRotation(action.direction),
                action.speed
            );
            this.queue.push(move);
        }
        else if (action.type == "look") {
            const sprite = new Sprite(lookTexture);
            sprite.anchor = new Point(0.5, 0.5);
            sprite.alpha = 0.0;
            this.moveToPosition(sprite, action.position);
            this.pixelContainer.addChild(sprite);
            this.queue.push(new Blink(sprite, action.speed));
        }
        else if (action.type == "feel") {
            const sprite = new Sprite(feelTexture);
            sprite.anchor = new Point(0.5, 0.5);
            sprite.alpha = 0.0;
            this.moveToPosition(sprite, action.position);
            this.pixelContainer.addChild(sprite);
            this.queue.push(new Blink(sprite, action.speed));
        }
        else {
            throw `Invalid action type "${action.type}"`
        }
    }

    reset() {
        this.queue = [];
    }

    loop(delta) {
        if(this.queue.length == 0) return;
        const el = this.queue[0];
        if(!el) return;
        el.animate(delta);
        if(el.proportionDone == 1.0) {
            console.log(this.queue.shift());
        }
    }
}

