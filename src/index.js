import { GLRenderer } from './webgl/renderer';
import { Circle } from './circle';

const canvas = document.querySelector('#webgl');


const renderer = new GLRenderer(canvas);

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    renderer.zoom(-e.deltaY / 1000);
});

let dragging = false;

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
});
canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    dragging = false;
    lastMouse = [];
});

let lastMouse = [];

canvas.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (dragging) {
        if (lastMouse.length > 0) {
            let dragAmount = [e.offsetX - lastMouse[0], lastMouse[1] - e.offsetY];
            renderer.translate(dragAmount);
        }

        lastMouse = [e.offsetX, e.offsetY];
    }
})

const circles = [];

for (let i = 0; i < 1000000; i++) {
    circles.push(new Circle(Math.random() * 1500, Math.random() * 800, 5 + Math.random() * 10));
}

circles.forEach((c, i) => {
    if (i % 4 == 0) {
        c.setColor([Math.random(), Math.random(), Math.random(), 0.7]);
    }
});

renderer.setUp();

let lastFrame = Date.now();
let frameTime = 0;
let frames = 0;

let points = new Float32Array(circles.length * 3);
let colors = new Float32Array(circles.length * 4);

let pindex = 0;
let cindex = 0;
circles.forEach((c, i) => {
    // c.r += 2 * (Math.random() - 0.5);
    // if (c.r < 1)  c.r = 1;
    // if (c.r > 50) c.r = 50;
    // c.move(2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5));
    // if (Math.random() > 0.99) {
    //     c.setColor([Math.random(), Math.random(), Math.random(), 0.7]);
    // }
    const p = new Float32Array(c.getPoints());
    const col = new Float32Array(c.getColors());

    // renderer.updatePoints(p, i * 3, col, i * 4);

    points[pindex++] = p[0];
    points[pindex++] = p[1];
    points[pindex++] = p[2];
    colors[cindex++] = col[0];
    colors[cindex++] = col[1];
    colors[cindex++] = col[2];
    colors[cindex++] = col[3];
});
renderer.setPoints(points, colors);

const render = () => {
    fps();

    renderer.drawPoints();

    requestAnimationFrame(render);
}

const fps = () => {
    let fps = 1000 / (Date.now() - lastFrame);
    lastFrame = Date.now();
    frameTime += fps;
    frames++;

    if (frames === 25) {
        document.querySelector('#fps').innerHTML = `${(frameTime / frames).toFixed(2)} FPS`;
        frames = 0;
        frameTime = 0;
    }
}

requestAnimationFrame(render);