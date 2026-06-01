class Cube {
    constructor() {
        this.type = 'cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -1;
        this.uvScale = 1.0;
        this.uvRotate90 = false;
    }

    transformUVs(uvs) {
        if (this.uvScale === 1.0 && !this.uvRotate90) {
            return uvs;
        }

        let transformed = [];
        for (let i = 0; i < uvs.length; i += 2) {
            let u = uvs[i] * this.uvScale;
            let v = uvs[i + 1] * this.uvScale;

            if (this.uvRotate90) {
                let rotatedU = v;
                let rotatedV = 1.0 - u;
                u = rotatedU;
                v = rotatedV;
            }

            transformed.push(u, v);
        }

        return transformed;
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Pass the texture number to u_whichTexture uniform variable
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0],
            this.transformUVs([0.0, 0.0,        1.0, 1.0,        1.0, 0.0])
        );
        
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0],
            this.transformUVs([0.0, 0.0,        0.0, 1.0,        1.0, 1.0])
        );

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);

        // Top of cube
        drawTriangle3DUV(
            [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0],
            this.transformUVs([0.0, 0.0,        0.0, 1.0,         1.0, 1.0])
        );

        drawTriangle3DUV(
            [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0],
            this.transformUVs([0.0, 0.0,        1.0, 1.0,        1.0, 0.0])
        );
        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);

        // Bottom of cube
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0],
            this.transformUVs([0.0, 0.0,        0.0, 1.0,        1.0, 0.0])
        );

        drawTriangle3DUV(
            [1.0, 0.0, 1.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0],
            this.transformUVs([1.0, 1.0,        0.0, 1.0,        1.0, 0.0])
        );

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);

        // Left of cube
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0],
            this.transformUVs([0.0, 0.0,        1.0, 0.0,        0.0, 1.0])
        );

        drawTriangle3DUV(
            [0.0, 1.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0],
            this.transformUVs([1.0, 1.0,        1.0, 0.0,        0.0, 1.0])
        );

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.65, rgba[1]*0.65, rgba[2]*0.65, rgba[3]);

        // Right of cube
        drawTriangle3DUV(
            [1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0],
            this.transformUVs([0.0, 0.0,        0.0, 1.0,        1.0, 0.0])
        );

        drawTriangle3DUV(
            [1.0, 1.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0],
            this.transformUVs([1.0, 1.0,        0.0, 1.0,        1.0, 0.0])
        );

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.55, rgba[1]*0.55, rgba[2]*0.55, rgba[3]);

        // Back of cube
        drawTriangle3DUV(
            [0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0],
            this.transformUVs([0.0, 0.0,         1.0, 1.0,       1.0, 0.0])
        );

        drawTriangle3DUV(
            [0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0],
            this.transformUVs([0.0, 0.0,         0.0, 1.0,       1.0, 1.0])
        );
    }

    renderFast() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Pass the texture number to u_whichTexture uniform variable
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allVertices = [];
        var allUVs = [];

        // Front of cube
        allVertices = allVertices.concat([0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0]);
        allVertices = allVertices.concat([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0]);
        allUVs = allUVs.concat([0.0, 0.0,        1.0, 1.0,        1.0, 0.0]);
        allUVs = allUVs.concat([0.0, 0.0,        0.0, 1.0,        1.0, 1.0]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);

        // Top of cube
        allVertices = allVertices.concat([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0]);
        allVertices = allVertices.concat([0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0]);
        allUVs = allUVs.concat([0.0, 0.0,        0.0, 1.0,        1.0, 1.0]);
        allUVs = allUVs.concat([0.0, 0.0,        1.0, 1.0,        1.0, 0.0]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);

        // Bottom of cube
        allVertices = allVertices.concat([0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0]);
        allVertices = allVertices.concat([1.0, 0.0, 1.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0]);
        allUVs = allUVs.concat([0.0, 0.0,        0.0, 1.0,        1.0, 0.0]);
        allUVs = allUVs.concat([1.0, 1.0,        0.0, 1.0,        1.0, 0.0]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);

        // Left of cube
        allVertices = allVertices.concat([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0]);
        allVertices = allVertices.concat([0.0, 1.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0]);
        allUVs = allUVs.concat([0.0, 0.0,        1.0, 0.0,        0.0, 1.0]);
        allUVs = allUVs.concat([1.0, 1.0,        1.0, 0.0,        0.0, 1.0]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.65, rgba[1]*0.65, rgba[2]*0.65, rgba[3]);

        // Right of cube
        allVertices = allVertices.concat([1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0]);
        allVertices = allVertices.concat([1.0, 1.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0]);
        allUVs = allUVs.concat([0.0, 0.0,        0.0, 1.0,        1.0, 0.0]);
        allUVs = allUVs.concat([1.0, 1.0,        0.0, 1.0,        1.0, 0.0]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.55, rgba[1]*0.55, rgba[2]*0.55, rgba[3]);

        // Back of cube
        allVertices = allVertices.concat([0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0]);
        allVertices = allVertices.concat([0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0]);
        allUVs = allUVs.concat([0.0, 0.0,        1.0, 1.0,        1.0, 0.0]);
        allUVs = allUVs.concat([0.0, 0.0,        0.0, 1.0,        1.0, 1.0]);

        allUVs = this.transformUVs(allUVs);
        drawTriangle3DUV(allVertices, allUVs);
    }
}
