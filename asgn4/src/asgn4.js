/*
Name: Alice Xiao-Li
Email: axiaoli@ucsc.edu
Note: Used LLM as a coding assistant

*/

// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec3 v_LocalPos;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        // gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        // v_UV = a_UV;
        // // v_Normal = a_Normal;
        // v_Normal = normalize(mat3(u_ModelMatrix) * a_Normal);
        // v_VertPos = u_ModelMatrix * a_Position;

        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(mat3(u_GlobalRotateMatrix * u_ModelMatrix) * a_Normal);
        v_LocalPos = a_Position.xyz;
        v_VertPos = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec3 v_LocalPos;
    uniform vec4 u_FragColor;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;
    uniform vec3 u_lightColor;
    uniform bool u_spotOn;
    uniform vec3 u_spotPos;
    uniform vec3 u_spotDir;
    uniform vec3 u_spotColor;
    uniform float u_spotCutoffCos;

    void main() {
        if (u_whichTexture == -5) {
            // Volumetric spotlight beam gradient
            float h = clamp(v_LocalPos.y + 0.5, 0.0, 1.0);      // 0 at base, 1 at tip
            float expectedR = max(0.02, 0.5 * (1.0 - h));       // cone radius at this height
            float r = length(v_LocalPos.xz);

            float edge = 1.0 - smoothstep(expectedR * 0.55, expectedR, r);
            float core = 1.0 - smoothstep(0.0, expectedR * 0.28, r);
            float axial = pow(h, 0.65);

            float alpha = (0.32 * edge + 0.36 * core) * axial * u_FragColor.a;
            vec3 beamCol = mix(u_FragColor.rgb * 0.72, u_FragColor.rgb * 1.18, core);
            gl_FragColor = vec4(beamCol, alpha);
        } else if (u_whichTexture == -4) {
            gl_FragColor = u_FragColor;                         // Emissive color (no lighting)
        } else if (u_whichTexture == -3) {
            vec3 n = normalize(v_Normal);
            gl_FragColor = vec4((n + 1.0) / 2.0, 1.0);          // Use normal color
        } else if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;                         // Use color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);                // Use UV debug color
        } else {
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);            // Use error color
        }

        if (u_whichTexture != -4 && u_whichTexture != -5) {
            vec3 N = normalize(v_Normal);
            vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
            vec3 baseColor = vec3(gl_FragColor);
            vec3 litColor = baseColor * 0.3;

            // Existing point light (unchanged behavior)
            if (u_lightOn) {
                vec3 lightVector = u_lightPos - vec3(v_VertPos);
                vec3 L = normalize(lightVector);
                float nDotL = max(dot(N, L), 0.0);
                vec3 diffuse = baseColor * nDotL * 0.7 * u_lightColor;
                litColor += diffuse;

                if (u_whichTexture == -2 && nDotL > 0.0) {
                    vec3 R = reflect(-L, N);
                    float specular = pow(max(dot(E, R), 0.0), 10.0);
                    litColor += vec3(specular) * u_lightColor;
                }
            }

            // Spotlight
            if (u_spotOn) {
                vec3 fromSpot = normalize(vec3(v_VertPos) - u_spotPos);
                float cone = dot(normalize(u_spotDir), fromSpot);
                float coneSoft = smoothstep(u_spotCutoffCos, min(1.0, u_spotCutoffCos + 0.1), cone);
                if (coneSoft > 0.0) {
                    vec3 Ls = normalize(u_spotPos - vec3(v_VertPos));
                    float nDotLs = max(dot(N, Ls), 0.0);
                    float spotDist = length(u_spotPos - vec3(v_VertPos));
                    float distFalloff = 1.0 / (1.0 + 0.35 * spotDist + 0.05 * spotDist * spotDist);
                    float spotStrength = coneSoft * 3.0 * distFalloff;
                    litColor += baseColor * nDotLs * u_spotColor * spotStrength;

                    if (u_whichTexture == -2 && nDotLs > 0.0) {
                        vec3 Rs = reflect(-Ls, N);
                        float spotSpec = pow(max(dot(E, Rs), 0.0), 20.0);
                        litColor += vec3(spotSpec) * u_spotColor * spotStrength;
                    }
                }
            }

            gl_FragColor = vec4(litColor, 1.0);
        }
    }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;
