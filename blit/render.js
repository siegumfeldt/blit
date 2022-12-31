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

const botTexture = new Texture(sheet, new Rectangle(2*blockSize, 0, blockSize, blockSize));
const blitTexture = new Texture(sheet, new Rectangle(3*blockSize, 0, blockSize, blockSize));

const pixelTextures = {
    "wall": new Texture(sheet, new Rectangle(0, 0, blockSize, blockSize)),
    "floor": new Texture(sheet, new Rectangle(blockSize, 0, blockSize, blockSize)),
    "blit": new Texture(sheet, new Rectangle(blockSize, 0, blockSize, blockSize)),
}

function mixColors(mainColor, mixColor, mixProportion) {
    const mainProportion = 1.0 - mixProportion;
    const mainR = (mainColor & 0xff0000) >> 16;
    const mainG = (mainColor & 0x00ff00) >> 8;
    const mainB = mainColor & 0x0000ff;
    const mixR = (mixColor & 0xff0000) >> 16;
    const mixG = (mixColor & 0x00ff00) >> 8;
    const mixB = mixColor & 0x0000ff;
    const R = Math.floor(mainProportion*mainR + mixProportion*mixR);
    const G = Math.floor(mainProportion*mainG + mixProportion*mixG);
    const B = Math.floor(mainProportion*mainB + mixProportion*mixB);
    return (R << 16) + (G << 8) + B;
}

class Counter {
    constructor(number, total) {
        const style = new PIXI.TextStyle({
            fill: "#ddffff",
            fontFamily: "\"Lucida Console\", Monaco, monospace",
            fontSize: 19,
            fontWeight: "lighter"
        });
        this.sprite = new PIXI.Text("[]", style);
        this.sprite.alpha = 0.5;
        this.number = number;
        this.total = total;
    }

    /**
     * @param {number} value
     */
    set number(value) {
        this._number = value;
        this.sprite.text = `blits: ${this._number}/${this._total}`
    }

    /**
     * @param {number} value
     */
     set total(value) {
        this._total = value;
        this.sprite.text = `blits: ${this._number}/${this._total}`
    }

}

class Animation {
    constructor(f, speed) {
        this.f = f;
        this.frames = 0.0;
        this.totalFrames = 60.0;
        this.speed = speed;
    }

    get proportionDone() {
        return this.frames / this.totalFrames;
    }

    animate(delta) {
        this.frames += delta * this.speed;
        if(this.frames > this.totalFrames) this.frames = this.totalFrames;
        this.f(this.proportionDone);
    }
}


export class Renderer {
    constructor(element, level){
        this.queue = [];

        this.cols = level.cols;
        this.rows = level.rows;

        this.app = new Application({
                antialias: false,
                height: level.rows * blockSize,
                width: level.cols * blockSize,
                backgroundColor: 0x444444
            });

        this.background = new Container();
        this.foreground = new Container();
        this.sprites = new Map();
        this.blits = [];
        this.pixels = [];
        this.resetters = [];
        this.app.stage.addChild(this.background);
        this.app.stage.addChild(this.foreground);

        level.pixels.forEach((pixel) => this.addPixelSprite(pixel));
        this.addBotSprite(level.startPosition, level.startDirection);
        level.pixels.forEach((pixel) => this.addBlitSprite(pixel));

        this.counter = new Counter(0, this.blits.length);
        this.app.stage.addChild(this.counter.sprite);

        this.app.ticker.add(this.loop.bind(this));
        element.appendChild(this.app.view);

    }
    
    reset(position, direction) {
        this.queue.length = 0;
        this.moveToPosition(this.bot, position);
        this.rotateToDirection(this.bot, direction);
        this.resetters.forEach(r => r());
        this.counter.number = 0;
    }

    addPixelSprite(pixel) {
        const texture = pixelTextures[pixel.type];
        const sprite = new Sprite(texture);
        sprite.anchor = new Point(0.5, 0.5);
        this.background.addChild(sprite);
        this.sprites[pixel.pixelID] = sprite;
        this.pixels.push(sprite);

        const reset = () => {
            sprite.tint = this.getColor(pixel.position);
            this.moveToPosition(sprite, pixel.position);
        }
        reset();
        this.resetters.push(reset);
    }

    addBlitSprite(pixel) {
        if(!pixel.hasBlit) {
            return;
        }
        const texture = blitTexture;
        const sprite = new Sprite(texture);
        sprite.anchor = new Point(0.5, 0.5);
        this.moveToPosition(sprite, pixel.position);
        this.foreground.addChild(sprite);
        this.sprites[pixel.blitID] = sprite;
        this.blits.push(sprite);

        const reset = () => {
            sprite.tint = 0xffffff;
            this.moveToPosition(sprite, pixel.position);
        }
        reset();
        this.resetters.push(reset);

    }

