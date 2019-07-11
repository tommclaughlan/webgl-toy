import { translateFunction, scaleFunction, clipSpaceFunction, vertexShader, fragmentShader } from './shaders';
import buffer from './buffers';

export class GLRenderer {

    /**
     *
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.gl = canvas.getContext('webgl');
        this.program = this.createProgram();
        this.positionBuffer = buffer(this.gl);
        this.colorBuffer = buffer(this.gl);

        this.scale = 8;
        this.translation = [0, 0];
        this.numElements = 0;

        this.vertexLocation = this.gl.getAttribLocation(this.program, 'aVertexPosition');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'aColor');
        this.sizeLocation = this.gl.getAttribLocation(this.program, 'aSize');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'uResolution');
        this.scaleLocation = this.gl.getUniformLocation(this.program, 'uScale');
        this.translateLocation = this.gl.getUniformLocation(this.program, 'uTranslate');
    }

    setUp() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer.loc());
        this.gl.vertexAttribPointer(
            this.vertexLocation,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);
        this.gl.enableVertexAttribArray(this.vertexLocation);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer.loc());
        this.gl.vertexAttribPointer(
            this.colorLocation,
            4,
            this.gl.FLOAT,
            false,
            0,
            0);
        this.gl.enableVertexAttribArray(this.colorLocation);
    }

    createProgram() {
        const vShader = this.loadShader(translateFunction + scaleFunction + clipSpaceFunction + vertexShader, this.gl.VERTEX_SHADER);
        const fShader = this.loadShader(fragmentShader, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.log(this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    loadShader(source, type) {
        const shader = this.gl.createShader(type);

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    zoom(amount) {
        this.scale += amount;
        if (this.scale <= 0.1) {
            this.scale = 0.1;
        }
    }

    translate([xTran, yTran]) {
        this.translation = [this.translation[0] + (xTran / this.scale), this.translation[1] + (yTran / this.scale)];
    }

    resizeCanvas() {
        const w = this.gl.canvas.clientWidth;
        const h = this.gl.canvas.clientHeight;

        if (this.gl.canvas.width !== w || this.gl.canvas.height !== h) {
            this.gl.canvas.width = w;
            this.gl.canvas.height = h;
        }
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    setPoints(points, colors) {
        this.positionBuffer(points);
        this.colorBuffer(colors);
        this.numElements = points.length / 3;
    }

    drawPoints() {
        this.resizeCanvas();
        this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform2fv(this.scaleLocation, [this.scale, this.scale]);
        this.gl.uniform2fv(this.translateLocation, this.translation);

        this.gl.drawArrays(this.gl.POINTS, 0, this.numElements);
    }

    updatePoints(points, pOffset, colors, cOffset) {
        this.positionBuffer.updateData(pOffset, points);
        this.colorBuffer.updateData(cOffset, colors);
    }

    draw(count) {
        this.resizeCanvas();
        this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.drawArrays(this.gl.POINTS, 0, count);
    }
}