let u_spotOn;
let u_spotPos;
let u_spotDir;
let u_spotColor;
let u_spotCutoffCos;

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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_lightPos
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    // Get the storage location of u_lightOn
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    // Get the storage location of u_lightColor
    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
        console.log('Failed to get the storage location of u_lightColor');
        return;
    }

    // Get the storage location of spotlight uniforms
    u_spotOn = gl.getUniformLocation(gl.program, 'u_spotOn');
    if (!u_spotOn) {
        console.log('Failed to get the storage location of u_spotOn');
        return;
    }
    u_spotPos = gl.getUniformLocation(gl.program, 'u_spotPos');
    if (!u_spotPos) {
        console.log('Failed to get the storage location of u_spotPos');
        return;
    }
    u_spotDir = gl.getUniformLocation(gl.program, 'u_spotDir');
    if (!u_spotDir) {
        console.log('Failed to get the storage location of u_spotDir');
        return;
    }
    u_spotColor = gl.getUniformLocation(gl.program, 'u_spotColor');
    if (!u_spotColor) {
        console.log('Failed to get the storage location of u_spotColor');
        return;
    }
    u_spotCutoffCos = gl.getUniformLocation(gl.program, 'u_spotCutoffCos');
    if (!u_spotCutoffCos) {
        console.log('Failed to get the storage location of u_spotCutoffCos');
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

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Set an initial value for this model matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniform1i(u_whichTexture, -2);
    gl.disableVertexAttribArray(a_UV);
    gl.vertexAttrib2f(a_UV, 0.0, 0.0);
    gl.disableVertexAttribArray(a_Normal);
    gl.vertexAttrib3f(a_Normal, 0.0, 0.0, 1.0);
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
let g_normalOn = false;
let g_lightPos = [0, 1, -2];
let g_lightOn = true;
let g_lightColor = [1.0, 1.0, 1.0];
let g_spotOn = false;
let g_spotPos = [-0.2, 2.0, -0.25];
let g_spotDir = [0.0, -1.0, 0.0];
let g_spotColor = [1.0, 1.0, 1.0];
let g_spotBeamOn = true;
let g_spotCutoffDeg = 24.0;
let g_bunnyMesh = null;
let g_bunnyLoadError = '';

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
    document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes(); } });
    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes(); } });
    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes(); } });
    document.getElementById('lightRed').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightColor[0] = this.value / 100; renderAllShapes(); } });
    document.getElementById('lightGreen').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightColor[1] = this.value / 100; renderAllShapes(); } });
    document.getElementById('lightBlue').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightColor[2] = this.value / 100; renderAllShapes(); } });

    // Button Events
    document.getElementById('onButton').addEventListener('click', function() { g_isAnimating = true; g_poke = false; });
    document.getElementById('offButton').addEventListener('click', function() { g_isAnimating = false; resetManualControls(); });
    document.getElementById('normalOn').addEventListener('click', function() { g_normalOn = true; });
    document.getElementById('normalOff').addEventListener('click', function() { g_normalOn = false; });
    document.getElementById('lightOn').addEventListener('click', function() { g_lightOn = true; });
    document.getElementById('lightOff').addEventListener('click', function() { g_lightOn = false; });
    document.getElementById('spotOn').addEventListener('click', function() { g_spotOn = true; });
    document.getElementById('spotOff').addEventListener('click', function() { g_spotOn = false; });
    document.getElementById('spotBeamOn').addEventListener('click', function() { g_spotBeamOn = true; });
    document.getElementById('spotBeamOff').addEventListener('click', function() { g_spotBeamOn = false; });

    // Poke Events
    canvas.onmousedown = function(ev) {if (ev.shiftKey && ev.button === 0) { g_poke = !g_poke; if (g_poke) g_isAnimating = false;
        g_flipStart = performance.now(); if (!g_poke) { resetManualControls(); }} g_mouseDown = true; g_lastX = ev.clientX; g_lastY = ev.clientY; };

    // Camera Events
    // canvas.onmousedown = function(ev) { g_mouseDown = true; g_lastX = ev.clientX; g_lastY = ev.clientY; };
    canvas.onmouseup = function() { g_mouseDown = false; };
    canvas.onmouseleave = function() { g_mouseDown = false; };
    canvas.onmousemove = function(ev) { if (!g_mouseDown) return; let deltaX = ev.clientX - g_lastX; let deltaY = ev.clientY - g_lastY; g_lastX = ev.clientX;
        g_lastY = ev.clientY; let sensitivity = 0.5; g_yaw += deltaX * sensitivity; g_pitch -= deltaY * sensitivity; /*g_pitch = Math.max(-89, Math.min(89, g_pitch));*/ };
}

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Load bunny mesh data
    loadBunnyOBJ();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.6, 0.6, 0.8, 1.0);

    // Render
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
    // Save the current time
    g_seconds = performance.now() / 1000.0-g_startTime;
    // console.log(g_seconds);

    g_lightPos[0] = Math.cos(g_seconds);

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

