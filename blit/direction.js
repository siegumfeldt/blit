// Relative directions are represented by a number of right turn
export const relativeDirections = {
    "FORWARD": 0,
    "RIGHT": 1,
    "BACK": 2,
    "LEFT": 3
}

// Absolute directions are represented by a coordinate pair
export class Direction {
    constructor(name, cols, rows) {
        this.name = name;
        this.cols = cols;
        this.rows = rows;
        this.turns = [null, null, null, null];
    }

    toString() {
        return `<Direction ${this.name} (${this.cols}, ${this.rows})>`;
    }

    reverse() {
        return this.turns[2];
    }

    plus(relativeDirection) {
        return this.turns[relativeDirection % 4];
    }
}

export let HERE = new Direction("HERE", 0, 0);
export let NORTH = new Direction("NORTH", 0, 1);
export let SOUTH = new Direction("SOUTH", 0, -1);
export let EAST = new Direction("EAST", 1, 0);
export let WEST = new Direction("WEST", -1, 0);

NORTH.turns[0] = NORTH;
NORTH.turns[1] = EAST;
NORTH.turns[2] = SOUTH;
NORTH.turns[3] = WEST;

EAST.turns[0] = EAST;
EAST.turns[1] = SOUTH;
EAST.turns[2] = WEST;
EAST.turns[3] = NORTH;

SOUTH.turns[0] = SOUTH;
SOUTH.turns[1] = WEST;
SOUTH.turns[2] = NORTH;
SOUTH.turns[3] = EAST;

WEST.turns[0] = WEST;
WEST.turns[1] = NORTH;
WEST.turns[2] = EAST;
WEST.turns[3] = SOUTH;

export const absoluteDirections = {
    "NORTH": NORTH, 
    "EAST": EAST, 
    "SOUTH": SOUTH, 
    "WEST": WEST, 
    "HERE": HERE
}
