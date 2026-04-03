/*
Name: Alice Xiao-Li
Email: axiaoli@ucsc.edu
Note: Used LLM as a coding assistant

Awesome features: symmetry, rainbow, and disappearing mode
*/

// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        //gl_PointSize = 10.0;
        gl_PointSize = u_Size;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let symmetryActive = false;
let symmetryLines = 2;
let rainbowMode = false;
let rainbowColors = [
    [1.0, 0.0, 0.0, 1.0],       // red
    [1.0, 0.5, 0.0, 1.0],       // orange
    [1.0, 1.0, 0.0, 1.0],       // yellow
    [0.0, 1.0, 0.0, 1.0],       // green
    [0.0, 0.0, 1.0, 1.0],       // blue
    [0.56, 0.0, 1.0, 1.0]       // violet
];
let rainbowIndex = 0;
let disappearingMode = false;
const disappearDuration = 2000;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

    // Button Events
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; rainbowMode = false; };
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; rainbowMode = false; };
    document.getElementById('blue').onclick = function() { g_selectedColor = [0.0, 0.0, 1.0, 1.0]; rainbowMode = false; };
    document.getElementById('clearButton').onclick = function() { g_shapesList = []; gl.clearColor(0.0, 0.0, 0.0, 1.0); renderAllShapes(); };
    document.getElementById('rainbowButton').onclick = function() { rainbowMode = true; };

    document.getElementById('pointButton').onclick = function() { g_selectedType=POINT; };
    document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE; };
    document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE; };

    // Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; rainbowMode = false; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; rainbowMode = false; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; rainbowMode = false; });

    // Size Slider Events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

    // Circle Segment Slider Events
    document.getElementById('segmentsSlide').addEventListener('input', function() { g_selectedSegments = parseInt(this.value); });

    // Picture Events
    document.getElementById('picButton').onclick = function() { drawPicture(); };

    // Symmetry Mode Events
    document.getElementById('symmetryButton').onclick = function() { symmetryActive = !symmetryActive; this.textContent = symmetryActive ? "Symmetry Mode ON" : "Symmetry Mode OFF"; };
    document.getElementById('symmetrySlider').addEventListener('input', function() { symmetryLines = parseInt(this.value); document.getElementById('symmetryValue').textContent = symmetryLines; });

    // Disappearing Mode Events
    document.getElementById('disappearButton').onclick = function() { disappearingMode = !disappearingMode; this.textContent = disappearingMode ? "Disappear Mode ON" : "Disappear Mode OFF"; };
}

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev); } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    function animate() {
        renderAllShapes();                  // redraw everything 
        requestAnimationFrame(animate);     // schedule the next frame
    }

    // start animation loop
    animate();
}

var g_shapesList = []; // The array for the shapes that are drawn

function click(ev) {
    
    // Extract the event click and return it in WebGL coordinates
    let [x,y] = convertCoordinatesEventToWebGL(ev);

    // Create and store the new point
    let point;
    if (g_selectedType==POINT) {
        point = new Point();
    } else if (g_selectedType==TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSegments;
    }
    let pointsToDraw = [{x, y}];

    if (symmetryActive) {
        pointsToDraw = [];
        const angleStep = (2 * Math.PI) / symmetryLines;
        for (let i = 0; i < symmetryLines; i++) {
            const angle = i * angleStep;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            let xRot = x * cosA - y * sinA;
            let yRot = x * sinA + y * cosA;
            pointsToDraw.push({x: xRot, y: yRot});
        }
    }

    for (let pt of pointsToDraw) {
        let point;
        if (g_selectedType==POINT) {
            point = new Point();
        } else if (g_selectedType==TRIANGLE) {
            point = new Triangle();
        } else {
            point = new Circle();
            point.segments = g_selectedSegments;
        }
        point.position=[pt.x, pt.y];
        if (rainbowMode) {
            point.color = rainbowColors[rainbowIndex % rainbowColors.length];
        } else {
            point.color = g_selectedColor.slice();
        }
        point.size=g_selectedSize;
        point.createdAt = performance.now();
        point.lifetime = disappearingMode ? disappearDuration : Infinity;
        g_shapesList.push(point);
    }
    if (rainbowMode) rainbowIndex++;

    // Draw every shape that is supposed to be in the canvas
    //renderAllShapes();

}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToWebGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}


// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    const now = performance.now();

    // Keep shapes that haven't expired
    g_shapesList = g_shapesList.filter(shape => {
        return now - shape.createdAt < shape.lifetime;
    });

    for (let shape of g_shapesList) {
        shape.render();
    }
    
}