function resolveOBJIndex(index, listLength) {
    if (index > 0) return index;
    if (index < 0) return listLength + index;
    return 0;
}

function parseOBJFaceToken(token) {
    let parts = token.split('/');
    let v = parseInt(parts[0], 10);
    let n = 0;
    if (parts.length >= 3 && parts[2] !== '') {
        n = parseInt(parts[2], 10);
    }
    return {
        v: Number.isFinite(v) ? v : 0,
        n: Number.isFinite(n) ? n : 0
    };
}

function computeFaceNormal(p1, p2, p3) {
    let ux = p2[0] - p1[0];
    let uy = p2[1] - p1[1];
    let uz = p2[2] - p1[2];
    let vx = p3[0] - p1[0];
    let vy = p3[1] - p1[1];
    let vz = p3[2] - p1[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    let len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len < 1e-8) return [0.0, 1.0, 0.0];
    return [nx / len, ny / len, nz / len];
}

function parseOBJMesh(text) {
    let objPositions = [[0.0, 0.0, 0.0]];
    let objNormals = [[0.0, 1.0, 0.0]];
    let outPositions = [];
    let outNormals = [];
    let outUVs = [];

    let lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '' || line.startsWith('#')) continue;

        let parts = line.split(/\s+/);
        let keyword = parts[0];

        if (keyword === 'v' && parts.length >= 4) {
            objPositions.push([
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            ]);
        } else if (keyword === 'vn' && parts.length >= 4) {
            objNormals.push([
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            ]);
        } else if (keyword === 'f' && parts.length >= 4) {
            let refs = [];
            for (let p = 1; p < parts.length; p++) {
                refs.push(parseOBJFaceToken(parts[p]));
            }

            for (let tri = 1; tri < refs.length - 1; tri++) {
                let a = refs[0];
                let b = refs[tri];
                let c = refs[tri + 1];

                let pa = objPositions[resolveOBJIndex(a.v, objPositions.length)];
                let pb = objPositions[resolveOBJIndex(b.v, objPositions.length)];
                let pc = objPositions[resolveOBJIndex(c.v, objPositions.length)];
                if (!pa || !pb || !pc) continue;

                let na = a.n ? objNormals[resolveOBJIndex(a.n, objNormals.length)] : null;
                let nb = b.n ? objNormals[resolveOBJIndex(b.n, objNormals.length)] : null;
                let nc = c.n ? objNormals[resolveOBJIndex(c.n, objNormals.length)] : null;

                if (!na || !nb || !nc) {
                    let faceN = computeFaceNormal(pa, pb, pc);
                    if (!na) na = faceN;
                    if (!nb) nb = faceN;
                    if (!nc) nc = faceN;
                }

                outPositions.push(pa[0], pa[1], pa[2], pb[0], pb[1], pb[2], pc[0], pc[1], pc[2]);
                outNormals.push(na[0], na[1], na[2], nb[0], nb[1], nb[2], nc[0], nc[1], nc[2]);
                outUVs.push(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            }
        }
    }

    return {
        positions: new Float32Array(outPositions),
        normals: new Float32Array(outNormals),
        uvs: new Float32Array(outUVs)
    };
}

