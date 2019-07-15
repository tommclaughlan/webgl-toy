uniform vec2 uTranslate;

vec2 translate(vec2 vertex) {
    return vertex + uTranslate;
}