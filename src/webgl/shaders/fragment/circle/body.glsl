float distance = length(2.0 * gl_PointCoord - 1.0) * vSize;
if (distance > vSize) {
    discard;
    return;
}