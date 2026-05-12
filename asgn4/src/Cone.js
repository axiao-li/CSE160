/*
Name: Alice Xiao-Li
Email: axiaoli@ucsc.edu
Note: Used LLM as a coding assistant
*/

class Cone {
    constructor() {
        this.type = 'cone';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 4;
        this.textureNum = -2;

        this.matrix = new Matrix4();
    }

    computeFaceNormal(a, b, c) {
        let ux = b[0] - a[0];
        let uy = b[1] - a[1];
        let uz = b[2] - a[2];
        let vx = c[0] - a[0];
        let vy = c[1] - a[1];
        let vz = c[2] - a[2];

        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;
        let len = Math.hypot(nx, ny, nz);
        if (len < 1e-8) return [0.0, 1.0, 0.0];
        return [nx / len, ny / len, nz / len];
    }

    render() {
        var rgba = this.color;

        let texMode = this.textureNum;
        if (typeof g_normalOn !== 'undefined' && g_normalOn && texMode === -2) {
            texMode = -3;
        }
        gl.uniform1i(u_whichTexture, texMode);

        // Pass color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let angleStep = 360 / this.segments;
        let tip = [0, 0.5, 0];
        let center = [0, -0.5, 0];
        for (var angle = 0; angle < 360; angle += angleStep) {
            let rad1 = angle * Math.PI / 180;
            let rad2 = (angle + angleStep) * Math.PI / 180;

            let x1 = Math.cos(rad1) * 0.5;
            let z1 = Math.sin(rad1) * 0.5;

            let x2 = Math.cos(rad2) * 0.5;
            let z2 = Math.sin(rad2) * 0.5;

            // Side triangle
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            let sideA = [tip[0], tip[1], tip[2]];
            let sideB = [x1, -0.5, z1];
            let sideC = [x2, -0.5, z2];
            let sideNormal = this.computeFaceNormal(sideA, sideB, sideC);
            let radialX = (x1 + x2) * 0.5;
            let radialZ = (z1 + z2) * 0.5;
            if (sideNormal[0] * radialX + sideNormal[2] * radialZ < 0) {
                sideNormal = [-sideNormal[0], -sideNormal[1], -sideNormal[2]];
            }
            drawTriangle3DUVNormal(
                [
                    sideA[0], sideA[1], sideA[2],
                    sideB[0], sideB[1], sideB[2],
                    sideC[0], sideC[1], sideC[2]
                ],
                [
                    0.5, 1.0,
                    0.0, 0.0,
                    1.0, 0.0
                ],
                [
                    sideNormal[0], sideNormal[1], sideNormal[2],
                    sideNormal[0], sideNormal[1], sideNormal[2],
                    sideNormal[0], sideNormal[1], sideNormal[2]
                ]
            );
            // gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);

            // Base triangle
            let baseA = [center[0], center[1], center[2]];
            let baseB = [x2, -0.5, z2];
            let baseC = [x1, -0.5, z1];
            let baseNormal = this.computeFaceNormal(baseA, baseB, baseC);
            if (baseNormal[1] > 0) {
                baseNormal = [-baseNormal[0], -baseNormal[1], -baseNormal[2]];
            }
            drawTriangle3DUVNormal(
                [
                    baseA[0], baseA[1], baseA[2],
                    baseB[0], baseB[1], baseB[2],
                    baseC[0], baseC[1], baseC[2]
                ],
                [
                    0.5, 0.5,
                    1.0, 1.0,
                    0.0, 1.0
                ],
                [
                    baseNormal[0], baseNormal[1], baseNormal[2],
                    baseNormal[0], baseNormal[1], baseNormal[2],
                    baseNormal[0], baseNormal[1], baseNormal[2]
                ]
            );
        }
    }
}