function createBunnyBuffers(mesh) {
    let positionBuffer = gl.createBuffer();
    let normalBuffer = gl.createBuffer();
    let uvBuffer = gl.createBuffer();
    if (!positionBuffer || !normalBuffer || !uvBuffer) return null;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);

    return {
        positionBuffer: positionBuffer,
        normalBuffer: normalBuffer,
        uvBuffer: uvBuffer,
        vertexCount: mesh.positions.length / 3
    };
}

async function loadBunnyOBJ() {
    try {
        let response = await fetch('../resources/bunny.obj');
        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ' when loading bunny.obj');
        }
        let objText = await response.text();
        let parsed = parseOBJMesh(objText);
        if (!parsed || parsed.positions.length === 0) {
            throw new Error('bunny.obj parsed but had no triangle data');
        }
        g_bunnyMesh = createBunnyBuffers(parsed);
        if (!g_bunnyMesh) {
            throw new Error('failed to create WebGL buffers for bunny');
        }
        console.log('Bunny OBJ loaded:', g_bunnyMesh.vertexCount, 'vertices');
    } catch (err) {
        g_bunnyLoadError = String(err);
        console.log('Failed to load bunny.obj:', err);
    }
}

function renderBunny() {
    if (!g_bunnyMesh) return;

    gl.uniform1i(u_whichTexture, g_normalOn ? -3 : -2);
    gl.uniform4f(u_FragColor, 0.67, 0.92, 1.0, 1.0);

    let bunnyMatrix = new Matrix4();
    bunnyMatrix.translate(-0.9, -0.5, -0.10);
    bunnyMatrix.scale(0.15, 0.15, 0.15);
    bunnyMatrix.rotate(180, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, bunnyMatrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_bunnyMesh.positionBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_bunnyMesh.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_bunnyMesh.normalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, g_bunnyMesh.vertexCount);
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Check the time at the start of the function
    var startTime = performance.now();

    // Pass the projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(50, canvas.width/canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(0,0.75,5, 0,0,-100, 0,1,0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to u_ModelMatrix attribute variable
    var globalRotMat = new Matrix4().rotate(180, 0, 1, 0).rotate(g_globalXAngle, 1, 0, 0).rotate(g_globalYAngle, 0, 1, 0).rotate(g_globalZAngle, 0, 0, 1).rotate(g_yaw, 0, 1, 0).rotate(g_pitch, 1, 0, 0); 
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Lighting uniforms
    let lightPos = new Vector4([g_lightPos[0], g_lightPos[1], g_lightPos[2], 1.0]);
    let transformedLightPos = globalRotMat.multiplyVector4(lightPos);

    gl.uniform3f(u_lightPos, transformedLightPos.elements[0], transformedLightPos.elements[1], transformedLightPos.elements[2]);
    gl.uniform3f(u_cameraPos, 0, 1, 5);
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

    let spotPos4 = globalRotMat.multiplyVector4(new Vector4([g_spotPos[0], g_spotPos[1], g_spotPos[2], 1.0]));
    let spotDir4 = globalRotMat.multiplyVector4(new Vector4([g_spotDir[0], g_spotDir[1], g_spotDir[2], 0.0]));
    let spotDirLen = Math.sqrt(
        spotDir4.elements[0] * spotDir4.elements[0] +
        spotDir4.elements[1] * spotDir4.elements[1] +
        spotDir4.elements[2] * spotDir4.elements[2]
    ) || 1.0;

    gl.uniform1i(u_spotOn, g_spotOn);
    gl.uniform3f(u_spotPos, spotPos4.elements[0], spotPos4.elements[1], spotPos4.elements[2]);
    gl.uniform3f(u_spotDir, spotDir4.elements[0] / spotDirLen, spotDir4.elements[1] / spotDirLen, spotDir4.elements[2] / spotDirLen);
    gl.uniform3f(u_spotColor, g_spotColor[0], g_spotColor[1], g_spotColor[2]);
    gl.uniform1f(u_spotCutoffCos, Math.cos(g_spotCutoffDeg * Math.PI / 180.0));

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the floor
    var floor = new Cube();
    floor.color = [0.5, 0.5, 0.5, 1.0];
    floor.textureNum = -2;
    floor.matrix.translate(0.0, -0.75, 0.0);
    floor.matrix.scale(3.0, 0.1, 3.0);
    floor.matrix.translate(-0.5, -0.0, -0.5);
    floor.render();

    // // Draw the sky
    // var sky = new Cube();
    // sky.color = [0.5, 0.5, 0.5, 1.0];
    // sky.textureNum = -2;
    // sky.matrix.translate(0.0, -0.75, 0.0);
    // sky.matrix.scale(3.0, 3.0, 3.0);
    // sky.matrix.translate(-0.5, -0.0, -0.5);
    // sky.render();

    // Draw the walls
    var wall1 = new Cube();
    wall1.color = [0.5, 0.5, 0.5, 1.0];
    wall1.textureNum = -2;
    wall1.matrix.translate(-1.5, -0.75, -1.5);
    wall1.matrix.scale(0.1, 3.0, 3.0);
    wall1.render();
    var wall2 = new Cube();
    wall2.color = [0.5, 0.5, 0.5, 1.0];
    wall2.textureNum = -2;
    wall2.matrix.translate(1.5, -0.75, -1.5);
    wall2.matrix.scale(0.1, 3.0, 3.0);
    wall2.render();
    var wall3 = new Cube();
    wall3.color = [0.5, 0.5, 0.5, 1.0];
    wall3.textureNum = -2;
    wall3.matrix.translate(-1.5, -0.75, 1.4);
    wall3.matrix.scale(3.0, 3.0, 0.1);
    wall3.render();
    var wall4 = new Cube();
    wall4.color = [0.5, 0.5, 0.5, 1.0];
    wall4.textureNum = -2;
    wall4.matrix.translate(-1.5, 2.15, -1.5);
    wall4.matrix.scale(3.0, 0.1, 3.0);
    wall4.render();

    // Draw Otter
    var otter = new Otter();
    otter.matrix.translate(-0.15, -0.15, -0.25);
    // otter.matrix.translate(-0.75, -0.15, -0.25);
    otter.matrix.scale(0.45, 0.45, 0.45);
    otter.isAnimating = g_isAnimating;
    otter.poke = g_poke;
    otter.animate(g_seconds);
    otter.flipStart = g_flipStart;
    if (g_normalOn) otter.textureNum = -3;
    otter.render();

    // Draw sphere
    var sphere = new Sphere();
    sphere.color = [1.0, 0.7, 0.75, 1.0];
    sphere.textureNum = g_normalOn ? -3 : -2;
    sphere.matrix.translate(0.5, 0.0, 0.0);
    sphere.matrix.scale(0.2, 0.2, 0.2);
    // sphere.textureNum = -1;
    sphere.render();

    // Draw bunny OBJ
    renderBunny();

    // Draw light
    var light = new Cube();
    light.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0];
    light.textureNum = -4;
    light.matrix.translate(0.0, -0.5, 1.5);
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(0.1, 0.1, 0.1);
    light.render();

    // Draw spotlight beam
    if (g_spotOn && g_spotBeamOn) {
        var spotBeam = new Cone();
        spotBeam.segments = 24;
        spotBeam.textureNum = -5;
        spotBeam.color = [g_spotColor[0], g_spotColor[1], g_spotColor[2], 0.95];
        spotBeam.matrix.translate(g_spotPos[0], g_spotPos[1] - 30, g_spotPos[2]);
        spotBeam.matrix.scale(40, 60, 40);

        var spotBeamOuter = new Cone();
        spotBeamOuter.segments = 24;
        spotBeamOuter.textureNum = -5;
        spotBeamOuter.color = [g_spotColor[0], g_spotColor[1], g_spotColor[2], 0.45];
        spotBeamOuter.matrix.translate(g_spotPos[0], g_spotPos[1] - 32.5, g_spotPos[2]);
        spotBeamOuter.matrix.scale(50, 65, 50);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.depthMask(false);
        spotBeamOuter.render();
        spotBeam.render();
        gl.depthMask(true);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    // Draw spotlight visual
    var spotlight = new Cube();
    spotlight.color = [1.0, 1.0, 1.0, 1.0];
    spotlight.textureNum = -4;
    spotlight.matrix.translate(g_spotPos[0] - 0.15, g_spotPos[1], g_spotPos[2] - 0.15);
    spotlight.matrix.scale(0.3, 0.2, 0.3);
    spotlight.render();

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
