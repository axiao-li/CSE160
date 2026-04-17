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

        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass color
        var x = 1.0
        gl.uniform4f(u_FragColor, rgba[0]*x, rgba[1]*x, rgba[2]*x, rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let angleStep = 360 / this.segments;
        let tip = [0, 0.5, 0];
        let center = [0, -0.5, 0];
        x =- 0.05;

        for (var angle = 0; angle < 360; angle += angleStep) {
            let rad1 = angle * Math.PI / 180;
            let rad2 = (angle + angleStep) * Math.PI / 180;

            let x1 = Math.cos(rad1) * 0.5;
            let z1 = Math.sin(rad1) * 0.5;

            let x2 = Math.cos(rad2) * 0.5;
            let z2 = Math.sin(rad2) * 0.5;

            // Side triangle
            drawTriangle3D([
                tip[0], tip[1], tip[2],
                x1, -0.5, z1,
                x2, -0.5, z2
            ]);
            // gl.uniform4f(u_FragColor, rgba[0]*x, rgba[1]*x, rgba[2]*x, rgba[3]);
            gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);

            // Base triangle
            drawTriangle3D([
                center[0], center[1], center[2],
                x2, -0.5, z2,
                x1, -0.5, z1
            ]);
        }
    }
}