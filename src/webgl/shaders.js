export const translateFunction = `
    uniform vec2 uTranslate;

    vec2 translateVertex(vec2 vertex) {
        return vertex + uTranslate;
    }
    #define TRANSLATE_VERTEX;
`;

export const scaleFunction = `
    uniform vec2 uScale;

    vec2 scaleVertex(vec2 vertex) {
        return vertex * uScale;
    }
    #define SCALE_VERTEX;
`;

export const clipSpaceFunction = `
    #ifndef SCALE_VERTEX
        vec2 scaleVertex(vec2 vertex) {
            return vertex;
        }
    #endif

    #ifndef TRANSLATE_VERTEX
        vec2 translateVertex(vec2 vertex) {
            return vertex;
        }
    #endif

    uniform vec2 uResolution;

    vec2 toClipSpace(vec2 vertex) {
        return scaleVertex((2.0 * (translateVertex(vertex) / uResolution)) - 1.0);
    }
    #define TO_CLIP_SPACE;
`

export const vertexShader = `
    precision mediump float;
    attribute vec4 aVertexPosition;
    attribute vec4 aColor;

    varying float vSize;
    varying vec4 vColor;

    #ifndef TO_CLIP_SPACE
        vec2 toClipSpace(vec2 vertex) {
            return vertex;
        }
    #endif

    void main() {
        vec2 vertex = toClipSpace(vec2(aVertexPosition[0], aVertexPosition[1]));
        vSize = aVertexPosition[2];
        gl_Position = vec4(vertex, 0.0, 1.0);
        gl_PointSize = vSize;
        vColor = aColor;
    }
`;

export const fragmentShader = `
    precision mediump float;

    uniform vec4 uColor;

    varying float vSize;
    varying vec4 vColor;

    void main() {
        float distance = length(2.0 * gl_PointCoord - 1.0) * vSize;
        if (distance > vSize) {
            discard;
        } else {
            gl_FragColor = vColor;
        }
    }
`;