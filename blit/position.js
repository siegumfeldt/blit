export class Position {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }

    toString() {
        return `(${this.col}, ${this.row})`;
    }

    plus(direction) {
        return new Position(this.col + direction.cols, this.row + direction.rows);
    }
    
    equals(other) {
        return this.col == other.col && this.row == other.row;
    }

    distanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        Math.sqrt(dx*dx + dy*dy);
    }
}