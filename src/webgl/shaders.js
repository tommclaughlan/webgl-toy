export const translateFunction = `
    uniform vec2 uTranslate;

    vec2 translateVertex(vec2 vertex) {
        return vertex + uTranslate;
    }
`;

export const scaleFunction = `
    uniform vec2 uScale;

    vec2 scaleVertex(vec2 vertex) {
        return vertex * uScale;
    }
`;

export const clipSpaceFunction = `
    uniform vec2 uResolution;

    vec2 toClipSpace(vec2 vertex) {
        return scaleVertex((2.0 * (translateVertex(vertex) / uResolution)) - 1.0);
    }
`;

const passColourVertexShader = {
    header : `
        attribute vec4 aColor;

        varying vec4 vColor;
    `,
    body : `
        vColor = aColor;
    `
};

const pointVertexShader = {
    header : `
        varying float vSize;
    `,
    body : `
        vSize = v[2];

        gl_PointSize = vSize;
    `
};

const toClipSpaceBody = `
    v = vec4(toClipSpace(v.xy), 0.0, 1.0);
`;

const vertexShaderHeader = `
    ${passColourVertexShader.header}
    ${pointVertexShader.header}
    ${translateFunction}
    ${scaleFunction}
    ${clipSpaceFunction}
    `;
const vertexShaderBody = `
    ${passColourVertexShader.body}
    ${pointVertexShader.body}
    ${toClipSpaceBody}
    `;

export const vertexShader = `
    precision mediump float;
    attribute vec4 aVertexPosition;

    ${vertexShaderHeader}

    void main() {
        vec4 v = aVertexPosition;

        ${vertexShaderBody}

        gl_Position = v;
    }
`;

const fragmentShaderColor = {
    header : `
        varying vec4 vColor;
    `,
    body : `
        v = vColor;
    `
};

const fragmentShaderCircle = {
    header : `
        varying float vSize;
    `,
    body : `
        float distance = length(2.0 * gl_PointCoord - 1.0) * vSize;
        if (distance > vSize) {
            discard;
            return;
        }
    `
};

const fragmentShaderHeader = `
    ${fragmentShaderColor.header}
    ${fragmentShaderCircle.header}
    `;

const fragmentShaderBody = `
    ${fragmentShaderColor.body}
    ${fragmentShaderCircle.body}
    `;

export const fragmentShader = `
    precision mediump float;

    ${fragmentShaderHeader}

    void main() {
        vec4 v = vec4(0.0, 0.0, 0.0, 1.0);

        ${fragmentShaderBody}

        gl_FragColor = v;
    }
`;