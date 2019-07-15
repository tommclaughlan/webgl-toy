const loadGLSL = async (path) => {
    const result = await fetch(`dist/${path}`);
    const body = await result.text();
    return body;
}

const loadCompositeGLSL = async (path) => {
    return {
        header : await loadGLSL(`${path}/header.glsl`),
        body : await loadGLSL(`${path}/body.glsl`)
    };
}

export const vertexShaderBuiltins = {
    translateFunction : loadGLSL('shaders/vertex/functions/translate.glsl'),
    scaleFunction : loadGLSL('shaders/vertex/functions/scale.glsl'),
    clipSpaceFunction : loadGLSL('shaders/vertex/functions/clipSpace.glsl'),
    multiColor : loadCompositeGLSL('shaders/vertex/multicolor'),
    pointShader : loadCompositeGLSL('shaders/vertex/point')
};

export const fragmentShaderBuiltins = {
    multiColor : loadCompositeGLSL('shaders/fragment/multicolor'),
    circle : loadCompositeGLSL('shaders/fragment/circle')
};

export class ShaderBuilder {
    constructor() {
        this.vertexShaderHeader = ``;
        this.vertexShaderBody = ``;

        this.fragShaderHeader = ``;
        this.fragShaderBody = ``;

        this.vertexShaderHeaders = [];
        this.vertexShaderBodies = [];
        this.fragShaderHeaders = [];
        this.fragShaderBodies = [];
    }

    addVertexShader({ header, body }) {
        this.addVertexShaderHeader(header);
        this.addVertexShaderBody(body);
        return this;
    }

    addFragmentShader({ header, body }) {
        this.addFragmentShaderHeader(header);
        this.addFragmentShaderBody(body);
        return this;
    }

    addVertexShaderBody(body) {
        this.vertexShaderBodies.push(body);
        return this;
    }

    addVertexShaderHeader(header) {
        this.vertexShaderHeaders.push(header);
        return this;
    }

    addFragmentShaderBody(body) {
        this.fragShaderBodies.push(body);
        return this;
    }

    addFragmentShaderHeader(header) {
        this.fragShaderHeaders.push(header);
        return this;
    }

    build() {
        this.vertexShaderHeader = this.vertexShaderHeaders.join(' ');
        this.vertexShaderBody = this.vertexShaderBodies.join(' ');
        this.fragShaderHeader = this.fragShaderHeaders.join(' ');
        this.fragShaderBody = this.fragShaderBodies.join(' ');

        const vertexShader = `
        precision mediump float;
        attribute vec4 aVertexPosition;

        ${this.vertexShaderHeader}

        void main() {
            vec4 v = aVertexPosition;

            ${this.vertexShaderBody}

            gl_Position = v;
        }
        `;

        const fragmentShader = `
            precision mediump float;

            ${this.fragShaderHeader}

            void main() {
                vec4 v = vec4(0.0, 0.0, 0.0, 1.0);

                ${this.fragShaderBody}

                gl_FragColor = v;
            }
        `;

        return { vertexShader, fragmentShader };
    }

}