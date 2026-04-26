/*
Name: Alice Xiao-Li
Email: axiaoli@ucsc.edu
*/

class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size);

        // Draw
        var d = this.size / 200; // delta
        drawTriangle([xy[0], xy[1],   xy[0]+d, xy[1],   xy[0], xy[1]+d]);

    }

}

function drawTriangle(vertices) {
    var n = 3; // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3D(vertices) {
    var n = 3; // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3DUV(vertices, uv) {
    var n = vertices.length / 3; // The number of vertices

    // Reuse shared buffers to avoid per-draw allocation overhead.
    if (!drawTriangle3DUV.vertexBuffer) {
        drawTriangle3DUV.vertexBuffer = gl.createBuffer();
    }
    if (!drawTriangle3DUV.vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, drawTriangle3DUV.vertexBuffer);

    // Write date into the buffer object
    let vertexData = (vertices instanceof Float32Array) ? vertices : new Float32Array(vertices);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STREAM_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    if (!drawTriangle3DUV.uvBuffer) {
        drawTriangle3DUV.uvBuffer = gl.createBuffer();
    }
    if (!drawTriangle3DUV.uvBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the UV buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, drawTriangle3DUV.uvBuffer);

    // Write UV data into the buffer object
    let uvData = (uv instanceof Float32Array) ? uv : new Float32Array(uv);
    gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STREAM_DRAW);

    // Assign the buffer object to a_UV variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_UV variable
    gl.enableVertexAttribArray(a_UV);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, n);

}
