
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
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;                         // Use color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);                // Use UV
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);         // Use texture0
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);         // Use texture1
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);         // Use texture2
        } else {
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);            // Error
        }
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

    // Get the storage location of u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
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
let g_camera;

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
        g_lastY = ev.clientY; let sensitivity = 0.5; g_yaw += deltaX * sensitivity; g_pitch += deltaY * sensitivity; /*g_pitch = Math.max(-89, Math.min(89, g_pitch));*/ };

    // canvas.onmousedown = function(ev) {
    //     g_mouseDown = true;
    //     g_lastX = ev.clientX;
    //     g_lastY = ev.clientY;
    // };

    // canvas.onmouseup = function() {
    //     g_mouseDown = false;
    // };

    // canvas.onmouseleave = function() {
    //     g_mouseDown = false;
    // };
    // canvas.onmousemove = function(ev) {
    //     if (!g_mouseDown) return;

    //     let deltaX = ev.clientX - g_lastX;
    //     let deltaY = ev.clientY - g_lastY;

    //     g_lastX = ev.clientX;
    //     g_lastY = ev.clientY;

    //     let sensitivity = 0.3;

    //     // Horizontal rotation (like Q/E)
    //     g_camera.panRight(deltaX * sensitivity);

    //     // Vertical rotation (new!)
    //     g_camera.pitch(deltaY * sensitivity);
    // };
}

function loadTexture(src, textureUnit) {
    var image = new Image();    // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function() { sendTextureToGLSL(image, textureUnit); };
    // Tell the browser to load an image
    image.src = src;
}

function initTextures() {
    loadTexture('../resources/sky2.jpg', 0);            // texture 0
    loadTexture('../resources/grass.jpg', 1);           // texture 1
    loadTexture('../resources/brickwall.jpg', 2);            // texture 2

    return true;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function sendTextureToGLSL(image, textureUnit) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // ✅ KEY PART: mipmaps vs fallback
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Use mipmaps (BEST quality)
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
        // Fallback (required for non-power-of-2 textures)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    let ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext) {
        let max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
    }

    // Link sampler
    if (textureUnit === 0) {
        gl.uniform1i(u_Sampler0, 0);
    } else if (textureUnit === 1) {
        gl.uniform1i(u_Sampler1, 1);
    } else if (textureUnit === 2) {
        gl.uniform1i(u_Sampler2, 2);
    }

    console.log("Finished loadTexture", textureUnit);
}

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    document.onkeydown = keydown;
    g_camera = new Camera();
    initMap();
    initTextures();

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

function keydown(ev) {
    switch (ev.key) {
        case 'w':
            g_camera.moveForward(0.2);
            break;
        case 's':
            g_camera.moveBackward(0.2);
            break;
        case 'a':
            g_camera.moveLeft(0.2);
            break;
        case 'd':
            g_camera.moveRight(0.2);
            break;
        case 'q':
            g_camera.panLeft(5);
            break;
        case 'e':
            g_camera.panRight(5);
            break;

        case 'f':   // place block
            addBlock();
            break;

        case 'g':   // remove block
            removeBlock();
            break;
            }

    renderAllShapes();
}

// var g_map = [
//     [1, 1, 1, 1, 1, 1, 1, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 1, 1, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1],
//     [1, 0, 0, 0, 1, 0, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1],
// ];
// function drawMap() {
//     for (x = 0; x < 8; x++) {
//         for (y = 0; y < 8; y++) {
//             if (g_map[x][y] == 1) {
//                 var wall = new Cube();
//                 wall.color = [0.0, 1.0, 0.0, 1.0];
//                 wall.textureNum = -2;
//                 wall.matrix.translate(x - 4, -0.75, y - 4);
//                 wall.render();
//             }
//         }
//     }
// }

// function initMap() {
//     for (let x = 0; x < 32; x++) {
//         for (let z = 0; z < 32; z++) {
//             if (x == 0 || x == 31 || z == 0 || z == 31) {

//                 for (let h = 0; h < 3; h++) {
//                     var wall = new Cube();
//                     wall.color = [0.8, 1.0, 1.0, 1.0];
//                     wall.textureNum = -2;
//                     wall.matrix.translate(0, -0.75, 0);
//                     wall.matrix.scale(0.4, 0.4, 0.4);
//                     wall.matrix.translate(x - 16, h, z - 16);

//                     g_walls.push(wall);
//                 }
//             }
//         }
//     }
// }

var g_map = [
    [3, 3, 3, 3, 3, 3, 3, 3,    3, 3, 3, 3, 3, 3, 3, 3,    3, 3, 3, 3, 3, 3, 3, 3,    3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],

    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],

    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 3],
    [3, 3, 3, 3, 3, 3, 3, 3,    3, 3, 3, 3, 3, 3, 3, 3,    3, 3, 3, 3, 3, 3, 3, 3,    3, 3, 3, 3, 3, 3, 3, 3],
];

