import buffer from './buffers';

export class GLRenderer {

    /**
     *
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.gl = canvas.getContext('webgl');

        this.scale = 8;
        this.translation = [0, 0];
        this.numElements = 0;
    }

    getResolution() {
        return [this.gl.canvas.width, this.gl.canvas.height];
    }

    setUp(program) {
        this.program = program;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.useProgram(program);
    }

    createProgram(vertexShader, fragmentShader) {
        const vShader = this.loadShader(vertexShader, this.gl.VERTEX_SHADER);
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

    resizeCanvas() {
        const w = this.gl.canvas.clientWidth;
        const h = this.gl.canvas.clientHeight;

        if (this.gl.canvas.width !== w || this.gl.canvas.height !== h) {
            this.gl.canvas.width = w;
            this.gl.canvas.height = h;
        }
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    setNumPoints(numElements) {
        this.numElements = numElements;
    }

    setAttributes(attributes) {
        for (let key in attributes) {
            const a = attributes[key];

            const buf = buffer(this.gl, this.program);
            buf(a, key, a.length / this.numElements);
        }
    }

    setUniforms(uniforms) {
        for (let key in uniforms) {
            const loc = this.gl.getUniformLocation(this.program, key);
            const u = uniforms[key];
            if (u instanceof Array) {
                switch (u.length) {
                    case 1:
                        this.gl.uniform1fv(loc, u);
                        break;
                    case 2:
                        this.gl.uniform2fv(loc, u);
                        break;
                    case 3:
                        this.gl.uniform3fv(loc, u);
                        break;
                    case 3:
                        this.gl.uniform4fv(loc, u);
                        break;
                }
            } else {
                this.gl.uniform1f(loc, u);
            }
        }
    }

    drawPoints() {
        this.resizeCanvas();
        // this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);
        // this.gl.uniform2f(this.scaleLocation, this.scale, this.scale);
        // this.gl.uniform2fv(this.translateLocation, this.translation);

        this.gl.drawArrays(this.gl.POINTS, 0, this.numElements);
    }
}