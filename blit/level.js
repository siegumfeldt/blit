import { Position } from "./position.js";
import { absoluteDirections } from "./direction.js";

class BlitError extends Error {
}

const pixelTypes = {
    "W": {
        "type": "wall",
        "isSolid": true,
        "hasBlit": false
    },
    "-": {
        "type": "floor",
        "isSolid": false,
        "hasBlit": false
    },
    "o": {
        "type": "blit",
        "isSolid": false,
        "hasBlit": true
    }
}

export function fromURL(renderer) {
    let level = {};
    let params = new URLSearchParams(window.location.search);

    level.cols = parseInt(params.get("cols")) ?? 32;
    level.rows = parseInt(params.get("rows")) ?? 32;
    level.startPosition = new Position(parseInt(params.get("startCol") ?? 0), parseInt(params.get("startRow") ?? 0));
    level.startDirection = absoluteDirections[params.get("startDirection") ?? "NORTH"];
    level.pixels = [];
    
    const pixelString = params.get("pixels");
    if(!pixelString) "Missing requires parameter 'pixels'"
    const pixelChars = pixelString.match(/[-=Wo]/ig);
    if(pixelChars.length != level.cols*level.rows) {
        throw new BlitError(`Incorrect pixel string length: Got ${pixelChars.length}, expected ${level.cols*level.rows}`);
    }
    for (let row = 0; row < level.rows; row++) {
        for (let col = 0; col < level.cols; col++) {
            const index = (level.rows-row-1)*level.cols + col;
            const char = pixelChars[index];
            const pixel = {
                "char": char,
                "index": index,
                "position": new Position(col, row),
                "blitID": `B:${col},${row}`,
                "pixelID": `P:${col},${row}`
            }
            Object.assign(pixel, pixelTypes[char]);
            level.pixels.push(pixel);
        }    
    }
    return level;
}
