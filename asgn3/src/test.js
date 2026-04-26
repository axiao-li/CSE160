// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }`


// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;

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

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }


    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Set an initial value for this model matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals related UI elements
let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_globalZAngle = 0;
let g_headAngle = 0;
let g_neckAngle = 0;
let g_tail1Angle = 0;
let g_tail2Angle = 0;
let g_leg1Angle = 0;
let g_leg2Angle = 0;
let g_leg3Angle = 0;
let g_leg4Angle = 0;
let g_leg5Angle = 0;
let g_leg6Angle = 0;
let g_leg7Angle = 0;
let g_leg8Angle = 0;
let g_leg9Angle = 0;
let g_leg10Angle = 0;
let g_leg11Angle = 0;
let g_leg12Angle = 0;
let g_isAnimating = false;
let g_poke = false;
let g_flipStart = 0;
let g_mouseDown = false;
let g_lastX = 0;
let g_lastY = 0;
let g_yaw = 0;      // left and right
let g_pitch = 0;    // up and down

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
    // Slider Events
    document.getElementById('angleXSlide').addEventListener('mousemove', function() { g_globalXAngle = this.value; renderAllShapes(); });
    document.getElementById('angleYSlide').addEventListener('mousemove', function() { g_globalYAngle = this.value; renderAllShapes(); });
    document.getElementById('angleZSlide').addEventListener('mousemove', function() { g_globalZAngle = this.value; renderAllShapes(); });
    document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });
    document.getElementById('neckSlide').addEventListener('mousemove', function() { g_neckAngle = this.value; renderAllShapes(); });
    document.getElementById('tail1Slide').addEventListener('mousemove', function() { g_tail1Angle = this.value; renderAllShapes(); });
    document.getElementById('tail2Slide').addEventListener('mousemove', function() { g_tail2Angle = this.value; renderAllShapes(); });
    document.getElementById('leg1Slide').addEventListener('mousemove', function() { g_leg1Angle = this.value; renderAllShapes(); });
    document.getElementById('leg2Slide').addEventListener('mousemove', function() { g_leg2Angle = this.value; renderAllShapes(); });
    document.getElementById('leg3Slide').addEventListener('mousemove', function() { g_leg3Angle = this.value; renderAllShapes(); });
    document.getElementById('leg4Slide').addEventListener('mousemove', function() { g_leg4Angle = this.value; renderAllShapes(); });
    document.getElementById('leg5Slide').addEventListener('mousemove', function() { g_leg5Angle = this.value; renderAllShapes(); });
    document.getElementById('leg6Slide').addEventListener('mousemove', function() { g_leg6Angle = this.value; renderAllShapes(); });
    document.getElementById('leg7Slide').addEventListener('mousemove', function() { g_leg7Angle = this.value; renderAllShapes(); });
    document.getElementById('leg8Slide').addEventListener('mousemove', function() { g_leg8Angle = this.value; renderAllShapes(); });
    document.getElementById('leg9Slide').addEventListener('mousemove', function() { g_leg9Angle = this.value; renderAllShapes(); });
    document.getElementById('leg10Slide').addEventListener('mousemove', function() { g_leg10Angle = this.value; renderAllShapes(); });
    document.getElementById('leg11Slide').addEventListener('mousemove', function() { g_leg11Angle = this.value; renderAllShapes(); });
    document.getElementById('leg12Slide').addEventListener('mousemove', function() { g_leg12Angle = this.value; renderAllShapes(); });

    // Button Events
    document.getElementById('onButton').addEventListener('click', function() { g_isAnimating = true; g_poke = false; });
    document.getElementById('offButton').addEventListener('click', function() { g_isAnimating = false; resetManualControls(); });

    // Poke Events
    canvas.onmousedown = function(ev) {if (ev.shiftKey && ev.button === 0) { g_poke = !g_poke; if (g_poke) g_isAnimating = false;
        g_flipStart = performance.now(); if (!g_poke) { resetManualControls(); }} g_mouseDown = true; g_lastX = ev.clientX; g_lastY = ev.clientY; };

    // Camera Events
    // canvas.onmousedown = function(ev) { g_mouseDown = true; g_lastX = ev.clientX; g_lastY = ev.clientY; };
    canvas.onmouseup = function() { g_mouseDown = false; };
    canvas.onmouseleave = function() { g_mouseDown = false; };
    canvas.onmousemove = function(ev) { if (!g_mouseDown) return; let deltaX = ev.clientX - g_lastX; let deltaY = ev.clientY - g_lastY; g_lastX = ev.clientX;
        g_lastY = ev.clientY; let sensitivity = 0.5; g_yaw -= deltaX * sensitivity; g_pitch -= deltaY * sensitivity; /*g_pitch = Math.max(-89, Math.min(89, g_pitch));*/ };
}

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.6, 0.6, 0.8, 1.0);

    // Render
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
    // Print some debug information so we know we are running
    g_seconds = performance.now() / 1000.0-g_startTime;
    //console.log(g_seconds);

    // Draw everything
    renderAllShapes();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

function resetManualControls() {
    g_headAngle = 0;
    g_neckAngle = 0;
    g_tail1Angle = 0;
    g_tail2Angle = 0;
    g_leg1Angle = 0;
    g_leg2Angle = 0;
    g_leg3Angle = 0;
    g_leg4Angle = 0;
    g_leg5Angle = 0;
    g_leg6Angle = 0;
    g_leg7Angle = 0;
    g_leg8Angle = 0;
    g_leg9Angle = 0;
    g_leg10Angle = 0;
    g_leg11Angle = 0;
    g_leg12Angle = 0;

    document.getElementById('tail1Slide').value = 0;
    document.getElementById('tail2Slide').value = 0;
    document.getElementById('leg1Slide').value = 0;
    document.getElementById('leg2Slide').value = 0;
    document.getElementById('leg3Slide').value = 0;
    document.getElementById('leg4Slide').value = 0;
    document.getElementById('leg5Slide').value = 0;
    document.getElementById('leg6Slide').value = 0;
    document.getElementById('leg7Slide').value = 0;
    document.getElementById('leg8Slide').value = 0;
    document.getElementById('leg9Slide').value = 0;
    document.getElementById('leg10Slide').value = 0;
    document.getElementById('leg11Slide').value = 0;
    document.getElementById('leg12Slide').value = 0;
    document.getElementById('headSlide').value = 0;
    document.getElementById('neckSlide').value = 0;
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Check the time at the start of the function
    var startTime = performance.now();

    // Pass the matrix to u_ModelMatrix attribute variable
    var globalRotMat = new Matrix4().rotate(g_globalXAngle, 1, 0, 0).rotate(g_globalYAngle, 0, 1, 0).rotate(g_globalZAngle, 0, 0, 1).rotate(g_yaw, 0, 1, 0).rotate(g_pitch, 1, 0, 0); 
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Otter stuff
    var otter = new Otter();
    otter.matrix.translate(-0.15, -0.15, -0.25);
    otter.matrix.scale(0.45, 0.45, 0.45);

    otter.isAnimating = g_isAnimating;
    otter.poke = g_poke;
    otter.animate(g_seconds);
    otter.flipStart = g_flipStart;

    otter.render();

    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
    
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get" + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}