function drawPicture() {
    g_shapesList = [];
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // helper
    function makeTri(v, color) {
        let t = new Triangle();
        t.color = color;
        t.render = function() {
            gl.uniform4f(u_FragColor, ...this.color);
            drawTriangle(v);
        };
        g_shapesList.push(t);
    }

    // =========================
    // My Melody Face
    // =========================
    // HEAD
    let headColor = [1.0, 0.75, 0.85, 1.0];     // pink
    // base
    makeTri([-0.1333, -0.4, 0.1333, -0.4, -0.0667, -0.1333], headColor);
    makeTri([-0.0667, -0.1333, 0.0667, -0.1333, 0.1333, -0.4], headColor);
    makeTri([0.0667, -0.1333, 0.1333, -0.4, 0.3333, -0.2667], headColor);
    makeTri([-0.0667, -0.1333, -0.1333, -0.4, -0.3333, -0.2667], headColor);
    makeTri([-0.4667, -0.4, -0.1333, -0.4, -0.3333, -0.2667], headColor);
    makeTri([0.4667, -0.4, 0.1333, -0.4, 0.3333, -0.2667], headColor);
    makeTri([0.4667, -0.4, 0.1333, -0.4, 0.4667, -0.6667], headColor);
    makeTri([-0.4667, -0.4, -0.1333, -0.4, -0.4667, -0.6667], headColor);
    // bottom
    let headColor2 = [1.0, 0.65, 0.8, 1.0];     // darker pink
    makeTri([-0.4, -0.6, -0.3333, -0.7333, -0.4667, -0.6667], headColor2)
    makeTri([+0.4, -0.6, +0.3333, -0.7333, +0.4667, -0.6667], headColor2)
    makeTri([+0.3333, -0.8, +0.3333, -0.7333, +0.4667, -0.6667], headColor2)
    makeTri([-0.3333, -0.8, -0.3333, -0.7333, -0.4667, -0.6667], headColor2)
    makeTri([-0.3333, -0.8, -0.3333, -0.7333, +0.3333, -0.8], headColor2)
    makeTri([+0.3333, -0.7333, -0.3333, -0.7333, +0.3333, -0.8], headColor2)
    // left ear
    makeTri([-0.4, +0.3333, -0.2, +0.2, -0.4667, +0.2], headColor);
    makeTri([-0.2, -0.2, -0.2, +0.2, -0.4667, +0.2], headColor);
    makeTri([-0.2, -0.2, -0.4667, -0.1333, -0.4667, +0.2], headColor);
    makeTri([-0.2, -0.2, -0.4667, -0.1333, -0.3333, -0.2667], headColor);
    // right ear
    makeTri([+0.4, +0.3333, 0.2, 0.2, 0.4667, 0.2], headColor);
    makeTri([0.2, -0.2, 0.2, 0.2, 0.4667, 0.2], headColor);
    makeTri([0.2, -0.2, 0.4667, -0.1333, 0.4667, 0.2], headColor);
    makeTri([0.2, -0.2, 0.4667, -0.1333, 0.3333, -0.2667], headColor);

    // FACE
    let faceColor = [1.0, 1.0, 1.0, 1.0];       // white
    makeTri([-0.1333, -0.4, 0, -0.7333, -0.3333, -0.7333], faceColor);
    makeTri([0.1333, -0.4, 0, -0.7333, 0.3333, -0.7333], faceColor);
    makeTri([-0.1333, -0.4, 0.1333, -0.4, 0, -0.7333], faceColor);
    makeTri([-0.1333, -0.4, -0.3333, -0.7333, -0.4, -0.6], faceColor);
    makeTri([0.1333, -0.4, 0.3333, -0.7333, 0.4, -0.6], faceColor);

    // EYES
    let eyeColor = [0.4, 0.8, 1.0, 1.0];        // light blue
    // left eye
    makeTri([-0.2333, -0.5333, -0.2666, -0.6, -0.2, -0.6], eyeColor);
    makeTri([-0.2666, -0.6, -0.2, -0.6, -0.2333, -0.6667], eyeColor);
    // right eye
    makeTri([0.2333, -0.5333, 0.2666, -0.6, 0.2, -0.6], eyeColor);
    makeTri([0.2666, -0.6, 0.2, -0.6, 0.2333, -0.6667], eyeColor);

    // NOSE
    let noseColor = [1.0, 1.0, 0.6, 1.0];       // light yellow
    makeTri([-0.0333, -0.6, -0.0333, -0.6667, 0.0333, -0.6667], noseColor);
    makeTri([-0.0333, -0.6, 0.0333, -0.6, 0.0333, -0.6667], noseColor);

    // =========================
    // Star
    // =========================
    let starColor1 = [1.0, 1.0, 0.6, 1.0];       // light yellow
    let starColor2 = [1.0, 0.8, 0.6, 1.0];       // light orange
    let starColor3 = [1.0, 1.0, 1.0, 1.0];       // white
    makeTri([0, +0.5111, +0.3333, +0.7333, -0.3333, +0.7333], starColor1);
    makeTri([0, +0.5111, 0, +0.9333, +0.2667, +0.3333], starColor2);
    makeTri([0, +0.6, 0, +0.7, +0.0667, +0.5667], starColor3);
    makeTri([0, +0.5111, 0, +0.9333, -0.2667, +0.3333], starColor2);
    makeTri([0, +0.6, 0, +0.7, -0.0667, +0.5667], starColor3);

    renderAllShapes();
}