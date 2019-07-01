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
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
`;

function main() {
    const canvas = document.querySelector('canvas')
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('No WebGL :(');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const resolutionUniformLocation = gl.getUniformLocation(program, 'uResolution');

    const positions = [
        0, 0,
        0, 50,
        700, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    resizeCanvas(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    const primitiveType = gl.TRIANGLES;
    const count = 3;
    gl.drawArrays(primitiveType, offset, count);
}

main();

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