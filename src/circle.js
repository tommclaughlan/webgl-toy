

export class Circle {
    constructor(cx, cy, r) {
        this.x = cx;
        this.y = cy;
        this.r = r;
        this.color = [0.6, 0.6, 0.6, 0.8];
    }

    getPoints() {
        return [this.x, this.y, this.r];
    }

    getColors() {
        return this.color;
    }

    setColor(color) {
        this.color = color;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}