    getIndex(position) {
        return position.row*this.cols + position.col;
    }

    getPixelTexture(pixel) {
        if(pixel.isSolid) { return solidTexture; }
        else { return emptyTexture; }
    }
   
    addBotSprite(position, direction) {
        this.bot = new Sprite(botTexture);
        this.bot.anchor = new Point(0.5, 0.5);
        this.bot.alpha = 1.00;
        this.bot.tint = 0xffff33;
        this.moveToPosition(this.bot, position)
        this.rotateToDirection(this.bot, direction)
        this.app.stage.addChild(this.bot);
    }

    moveBotSprite(position, direction) {
        this.moveToPosition(this.bot, position);
        this.rotateToDirection(this.bot, direction);
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
    
    rotateToDirection(sprite, direction) {
        sprite.rotation = this.getDirectionRotation(direction)
    }

    getDirectionRotation(direction){
        if(!direction) return 0;
        return Math.atan2(direction.cols, direction.rows);
    }
    
    getColor(position) {
        const r = 256 - position.row * 8 - 1;
        const g = 256 - position.col * 8 - 1;
        const b = position.col*4 + position.col*4;
        return (r << 16) + (g << 8) + b;
    }

    play(actions) {
        actions.forEach(action => this.add(action));
    }

    add(action) {
        if(this.queue.length >= 10000) throw "Render buffer overrun";
        if(action.type == "turn") {

            const fromRotation = this.getDirectionRotation(action.fromDirection);
            const toRotation = this.getDirectionRotation(action.toDirection);

            let totalRotation = toRotation - fromRotation;

            if(totalRotation > Math.PI) {
                totalRotation -= 2*Math.PI;
            } else if (totalRotation < -Math.PI) {
                totalRotation += 2*Math.PI;
            }
            this.queue.push(new Animation((p) => {
                this.bot.rotation = fromRotation + totalRotation * p;
            }, action.speed));
        }
        else if(action.type == "move") {
            const fromX = this.getPositionX(action.fromPosition);
            const fromY = this.getPositionY(action.fromPosition);
            const toX = this.getPositionX(action.toPosition);
            const toY = this.getPositionY(action.toPosition);
            
            this.queue.push(new Animation((p) => {
                this.bot.x = fromX + (toX - fromX) * p;
                this.bot.y = fromY + (toY - fromY) * p;
            }, action.speed))
        }
        else if(action.type == "shake") {
            const x = this.bot.x;
            const y = this.bot.y;
            const dx = action.toPosition.col - action.fromPosition.col;
            const dy = action.toPosition.row - action.fromPosition.row;
            this.queue.push(new Animation((p) => {
                if(p == 1.0) {
                    this.bot.x = x;
                    this.bot.y = y;
                } else {
                    const shakeDistance = Math.random()*10 - 5;
                    this.bot.x = x + shakeDistance * dx;
                    this.bot.y = y - shakeDistance * dy;
                }
            }, action.speed))
        }

        else if (action.type == "look") {
            const sprite = this.sprites[action.id];
            if(!sprite) return;
            const mainColor = sprite.tint;
            this.queue.push(new Animation((p) => {
                    const mixProportion = p * (1.0-p); // Parabola 0 -> 1 -> 0
                    sprite.tint = mixColors(mainColor, 0x000000, mixProportion);
                }, action.speed*5))
        }
        else if (action.type == "blit") {
            const sprite = this.sprites[action.id];
            const color = this.getColor(action.position);
            if(!sprite) return;
            const mainColor = 0xffffff;
            this.queue.push(new Animation((p) => {
                    this.counter.number = action.blitsDone;
                    sprite.tint = mixColors(mainColor, color, p);
                }, action.speed*5))
        }
        else if (action.type == "reset") {
            this.reset(action.position, action.direction)
        }
        else if (action.type == "win") {
            this.queue.push(new Animation((p) => {
                this.pixels.forEach(pixel => pixel.tint = mixColors(pixel.tint, 0x000000, p));
            }, action.speed/500))
    }
        else {
            throw `Invalid action type "${action.type}"`
        }
    }

    loop(delta) {
        if(this.queue.length == 0) return;
        const el = this.queue[0];
        if(!el) return;
        el.animate(delta);
        if(el.proportionDone == 1.0) {
            //console.log(this.queue.shift());
            this.queue.shift();
        }
    }
}

