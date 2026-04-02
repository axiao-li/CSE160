/*
Name: Alice Xiao-Li
Email: axiaoli@ucsc.edu
*/

function main() {
    // 1
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 255, 1.0)';     // Set a blue color
    ctx.fillRect(120, 10, 150, 150);            // Fill a rectangle with the color

    // 2
    // Vector v1
    var v1 = new Vector3([2.25, 2.25, 0]);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawVector(v1, "red");

    // 3
    document.getElementById("drawButton").addEventListener("click", handleDrawEvent);
    // 4
    document.getElementById("drawOperationButton").addEventListener("click", handleDrawOperationEvent);
}

// 2
function drawVector(v, color) {
    const canvas = document.getElementById('example');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 20;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + v.elements[0] * scale, cy - v.elements[1] * scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 3
function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    // clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw v1
    var x1 = parseFloat(document.getElementById('x1').value) || 0;
    var y1 = parseFloat(document.getElementById('y1').value) || 0;
    var v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");

    // 4
    // draw v2
    var x2 = parseFloat(document.getElementById('x2').value) || 0;
    var y2 = parseFloat(document.getElementById('y2').value) || 0;
    var v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");
}

// 5
function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    // clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw v1
    var x1 = parseFloat(document.getElementById('x1').value) || 0;
    var y1 = parseFloat(document.getElementById('y1').value) || 0;
    var v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");

    // draw v2
    var x2 = parseFloat(document.getElementById('x2').value) || 0;
    var y2 = parseFloat(document.getElementById('y2').value) || 0;
    var v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");

    // perform operation
    var op = document.getElementById('operation').value;
    var s = parseFloat(document.getElementById('scalarInput').value) || 1;

    if (op === "add") {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        v3.add(v2);
        drawVector(v3, "green");
    } else if (op === "sub") {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        v3.sub(v2);
        drawVector(v3, "green");
    } else if (op === "mul") {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
        v3.mul(s);
        v4.mul(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (op === "div") {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
        v3.div(s);
        v4.div(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    // 6
    } else if (op === "mag") {
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
    } else if (op === "norm") {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
        v3.normalize();
        v4.normalize();
        drawVector(v3, "green");
        drawVector(v4, "green");
    // 7
    } else if (op === "angle") {
        var alpha = angleBetween(v1, v2);
        console.log("Angle: " + Math.round(alpha));
    // 8
    } else if (op === "area") {
        var area = areaTriangle(v1, v2);
        console.log("Area of the triangle: " + area);
    }
}

// 7
function angleBetween(v1, v2) {
    var dotProduct = Vector3.dot(v1, v2);
    var magV1 = v1.magnitude();
    var magV2 = v2.magnitude();

    var cosAlpha = dotProduct / (magV1 * magV2);
    var alphaRad = Math.acos(Math.min(Math.max(cosAlpha, -1), cosAlpha)); // clamp to avoid NaN
    var alphaDeg = alphaRad * (180 / Math.PI);

    return alphaDeg;
}

// 8
function areaTriangle(v1, v2) {
    var crossProduct = Vector3.cross(v1, v2);
    var areaParallelogram = crossProduct.magnitude();
    var areaTriangle = areaParallelogram / 2;
    return areaTriangle;
}