
/**
 * @param gl {WebGLRenderingContext}
 */
export default(gl, program) => {
    const buf = gl.createBuffer();


    const data = (data, name, components=3) => {
        const location = gl.getAttribLocation(program, name);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);

        gl.vertexAttribPointer(
            location,
            components,
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(location);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        return buf;
    }

    data.loc = () => buf;
    return data;
}