uniform vec2 uScale;

vec2 scale(vec2 vertex) {
    return vertex * uScale;
}