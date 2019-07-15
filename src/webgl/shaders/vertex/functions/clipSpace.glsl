uniform vec2 uResolution;

vec2 clipSpace(vec2 vertex) {
    return (2.0 * (vertex / uResolution)) - 1.0;
}