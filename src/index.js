import { GLRenderer } from './webgl/renderer';
import { Circle } from './circle';
import { ShaderBuilder, vertexShaderBuiltins, fragmentShaderBuiltins } from './webgl/shaderBuilder';

main();

async function main () {
    const canvas = document.querySelector('#webgl');

    let translation = [0, 0];
    let scale = 8;

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale *= 1 + (-e.deltaY / 1000);
        if (scale <= 0.1) {
            scale = 0.1;
        }
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
                let [xTran, yTran] = [e.offsetX - lastMouse[0], lastMouse[1] - e.offsetY];
                translation = [translation[0] + (xTran / scale), translation[1] + (yTran / scale)];
            }

            lastMouse = [e.offsetX, e.offsetY];
        }
    })

    const circles = [];

    for (let i = 0; i < 10000; i++) {
        circles.push(new Circle(Math.random() * 1500, Math.random() * 800, 5 + Math.random() * 10));
    }

    circles.forEach((c, i) => {
        if (i % 4 == 0) {
            c.setColor([Math.random(), Math.random(), Math.random(), 0.7]);
        }
    });

    let lastFrame = Date.now();
    let frameTime = 0;
    let frames = 0;

    let points = new Float32Array(circles.length * 3);
    let colors = new Float32Array(circles.length * 4);

    let pindex = 0;
    let cindex = 0;
    circles.forEach((c, i) => {
        c.r += 2 * (Math.random() - 0.5);
        if (c.r < 1)  c.r = 1;
        if (c.r > 50) c.r = 50;
        c.move(2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5));
        if (Math.random() > 0.99) {
            c.setColor([Math.random(), Math.random(), Math.random(), 0.7]);
        }
        const p = new Float32Array(c.getPoints());
        const col = new Float32Array(c.getColors());

        points[pindex++] = p[0];
        points[pindex++] = p[1];
        points[pindex++] = p[2];
        colors[cindex++] = col[0];
        colors[cindex++] = col[1];
        colors[cindex++] = col[2];
        colors[cindex++] = col[3];
    });



    const shaderBuilder = new ShaderBuilder();

    shaderBuilder.addVertexShaderHeader(`uniform float t;`);
    shaderBuilder.addVertexShaderHeader(await vertexShaderBuiltins.translateFunction);
    shaderBuilder.addVertexShaderHeader(await vertexShaderBuiltins.scaleFunction);
    shaderBuilder.addVertexShaderHeader(await vertexShaderBuiltins.clipSpaceFunction);
    shaderBuilder.addVertexShader(await vertexShaderBuiltins.multiColor);
    shaderBuilder.addVertexShaderBody(`
        v[2] = v[2] + (8.0 * (sin(radians(t * 2.0)) + 1.0));
    `);
    shaderBuilder.addVertexShader(await vertexShaderBuiltins.pointShader);
    shaderBuilder.addVertexShaderBody(`
        v = vec4(scale(clipSpace(translate(v.xy))), 0, 1);
    `);

    shaderBuilder.addFragmentShaderHeader(`uniform float t;`);
    shaderBuilder.addFragmentShader(await fragmentShaderBuiltins.multiColor);
    shaderBuilder.addFragmentShader(await fragmentShaderBuiltins.circle);
    shaderBuilder.addFragmentShaderBody(`
        v.a = length(clamp(gl_PointCoord, 0.3, 1.0));
        float r = sin(gl_PointCoord.x * gl_FragCoord.y * t);
        v.a = clamp(v.a * ((1.0 + sin(r * t)) / 2.0), 0.3, 1.0);
    `);
    shaderBuilder.addFragmentShaderBody(`
        if (length(2.0 * gl_PointCoord - 1.0) * vSize > vSize - 2.0) {
            v = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `);

    const renderer = new GLRenderer(canvas);

    const shaders = shaderBuilder.build();
    const program = renderer.createProgram(shaders.vertexShader, shaders.fragmentShader);

    renderer.setUp(program);

    renderer.setNumPoints(circles.length);
    renderer.setAttributes({
        aColor : colors,
        aVertexPosition : points
    });
    let time = 0;
    const render = () => {

        renderer.setUniforms({
            uResolution: renderer.getResolution(),
            uScale: [scale, scale],
            uTranslate: translation,
            t: time++
        });
        renderer.drawPoints();

        requestAnimationFrame(render);

        fps();
    };




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
}