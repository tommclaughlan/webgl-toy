
/**
 * @param gl {WebGLRenderingContext}
 */
export default(gl) => {
    const buf = gl.createBuffer();

    const data = (data) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        return buf;
    }

    /**
     * @param offset {number}
     * @param data {Float32Array}
     */
    data.updateData = (offset, data) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * Float32Array.BYTES_PER_ELEMENT, data);
        return buf;
    }

    data.loc = () => buf;
    return data;
}