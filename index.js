//@ts-check
const vsSource = `
    attribute vec2 aPosition;

    uniform vec2 uResolution;

    void main() {
        vec2 posToClip = (2.0 * (aPosition / uResolution)) - 1.0;
        gl_Position = vec4(posToClip, 0, 1);
    }
`;

const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
        gl_FragColor = uColor;
    }
`;

function main() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector('#webgl')
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('No WebGL :(');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    render(gl, program);
}

main();

/**
 *
 * @param {WebGLRenderingContextBase} gl
 * @param {WebGLProgram} program
 */
function render(gl, program) {
    resizeCanvas(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const resolutionUniformLocation = gl.getUniformLocation(program, 'uResolution');
    const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    const colorUniformLocation = gl.getUniformLocation(program, 'uColor');

    gl.uniform4f(colorUniformLocation, 0, 0, 1, 1);

    for (let i = 0; i < 200; i++) {
        gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
        createCircle(gl, 100 + random(gl.canvas.width - 200), 100 + random(gl.canvas.height - 200), random(50));
    }
}

function random(range) {
    return Math.floor(Math.random() * range);
}

/**
 *
 * @param {WebGLRenderingContextBase} gl
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
function createRect(gl, x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y2,
        x1, y2,
        x1, y1,
        x2, y1,
        x2, y2
    ]), gl.STATIC_DRAW);
}

/**
 *
 * @param {WebGLRenderingContextBase} gl
 * @param {number[][]} points
 * @param {number} width
 */
function strokePath(gl, points, width) {
    const verts = [];
    points.forEach((p, i) => {

        if (i + 1 < points.length) {
            const x1 = p[0];
            const x2 = points[i + 1][0];
            const y1 = p[1];
            const y2 = points[i + 1][1];

            const dx = x2 - x1;
            const dy = y2 - y1;

            const theta = Math.atan(dy / dx);

            const xp = (width / 2) * Math.sin(theta);
            const yp = (width / 2) * Math.cos(theta);

            const c1 = [x1 + xp, y1 - yp];
            const c2 = [x2 + xp, y2 - yp];
            const c3 = [x2 - xp, y2 + yp];
            const c4 = [x1 - xp, y1 + yp];

            verts.push(...c4, ...c1, ...c3, ...c2);
        } else {
            const x1 = points[i-1][0];
            const x2 = p[0];
            const y1 = points[i-1][1];
            const y2 = p[1];

            const dx = x2 - x1;
            const dy = y2 - y1;

            const theta = Math.atan(dy / dx);

            const xp = (width / 2) * Math.sin(theta);
            const yp = (width / 2) * Math.cos(theta);

            const c2 = [x2 + xp, y2 - yp];
            verts.push(...c2);
        }
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const count = verts.length / 2;
    const offset = 0;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, count);
}

function createCircle(gl, cx, cy, r) {
    const verts = [];

    const nPoints = 10 + (10 * Math.ceil(Math.log10(r)));

    const rad = (2 * Math.PI) / nPoints;

    /**
     * Go around the circle taking points from the start on either side
     *
     *                   1
     *                3     2
     *               5       4
     *                7     6
     *                   8
     *
     * and use those points as vertices for a TRIANGLE_STRIP constructed circle
     */
    for (let i = 0; i <= nPoints / 2; i++) {
        const x1 = cx + (r * Math.cos(rad * i));
        const y1 = cy + (r * Math.sin(rad * i));

        const x2 = cx + (r * Math.cos(rad * -i));
        const y2 = cy + (r * Math.sin(rad * -i));

        verts.push(x1, y1, x2, y2);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const count = verts.length / 2;
    const offset = 0;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, count);
}

/**
 *
 * @param {WebGLRenderingContextBase} gl
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} width
 */
function createLine(gl, x1, y1, x2, y2, width) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    const theta = Math.atan(dy / dx);

    const xp = (width / 2) * Math.sin(theta);
    const yp = (width / 2) * Math.cos(theta);

    const c1 = [x1 + xp, y1 - yp];
    const c2 = [x2 + xp, y2 - yp];
    const c3 = [x2 - xp, y2 + yp];
    const c4 = [x1 - xp, y1 + yp];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        c4[0], c4[1],
        c1[0], c1[1],
        c2[0], c2[1],
        c4[0], c4[1],
        c2[0], c2[1],
        c3[0], c3[1]
    ]), gl.STATIC_DRAW);
}

/**
 *
 * @param {WebGLRenderingContextBase} gl
 * @param {number} type
 * @param {string} source
 *
 * @return {WebGLShader}
 */
function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 *
 * @param {WebGLRenderingContextBase} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 *
 * @return {WebGLProgram}
 */
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
function resizeCanvas(canvas) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}