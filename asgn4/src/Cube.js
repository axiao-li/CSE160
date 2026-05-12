class Cube {
    constructor() {
        this.type = 'cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Pass the texture number to u_whichTexture uniform variable
        let texMode = this.textureNum;
        if (typeof g_normalOn !== 'undefined' && g_normalOn && texMode === -2) {
            texMode = -3;
        }
        gl.uniform1i(u_whichTexture, texMode);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0],
            [0.0, 0.0,        1.0, 1.0,        1.0, 0.0],
            [0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0]
        );
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0],
            [0.0, 0.0,        0.0, 1.0,        1.0, 1.0],
            [0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0]
        );

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);

        // Top of cube
        drawTriangle3DUVNormal(
            [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0],
            [0.0, 0.0,        0.0, 1.0,        1.0, 1.0],
            [0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0]
        );
        drawTriangle3DUVNormal(
            [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0],
            [0.0, 0.0,        1.0, 1.0,        1.0, 0.0],
            [0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0]
        );

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);

        // Bottom of cube
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0 ],
            [0.0, 0.0,        0.0, 1.0,        1.0, 0.0],
            [0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0]
        );
        drawTriangle3DUVNormal(
            [1.0, 0.0, 1.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0 ],
            [1.0, 1.0,        0.0, 1.0,        1.0, 0.0],
            [0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0]
        );

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);

        // Left of cube
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0 ],
            [0.0, 0.0,        1.0, 0.0,        0.0, 1.0],
            [-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0]
        );
        drawTriangle3DUVNormal(
            [0.0, 1.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0 ],
            [1.0, 1.0,        1.0, 0.0,        0.0, 1.0],
            [-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0]
        );

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*0.65, rgba[1]*0.65, rgba[2]*0.65, rgba[3]);

        // Right of cube
        drawTriangle3DUVNormal(
            [1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0 ],
            [0.0, 0.0,        0.0, 1.0,        1.0, 0.0],
            [1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0]
        );
        drawTriangle3DUVNormal(
            [1.0, 1.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0 ],
            [1.0, 1.0,        0.0, 1.0,        1.0, 0.0],
            [1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0]
        );

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*0.55, rgba[1]*0.55, rgba[2]*0.55, rgba[3]);

        // Back of cube
        drawTriangle3DUVNormal(
            [0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0 ],
            [0.0, 0.0,        1.0, 1.0,        1.0, 0.0],
            [0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0]
        );
        drawTriangle3DUVNormal(
            [0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0 ],
            [0.0, 0.0,        0.0, 1.0,        1.0, 1.0],
            [0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0]
        );

        // // Back of cube
        // drawTriangle3D( [0.0, 0.0, -1.0,   1.0, 1.0, -1.0,   1.0, 0.0, -1.0] );
        // drawTriangle3D( [0.0, 0.0, -1.0,   0.0, 1.0, -1.0,   1.0, 1.0, -1.0] );

        // // Left of cube
        // drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 1.0, -1.0,   0.0, 1.0, 0.0] );
        // drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 1.0, -1.0,   0.0, 0.0, -1.0] );

        // // Right of cube
        // drawTriangle3D( [1.0, 0.0, 0.0,   1.0, 1.0, -1.0,   1.0, 1.0, 0.0] );
        // drawTriangle3D( [1.0, 0.0, 0.0,   1.0, 1.0, -1.0,   1.0, 0.0, -1.0] );

        // // Top of cube
        // drawTriangle3D( [0.0, 1.0, 0.0,   1.0, 1.0, -1.0,   1.0, 1.0, 0.0] );
        // drawTriangle3D( [0.0, 1.0, 0.0,   0.0, 1.0, -1.0,   1.0, 1.0, -1.0] );

        // // Bottom of cube
        // drawTriangle3D( [0.0, 0.0, 0.0,   1.0, 0.0, -1.0,   1.0, 0.0, 0.0] );
        // drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 0.0, -1.0,   1.0, 0.0, -1.0] );
    }
}