let g_walls = [];

function initMap() {
    g_walls = []; // reset
    for (let z = 0; z < g_map.length; z++) {
        for (let x = 0; x < g_map[z].length; x++) {
            let cell = g_map[z][x];
            if (cell > 0) {
                let height = cell; // allows future 2, 3, etc.
                for (let h = 0; h < height; h++) {
                    let wall = new Cube();
                    wall.color = [0.8, 1.0, 1.0, 1.0];
                    wall.textureNum = 1;
                    wall.matrix.translate(0, -0.75, 0);
                    wall.matrix.scale(0.4, 0.4, 0.4);
                    wall.matrix.translate(x - 16, h, z - 16);
                    g_walls.push(wall);
                }
            }
        }
    }
}

function drawMap() {
    for (let wall of g_walls) {
        wall.renderFast();
    }
}

function drawBorder() {
    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            if (x == 0 || x == 31 || z == 0 || z == 31) {
                for (let h = 0; h < 0; h++) {
                    var wall = new Cube();
                    wall.color = [0.8, 1.0, 1.0, 1.0];
                    wall.textureNum = -2;
                    wall.matrix.translate(0, -0.75, 0);
                    wall.matrix.scale(0.4, 0.4, 0.4);
                    wall.matrix.translate(x - 16, h, z - 16);
                    wall.renderFast();
                }
            }
        }
    }
}

// function drawMap() {
//     for (i = 0; i < 2; i++) {
//         for (x = 0; x < 32; x++) {
//             for (y = 0; y < 32; y++) {
//                 var wall = new Cube();
//                 wall.color = [0.8, 1.0, 1.0, 1.0];
//                 wall.textureNum = -2;
//                 wall.matrix.translate(0, -0.75, 0);
//                 wall.matrix.scale(0.4, 0.4, 0.4);
//                 wall.matrix.translate(x - 16, 0, y - 16);
//                 wall.renderFast();
//             }
//         }
//     }
// }

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Check the time at the start of the function
    var startTime = performance.now();

    // Pass the projection matrix
    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);

    // Pass the view matrix
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(...g_camera.eye.elements, ...g_camera.at.elements, ...g_camera.up.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    // Pass the matrix to u_ModelMatrix attribute variable
    var globalRotMat = new Matrix4().rotate(g_globalXAngle, 1, 0, 0).rotate(g_globalYAngle, 0, 1, 0).rotate(g_globalZAngle, 0, 0, 1).rotate(g_yaw, 0, 1, 0).rotate(g_pitch, 1, 0, 0); 
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the floor
    var floor = new Cube();
    floor.color = [1.0, 0.0, 0.0, 1.0];
    floor.textureNum = 1;
    floor.matrix.translate(0.0, -0.75, 0.0);
    floor.matrix.scale(12.0, 0.0, 12.0);
    floor.matrix.translate(-0.5, 0.0, -0.5);
    floor.render();

    // Draw the sky
    var sky = new Cube();
    sky.color = [0.0, 1.0, 0.0, 1.0];
    sky.textureNum = 0;
    sky.matrix.translate(0.0, 0.25, 0.0);
    sky.matrix.scale(40.0, 40.0, 40.0);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    // Draw the map
    drawMap();
    drawBorder();

    // // Otter stuff
    // var otter = new Otter();
    // otter.matrix.translate(0.1, -0.15, -0.25);
    // otter.matrix.rotate(180, 0, 1, 0);
    // otter.matrix.scale(0.45, 0.45, 0.45);

    // otter.isAnimating = g_isAnimating;
    // otter.poke = g_poke;
    // otter.animate(g_seconds);
    // otter.flipStart = g_flipStart;

    // otter.render();

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

function getFrontCell() {
    let dir = new Vector3();
    dir.set(g_camera.at);
    dir.sub(g_camera.eye);
    dir.normalize();

    // step forward (tweak this number if needed)
    let reach = 1.0;

    let fx = g_camera.eye.elements[0] + dir.elements[0] * reach;
    let fz = g_camera.eye.elements[2] + dir.elements[2] * reach;

    // convert to grid
    let gx = Math.floor(fx + 16);
    let gz = Math.floor(fz + 16);

    return [gx, gz];
}
function addBlock() {
    let [x, z] = getFrontCell();

    if (z >= 0 && z < g_map.length && x >= 0 && x < g_map[0].length) {
        g_map[z][x] += 1;  // increase height
        initMap();         // rebuild walls
    }
}
function removeBlock() {
    let [x, z] = getFrontCell();

    if (z >= 0 && z < g_map.length && x >= 0 && x < g_map[0].length) {
        if (g_map[z][x] > 0) {
            g_map[z][x] -= 1;
            initMap();
        }
    }
}