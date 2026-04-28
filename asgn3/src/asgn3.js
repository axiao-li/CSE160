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
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
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
        } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);         // Use texture3
        } else if (u_whichTexture == 4) {
            vec4 flowerColor = texture2D(u_Sampler4, v_UV);     // Use texture4
            if (flowerColor.a < 0.1) discard;
            gl_FragColor = vec4(flowerColor.rgb, 0.9);
        } else if (u_whichTexture == 5) {
            vec4 gnomeColor = texture2D(u_Sampler5, v_UV);      // Use texture5
            if (gnomeColor.a < 0.1) discard;
            gl_FragColor = gnomeColor;
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
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_whichTexture;

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

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }

    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }

    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler5) {
        console.log('Failed to get the storage location of u_Sampler5');
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
let g_mouseDown = false;
let g_lastX = 0;
let g_lastY = 0;
let g_cameraYaw = 0;
let g_cameraPitch = 0;
let g_camera;
let g_cursorX = null;
let g_cursorY = null;
let g_keys = {};
let g_lastFrameTime = 0;
let g_flowers = [];
let g_collectedFlowers = 0;
let g_gnomes = [];
let g_gnomeCount = 2;
let g_gameStartTime = 0;
let g_elapsedTimeSeconds = 0;
let g_timePenaltySeconds = 0;
let g_gameActive = false;
let g_gameStarted = false;
let g_noticeClearHandle = null;
let g_captureCount = 0;
let g_gnomesAttackedCount = 0;
let g_blocksPlacedCount = 0;
let g_spawnCellX = 0;
let g_spawnCellZ = 0;
let g_textureSlots = {};
let g_texturePOTCanvas = {};
let g_animatedTextureHost = null;
let g_audioInitialized = false;
let g_backgroundMusicAudio = null;
let g_collectFlowerAudio = null;
let g_hoorayAudio = null;
let g_oofAudio = null;
let g_gnomeHurtAudio = null;
let g_blockAudio = null;
let g_wompAudio = null;
let g_gnomeLaughAudioLoops = [];
let g_masterVolume = 1.0;
let g_activeOneShots = [];
let g_miniMapWallImage = null;
let g_miniMapStoneImage = null;

const BLOCK_SIZE = 0.4;
const FLOOR_Y = -0.75;
const PICK_STEP = 0.05;
const PICK_MAX_DIST = 50;
const PLAYER_RADIUS = 0.1;
const PLAYER_EYE_HEIGHT = 0.75;
const PLAYER_HEIGHT = 1.5;
const CAMERA_NEAR = 0.03;
const CAMERA_FAR = 100;
const LOOK_SENSITIVITY = 0.25;
const CAMERA_MIN_PITCH = -89;
const CAMERA_MAX_PITCH = 89;
const WALL_UV_SCALE = 0.35;
const MAZE_WALL_HEIGHT = 3;
const GROUND_UV_SCALE = 12.0;
const MOVE_SPEED_PER_SEC = 1.9;
const TURN_SPEED_DEG_PER_SEC = 120;
const VERTICAL_SPEED_PER_SEC = 1.8;
const WALL_THICKNESS = BLOCK_SIZE;
const WALL_INSET = 0.0;
const FLOWER_TARGET = 8;
const FLOWER_COLLECT_RADIUS = 0.18;
const FLOWER_WIDTH = 0.16;
const FLOWER_HEIGHT = 0.22;
const FLOWER_THICKNESS = 0.018;
const GNOME_SPEED_PER_SEC = 1.05;
const GNOME_REPATH_SECONDS = 0.4;
const GNOME_WIDTH = 0.4;
const GNOME_HEIGHT = 0.6;
const GNOME_RADIUS = 0.11;
const GNOME_CATCH_RADIUS = 0.24;
const GNOME_MIN_COUNT = 0;
const GNOME_MAX_COUNT = 10;
const SAFE_ZONE_HALF_CELLS = 1;
const SAFE_ZONE_HEIGHT_BLOCKS = 3;
const GAME_UI_FONT = '"Press Start 2P", "VT323", "Lucida Console", "Courier New", monospace';
const BACKGROUND_MUSIC_VOLUME = 0.3;
const FLOWER_COLLECT_VOLUME = 0.85;
const HOORAY_VOLUME = 0.9;
const OOF_VOLUME = 0.8;
const GNOME_HURT_VOLUME = 0.85;
const BLOCK_VOLUME = 0.75;
const WOMP_VOLUME = 0.85;
const GNOME_LAUGH_MAX_VOLUME = 0.56;
const GNOME_LAUGH_NEAR_DIST = BLOCK_SIZE * 1.0;
const GNOME_LAUGH_FAR_DIST = BLOCK_SIZE * 18.0;
const MINIMAP_SIZE_PX = 250;
const MINIMAP_CELL_PADDING_PX = 4;
const MINIMAP_MARKER_FLOWER_RATIO = 1.15;
const MINIMAP_MARKER_GNOME_RATIO = 1.25;
const MINIMAP_MARKER_PLAYER_RATIO = 1.35;

function buildGlobalRotateMatrix() {
    return new Matrix4()
        .rotate(g_globalXAngle, 1, 0, 0)
        .rotate(g_globalYAngle, 0, 1, 0)
        .rotate(g_globalZAngle, 0, 0, 1);
}

function clamp(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
}

function applyMasterVolume(rawVolume) {
    return clamp(rawVolume * g_masterVolume, 0, 1);
}

function createAudioClip(src, loop = false, volume = 1.0) {
    let clip = new Audio(src);
    clip.preload = 'auto';
    clip.loop = loop;
    clip._baseVolume = clamp(volume, 0, 1);
    clip.volume = applyMasterVolume(clip._baseVolume);
    return clip;
}

function initAudio() {
    if (g_audioInitialized) return;
    g_backgroundMusicAudio = createAudioClip('../resources/backgroundMusic.mp3', true, BACKGROUND_MUSIC_VOLUME);
    g_collectFlowerAudio = createAudioClip('../resources/collectFlower.mp3', false, FLOWER_COLLECT_VOLUME);
    g_hoorayAudio = createAudioClip('../resources/hooray.mp3', false, HOORAY_VOLUME);
    g_oofAudio = createAudioClip('../resources/oof.mp3', false, OOF_VOLUME);
    g_gnomeHurtAudio = createAudioClip('../resources/gnomeHurt.mp3', false, GNOME_HURT_VOLUME);
    g_blockAudio = createAudioClip('../resources/block.mp3', false, BLOCK_VOLUME);
    g_wompAudio = createAudioClip('../resources/womp.mp3', false, WOMP_VOLUME);
    g_audioInitialized = true;
    ensureGnomeLaughAudioLoopCount();
}

function playLoopAudio(loopAudio) {
    if (!loopAudio) return;
    if (!loopAudio.paused) return;
    let playPromise = loopAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {});
    }
}

function stopLoopAudio(loopAudio) {
    if (!loopAudio) return;
    loopAudio.pause();
    try {
        loopAudio.currentTime = 0;
    } catch (err) {
        // Ignore currentTime errors from browsers that block seek pre-play.
    }
}

function updateMasterVolumeForActiveAudio() {
    if (!g_audioInitialized) return;

    let sourceClips = [
        g_backgroundMusicAudio,
        g_collectFlowerAudio,
        g_hoorayAudio,
        g_oofAudio,
        g_gnomeHurtAudio,
        g_blockAudio,
        g_wompAudio
    ];

    for (let i = 0; i < sourceClips.length; i++) {
        let clip = sourceClips[i];
        if (!clip || typeof clip._baseVolume !== 'number') continue;
        clip.volume = applyMasterVolume(clip._baseVolume);
    }

    for (let i = g_activeOneShots.length - 1; i >= 0; i--) {
        let shot = g_activeOneShots[i];
        if (!shot || shot.ended) {
            g_activeOneShots.splice(i, 1);
            continue;
        }
        if (typeof shot._baseVolume === 'number') {
            shot.volume = applyMasterVolume(shot._baseVolume);
        }
    }

    updateGnomeLaughVolumes();
}

function setMasterVolume(level) {
    g_masterVolume = clamp(level, 0, 1);
    updateMasterVolumeForActiveAudio();

    let slider = document.getElementById('masterVolumeSlider');
    if (slider) slider.value = String(Math.round(g_masterVolume * 100));
    let readout = document.getElementById('masterVolumeReadout');
    if (readout) readout.textContent = Math.round(g_masterVolume * 100) + '%';
}

function playOneShotAudio(sourceAudio, volumeScale = 1.0) {
    if (!sourceAudio) return;
    let shot = sourceAudio.cloneNode(true);
    shot.loop = false;
    let sourceBase = (typeof sourceAudio._baseVolume === 'number')
        ? sourceAudio._baseVolume
        : clamp(sourceAudio.volume, 0, 1);
    shot._baseVolume = clamp(sourceBase * volumeScale, 0, 1);
    shot.volume = applyMasterVolume(shot._baseVolume);

    let forgetShot = function() {
        let idx = g_activeOneShots.indexOf(shot);
        if (idx >= 0) g_activeOneShots.splice(idx, 1);
    };
    shot.addEventListener('ended', forgetShot, { once: true });
    shot.addEventListener('error', forgetShot, { once: true });
    g_activeOneShots.push(shot);

    let playPromise = shot.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {
            forgetShot();
        });
    }
}

function ensureGnomeLaughAudioLoopCount() {
    if (!g_audioInitialized) return;
    while (g_gnomeLaughAudioLoops.length < g_gnomes.length) {
        let clip = createAudioClip('../resources/gnomeLaugh.mp3', true, GNOME_LAUGH_MAX_VOLUME);
        g_gnomeLaughAudioLoops.push(clip);
    }
    while (g_gnomeLaughAudioLoops.length > g_gnomes.length) {
        let oldClip = g_gnomeLaughAudioLoops.pop();
        stopLoopAudio(oldClip);
    }
}

function computeDistanceFade(distance, nearDist, farDist) {
    if (distance <= nearDist) return 1;
    if (distance >= farDist) return 0;
    let t = (distance - nearDist) / Math.max(1e-6, farDist - nearDist);
    return 1 - t;
}

function updateGnomeLaughVolumes() {
    if (!g_audioInitialized || !g_camera) return;
    ensureGnomeLaughAudioLoopCount();

    let px = g_camera.eye.elements[0];
    let pz = g_camera.eye.elements[2];
    for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) {
        let gain = 0;
        if (i < g_gnomes.length) {
            let dx = px - g_gnomes[i].x;
            let dz = pz - g_gnomes[i].z;
            let distance = Math.hypot(dx, dz);
            gain = computeDistanceFade(distance, GNOME_LAUGH_NEAR_DIST, GNOME_LAUGH_FAR_DIST);
        }
        g_gnomeLaughAudioLoops[i].volume = applyMasterVolume(GNOME_LAUGH_MAX_VOLUME * gain);
    }
}

function startLoopingGameAudio() {
    initAudio();
    playLoopAudio(g_backgroundMusicAudio);
    ensureGnomeLaughAudioLoopCount();
    for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) {
        playLoopAudio(g_gnomeLaughAudioLoops[i]);
    }
    updateGnomeLaughVolumes();
}

function stopLoopingGameAudio() {
    if (!g_audioInitialized) return;
    stopLoopAudio(g_backgroundMusicAudio);
    for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) {
        stopLoopAudio(g_gnomeLaughAudioLoops[i]);
    }
}

function syncCameraAnglesFromView() {
    let forward = new Vector3();
    forward.set(g_camera.at);
    forward.sub(g_camera.eye);
    forward.normalize();

    g_cameraPitch = Math.asin(forward.elements[1]) * 180 / Math.PI;
    g_cameraYaw = Math.atan2(forward.elements[2], forward.elements[0]) * 180 / Math.PI;
}

function keepCameraAboveGround() {
    let minEyeY = FLOOR_Y + PLAYER_EYE_HEIGHT;
    if (g_camera.eye.elements[1] < minEyeY) {
        g_camera.eye.elements[1] = minEyeY;
    }
}

function updateCameraDirectionFromAngles() {
    keepCameraAboveGround();

    let yawRad = g_cameraYaw * Math.PI / 180;
    let pitchRad = g_cameraPitch * Math.PI / 180;
    let cosPitch = Math.cos(pitchRad);

    let dirX = Math.cos(yawRad) * cosPitch;
    let dirY = Math.sin(pitchRad);
    let dirZ = Math.sin(yawRad) * cosPitch;

    g_camera.at.elements[0] = g_camera.eye.elements[0] + dirX;
    g_camera.at.elements[1] = g_camera.eye.elements[1] + dirY;
    g_camera.at.elements[2] = g_camera.eye.elements[2] + dirZ;
    g_camera.updateViewMatrix();
}

function worldToMapCell(worldX, worldZ) {
    let mapHalfX = g_map[0].length / 2;
    let mapHalfZ = g_map.length / 2;
    let gridX = Math.floor(worldX / BLOCK_SIZE + mapHalfX);
    let gridZ = Math.floor(worldZ / BLOCK_SIZE + mapHalfZ);
    return [gridX, gridZ];
}

function getCellWorldMinX(x) {
    return (x - g_map[0].length / 2) * BLOCK_SIZE;
}

function getCellWorldMinZ(z) {
    return (z - g_map.length / 2) * BLOCK_SIZE;
}

function isCellInBounds(x, z) {
    return z >= 0 && z < g_map.length && x >= 0 && x < g_map[0].length;
}

function isCellInSafeZone(x, z) {
    return Math.abs(x - g_spawnCellX) <= SAFE_ZONE_HALF_CELLS &&
           Math.abs(z - g_spawnCellZ) <= SAFE_ZONE_HALF_CELLS;
}

function isPlayerInsideSafeZone() {
    let cell = worldToMapCell(g_camera.eye.elements[0], g_camera.eye.elements[2]);
    return isCellInSafeZone(cell[0], cell[1]);
}

function getPlayerBlockHeightAtCell(x, z) {
    if (!g_playerBlocks || g_playerBlocks.length === 0 || !isCellInBounds(x, z)) return 0;
    let row = g_playerBlocks[z];
    if (!row) return 0;
    return row[x] || 0;
}

function getTotalHeightAtCell(x, z) {
    if (!isCellInBounds(x, z)) return 0;
    return g_map[z][x] + getPlayerBlockHeightAtCell(x, z);
}

function overlapsInY(worldY, columnHeight) {
    if (columnHeight <= 0) return false;
    let feetY = worldY - PLAYER_EYE_HEIGHT;
    let headY = feetY + PLAYER_HEIGHT;
    let topY = FLOOR_Y + columnHeight * BLOCK_SIZE;
    return feetY < topY && headY > FLOOR_Y;
}

function isInsideWallColumn(worldX, worldZ, x, z) {
    let minX = getCellWorldMinX(x) + WALL_INSET;
    let maxX = minX + WALL_THICKNESS;
    let minZ = getCellWorldMinZ(z) + WALL_INSET;
    let maxZ = minZ + WALL_THICKNESS;
    return worldX >= minX && worldX <= maxX && worldZ >= minZ && worldZ <= maxZ;
}

function isInsideStoneColumn(worldX, worldZ, x, z) {
    let minX = getCellWorldMinX(x);
    let maxX = minX + BLOCK_SIZE;
    let minZ = getCellWorldMinZ(z);
    let maxZ = minZ + BLOCK_SIZE;
    return worldX >= minX && worldX <= maxX && worldZ >= minZ && worldZ <= maxZ;
}

function isSolidAtWorldPos(worldX, worldY, worldZ) {
    let [cx, cz] = worldToMapCell(worldX, worldZ);
    if (!isCellInBounds(cx, cz)) return true;

    // Check nearby cells because walls are thinner than full cell width.
    for (let z = cz - 1; z <= cz + 1; z++) {
        for (let x = cx - 1; x <= cx + 1; x++) {
            if (!isCellInBounds(x, z)) continue;

            let mazeHeight = g_map[z][x];
            if (mazeHeight > 0 && isInsideWallColumn(worldX, worldZ, x, z) && overlapsInY(worldY, mazeHeight)) {
                return true;
            }

            let stoneHeight = getPlayerBlockHeightAtCell(x, z);
            if (stoneHeight > 0 && isInsideStoneColumn(worldX, worldZ, x, z) && overlapsInY(worldY, stoneHeight)) {
                return true;
            }
        }
    }
    return false;
}

function canOccupy(worldX, worldY, worldZ) {
    // Check center + rim so we don't clip into corners.
    let probes = [
        [0, 0],
        [PLAYER_RADIUS, 0], [-PLAYER_RADIUS, 0],
        [0, PLAYER_RADIUS], [0, -PLAYER_RADIUS],
        [PLAYER_RADIUS, PLAYER_RADIUS], [PLAYER_RADIUS, -PLAYER_RADIUS],
        [-PLAYER_RADIUS, PLAYER_RADIUS], [-PLAYER_RADIUS, -PLAYER_RADIUS]
    ];

    for (let i = 0; i < probes.length; i++) {
        let px = worldX + probes[i][0];
        let pz = worldZ + probes[i][1];
        if (isSolidAtWorldPos(px, worldY, pz)) return false;
    }
    return true;
}

function canOccupyWithRadius(worldX, worldY, worldZ, radius) {
    let probes = [
        [0, 0],
        [radius, 0], [-radius, 0],
        [0, radius], [0, -radius],
        [radius, radius], [radius, -radius],
        [-radius, radius], [-radius, -radius]
    ];

    for (let i = 0; i < probes.length; i++) {
        let px = worldX + probes[i][0];
        let pz = worldZ + probes[i][1];
        if (isSolidAtWorldPos(px, worldY, pz)) return false;
    }
    return true;
}

function getPickRayFromClientPos(clientX, clientY) {
    let rect = canvas.getBoundingClientRect();
    let ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    let ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;

    let projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(60, canvas.width / canvas.height, CAMERA_NEAR, CAMERA_FAR);

    let viewMatrix = new Matrix4();
    viewMatrix.setLookAt(...g_camera.eye.elements, ...g_camera.at.elements, ...g_camera.up.elements);

    let inversePVG = new Matrix4(projectionMatrix);
    inversePVG.multiply(viewMatrix);
    inversePVG.multiply(buildGlobalRotateMatrix());
    inversePVG.invert();

    let nearClip = new Vector4([ndcX, ndcY, -1, 1]);
    let farClip = new Vector4([ndcX, ndcY, 1, 1]);
    let near4 = inversePVG.multiplyVector4(nearClip);
    let far4 = inversePVG.multiplyVector4(farClip);

    let nearW = near4.elements[3];
    let farW = far4.elements[3];
    if (Math.abs(nearW) < 1e-6 || Math.abs(farW) < 1e-6) {
        return null;
    }

    let near = new Vector3([
        near4.elements[0] / nearW,
        near4.elements[1] / nearW,
        near4.elements[2] / nearW
    ]);
    let far = new Vector3([
        far4.elements[0] / farW,
        far4.elements[1] / farW,
        far4.elements[2] / farW
    ]);

    let dir = new Vector3();
    dir.set(far);
    dir.sub(near);
    dir.normalize();

    return { origin: near, dir: dir };
}

function rayIntersectAABB(origin, dir, minX, minY, minZ, maxX, maxY, maxZ) {
    let ox = origin[0], oy = origin[1], oz = origin[2];
    let dx = dir[0], dy = dir[1], dz = dir[2];

    let tMin = -Infinity;
    let tMax = Infinity;

    function updateSlab(o, d, minV, maxV) {
        if (Math.abs(d) < 1e-8) {
            if (o < minV || o > maxV) return false;
            return true;
        }
        let t1 = (minV - o) / d;
        let t2 = (maxV - o) / d;
        if (t1 > t2) {
            let tmp = t1;
            t1 = t2;
            t2 = tmp;
        }
        tMin = Math.max(tMin, t1);
        tMax = Math.min(tMax, t2);
        return tMax >= tMin;
    }

    if (!updateSlab(ox, dx, minX, maxX)) return null;
    if (!updateSlab(oy, dy, minY, maxY)) return null;
    if (!updateSlab(oz, dz, minZ, maxZ)) return null;
    if (tMax < 0) return null;
    return (tMin >= 0) ? tMin : tMax;
}

function isPointInsideSolid(wx, wy, wz) {
    if (wy < FLOOR_Y) return false;

    let [cx, cz] = worldToMapCell(wx, wz);
    for (let z = cz - 1; z <= cz + 1; z++) {
        for (let x = cx - 1; x <= cx + 1; x++) {
            if (!isCellInBounds(x, z)) continue;

            let mazeHeight = g_map[z][x];
            if (mazeHeight > 0 && isInsideWallColumn(wx, wz, x, z)) {
                let topY = FLOOR_Y + mazeHeight * BLOCK_SIZE;
                if (wy >= FLOOR_Y && wy <= topY) return true;
            }

            let stoneHeight = getPlayerBlockHeightAtCell(x, z);
            if (stoneHeight > 0 && isInsideStoneColumn(wx, wz, x, z)) {
                let topY = FLOOR_Y + stoneHeight * BLOCK_SIZE;
                if (wy >= FLOOR_Y && wy <= topY) return true;
            }
        }
    }
    return false;
}

function getFirstSolidHitDistance(ray, maxDist = PICK_MAX_DIST) {
    let origin = ray.origin.elements;
    let dir = ray.dir.elements;
    let enteredMap = false;

    for (let t = 0; t <= maxDist; t += PICK_STEP * 0.5) {
        let wx = origin[0] + dir[0] * t;
        let wy = origin[1] + dir[1] * t;
        let wz = origin[2] + dir[2] * t;
        let cell = worldToMapCell(wx, wz);
        if (!isCellInBounds(cell[0], cell[1])) {
            if (enteredMap) break;
            continue;
        }
        enteredMap = true;
        if (isPointInsideSolid(wx, wy, wz)) return t;
    }
    return maxDist;
}

function handleCanvasClick(clientX, clientY) {
    if (!g_gameActive) return;

    let ray = getPickRayFromClientPos(clientX, clientY);
    if (!ray) return;

    let origin = ray.origin.elements;
    let dir = ray.dir.elements;
    let maxSolidT = getFirstSolidHitDistance(ray, PICK_MAX_DIST);
    let bestType = null;
    let bestIndex = -1;
    let bestT = Infinity;
    let slack = PICK_STEP;

    for (let i = 0; i < g_flowers.length; i++) {
        let flower = g_flowers[i];
        if (flower.collected) continue;
        let b = getFlowerBounds(flower);
        let t = rayIntersectAABB(origin, dir, b.minX, b.minY, b.minZ, b.maxX, b.maxY, b.maxZ);
        if (t === null) continue;
        if (t > maxSolidT + slack) continue;
        if (t < bestT) {
            bestT = t;
            bestType = 'flower';
            bestIndex = i;
        }
    }

    let bestGnomeIndex = -1;
    for (let i = 0; i < g_gnomes.length; i++) {
        let g = getGnomeBounds(g_gnomes[i]);
        let t = rayIntersectAABB(origin, dir, g.minX, g.minY, g.minZ, g.maxX, g.maxY, g.maxZ);
        if (t !== null && t <= maxSolidT + slack && t < bestT) {
            bestT = t;
            bestType = 'gnome';
            bestGnomeIndex = i;
        }
    }

    if (bestType === 'flower') {
        collectFlowerAtIndex(bestIndex);
    } else if (bestType === 'gnome') {
        g_gnomesAttackedCount += 1;
        playOneShotAudio(g_gnomeHurtAudio);
        respawnGnomeAtIndex(bestGnomeIndex);
    }
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
    // Mouse / look controls
    canvas.onmousedown = function(ev) {
        g_cursorX = ev.clientX;
        g_cursorY = ev.clientY;
        if (ev.button !== 0) return;
        g_mouseDown = true;
        g_lastX = ev.clientX;
        g_lastY = ev.clientY;
    };

    canvas.onmouseup = function() { g_mouseDown = false; };
    canvas.onmouseleave = function() { g_mouseDown = false; };
    canvas.onmousemove = function(ev) {
        g_cursorX = ev.clientX;
        g_cursorY = ev.clientY;
        if (!g_mouseDown) return;
        let deltaX = ev.clientX - g_lastX;
        let deltaY = ev.clientY - g_lastY;
        g_lastX = ev.clientX;
        g_lastY = ev.clientY;
        g_cameraYaw += deltaX * LOOK_SENSITIVITY;
        g_cameraPitch -= deltaY * LOOK_SENSITIVITY;
        g_cameraPitch = clamp(g_cameraPitch, CAMERA_MIN_PITCH, CAMERA_MAX_PITCH);
        updateCameraDirectionFromAngles();
    };

    canvas.onclick = function(ev) {
        g_cursorX = ev.clientX;
        g_cursorY = ev.clientY;
        handleCanvasClick(ev.clientX, ev.clientY);
    };
}

function ensureAnimatedTextureHost() {
    if (g_animatedTextureHost) return g_animatedTextureHost;
    let host = document.getElementById('animatedTextureHost');
    if (!host) {
        host = document.createElement('div');
        host.id = 'animatedTextureHost';
        host.style.position = 'fixed';
        host.style.left = '-10000px';
        host.style.top = '-10000px';
        host.style.width = '1px';
        host.style.height = '1px';
        host.style.overflow = 'hidden';
        host.style.pointerEvents = 'none';
        host.style.opacity = '0.001';
        document.body.appendChild(host);
    }
    g_animatedTextureHost = host;
    return g_animatedTextureHost;
}

function loadTexture(src, textureUnit, fallbackSrc = null) {
    var image = new Image();    // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    let isAnimated = /\.gif($|\?)/i.test(src);
    if (isAnimated) {
        image.style.position = 'absolute';
        image.style.left = '0';
        image.style.top = '0';
        image.style.width = '1px';
        image.style.height = '1px';
        image.style.pointerEvents = 'none';
    }
    // Register the event handler to be called on loading an image
    image.onload = function() {
        if (isAnimated) {
            let host = ensureAnimatedTextureHost();
            if (host && image.parentElement !== host) {
                host.appendChild(image);
            }
        }
        sendTextureToGLSL(image, textureUnit, isAnimated);
    };
    image.onerror = function() {
        if (fallbackSrc) {
            console.warn('Failed to load texture', src, 'falling back to', fallbackSrc);
            loadTexture(fallbackSrc, textureUnit, null);
        } else {
            console.error('Failed to load texture', src);
        }
    };
    // Tell the browser to load an image
    image.src = src;
}

function initTextures() {
    loadTexture('../resources/sky2.jpg', 0);            // texture 0
    loadTexture('../resources/grass.jpg', 1);           // texture 1
    loadTexture('../resources/wall.jpg', 2, '../resources/brickwall.jpg');    // texture 2
    loadTexture('../resources/stone.jpg', 3, '../resources/brickwall.jpg');   // texture 3
    loadTexture('../resources/lavender.gif', 4, '../resources/stone.jpg');     // texture 4
    loadTexture('../resources/gnome.gif', 5, '../resources/lavender.gif');      // texture 5

    return true;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function nearestPowerOf2(value) {
    return Math.max(1, Math.pow(2, Math.round(Math.log(value) / Math.log(2))));
}

function getTextureUploadSource(image, textureUnit = null) {
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        return image;
    }

    let potWidth = nearestPowerOf2(image.width);
    let potHeight = nearestPowerOf2(image.height);
    let potCanvas = null;
    if (textureUnit !== null) {
        potCanvas = g_texturePOTCanvas[textureUnit];
        if (!potCanvas || potCanvas.width !== potWidth || potCanvas.height !== potHeight) {
            potCanvas = document.createElement('canvas');
            potCanvas.width = potWidth;
            potCanvas.height = potHeight;
            g_texturePOTCanvas[textureUnit] = potCanvas;
        }
    } else {
        potCanvas = document.createElement('canvas');
        potCanvas.width = potWidth;
        potCanvas.height = potHeight;
    }

    let ctx = potCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, 0, 0, potWidth, potHeight);
    return potCanvas;
}

function applyTextureParameters(texture, isPOT) {
    if (isPOT) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    let ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext && isPOT) {
        let max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
    }
}

function sendTextureToGLSL(image, textureUnit, isAnimated = false) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload image
    let uploadSource = isAnimated ? image : getTextureUploadSource(image, textureUnit);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, uploadSource);

    let isPOT = !isAnimated && isPowerOf2(uploadSource.width) && isPowerOf2(uploadSource.height);
    applyTextureParameters(texture, isPOT);

    // Link sampler
    if (textureUnit === 0) {
        gl.uniform1i(u_Sampler0, 0);
    } else if (textureUnit === 1) {
        gl.uniform1i(u_Sampler1, 1);
    } else if (textureUnit === 2) {
        gl.uniform1i(u_Sampler2, 2);
    } else if (textureUnit === 3) {
        gl.uniform1i(u_Sampler3, 3);
    } else if (textureUnit === 4) {
        gl.uniform1i(u_Sampler4, 4);
    } else if (textureUnit === 5) {
        gl.uniform1i(u_Sampler5, 5);
    }

    g_textureSlots[textureUnit] = {
        texture: texture,
        image: image,
        isAnimated: isAnimated,
        isPOT: isPOT
    };

    console.log("Finished loadTexture", textureUnit);
}

function refreshAnimatedTextures() {
    for (let unitKey in g_textureSlots) {
        if (!Object.prototype.hasOwnProperty.call(g_textureSlots, unitKey)) continue;
        let textureUnit = Number(unitKey);
        let slot = g_textureSlots[textureUnit];
        if (!slot || !slot.isAnimated || !slot.image || !slot.texture) continue;

        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, slot.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        let uploadSource = slot.image;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, uploadSource);
        slot.isPOT = false;
        applyTextureParameters(slot.texture, slot.isPOT);
    }
}

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    document.onkeydown = keydown;
    document.onkeyup = keyup;
    g_camera = new Camera();
    syncCameraAnglesFromView();
    updateCameraDirectionFromAngles();

    g_gameStartTime = performance.now() / 1000.0;
    g_elapsedTimeSeconds = 0;
    g_timePenaltySeconds = 0;
    g_gameActive = false;
    g_gameStarted = false;
    g_captureCount = 0;
    g_gnomesAttackedCount = 0;
    g_blocksPlacedCount = 0;

    setupFlowerCounterUI();
    setupVolumeUI();
    setupCompassUI();
    setupMiniMapUI();
    setupGiveUpButtonUI();
    setupTimerUI();
    setupNoticeUI();
    setupGameCompleteUI();
    setupStartScreenUI();
    setupHelpOverlayUI();
    initMap();
    initTextures();
    initAudio();
    updateFlowerCounterUI();
    updateCompassUI();
    updateMiniMapUI();
    updateStartScreenGnomeCountUI();
    updateTimerUI();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.6, 0.6, 0.8, 1.0);

    g_lastFrameTime = performance.now() / 1000.0;

    // Render
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
    // Print some debug information so we know we are running
    let now = performance.now() / 1000.0;
    let deltaTime = now - g_lastFrameTime;
    g_lastFrameTime = now;
    g_seconds = now - g_startTime;

    if (g_gameActive) {
        updateMovement(deltaTime);
        updateGnomes(deltaTime);
        checkGnomeCatches();
        updateGnomeLaughVolumes();
        g_elapsedTimeSeconds = (now - g_gameStartTime) + g_timePenaltySeconds;
    }

    updateTimerUI();
    updateCompassUI();
    updateMiniMapUI();
    refreshAnimatedTextures();
    positionFlowerCounterUI();
    positionVolumeUI();
    positionCompassUI();
    positionMiniMapUI();
    positionGiveUpButtonUI();
    positionTimerUI();
    positionNoticeUI();
    positionGameCompleteUI();
    positionStartScreenUI();
    positionHelpOverlayUI();

    // Draw everything
    renderAllShapes();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

function setupFlowerCounterUI() {
    let counter = document.getElementById('flowerCounter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'flowerCounter';
        counter.style.position = 'fixed';
        counter.style.transform = 'translateX(-100%)';
        counter.style.zIndex = '20';
        counter.style.padding = '8px 12px';
        counter.style.borderRadius = '6px';
        counter.style.background = 'rgba(0,0,0,0.55)';
        counter.style.color = '#ffffff';
        counter.style.fontFamily = GAME_UI_FONT;
        counter.style.fontSize = '16px';
        counter.style.lineHeight = '1.2';
        counter.style.pointerEvents = 'none';
        document.body.appendChild(counter);
        window.addEventListener('resize', positionFlowerCounterUI);
        window.addEventListener('scroll', positionFlowerCounterUI, true);
    }
    positionFlowerCounterUI();
}

function positionFlowerCounterUI() {
    let counter = document.getElementById('flowerCounter');
    if (!counter || !canvas) return;
    let rect = canvas.getBoundingClientRect();
    counter.style.left = Math.max(0, rect.right - 12) + 'px';
    counter.style.top = Math.max(0, rect.top + 12) + 'px';
}

function updateFlowerCounterUI() {
    let counter = document.getElementById('flowerCounter');
    if (!counter) return;
    counter.textContent = '🪻' + g_collectedFlowers + '/' + FLOWER_TARGET + ' flowers collected';
    counter.style.color = '#ffa9e2';
}

function setupVolumeUI() {
    let panel = document.getElementById('volumePanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'volumePanel';
        panel.style.position = 'fixed';
        panel.style.zIndex = '22';
        panel.style.padding = '8px 10px';
        panel.style.borderRadius = '6px';
        panel.style.background = 'rgba(0,0,0,0.55)';
        panel.style.color = '#ffffff';
        panel.style.fontFamily = GAME_UI_FONT;
        panel.style.fontSize = '11px';
        panel.style.lineHeight = '1.2';
        panel.style.pointerEvents = 'auto';
        panel.style.userSelect = 'none';

        let label = document.createElement('div');
        label.textContent = '🔊Volume:';
        label.style.marginBottom = '6px';
        panel.appendChild(label);

        let row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';

        let slider = document.createElement('input');
        slider.type = 'range';
        slider.id = 'masterVolumeSlider';
        slider.min = '0';
        slider.max = '100';
        slider.step = '1';
        slider.value = String(Math.round(g_masterVolume * 100));
        slider.style.width = '120px';
        slider.style.cursor = 'pointer';
        slider.addEventListener('input', function() {
            let next = Number(slider.value) / 100;
            setMasterVolume(next);
        });
        row.appendChild(slider);

        let readout = document.createElement('span');
        readout.id = 'masterVolumeReadout';
        readout.textContent = Math.round(g_masterVolume * 100) + '%';
        readout.style.minWidth = '34px';
        readout.style.textAlign = 'right';
        row.appendChild(readout);

        panel.appendChild(row);
        document.body.appendChild(panel);
        window.addEventListener('resize', positionVolumeUI);
        window.addEventListener('scroll', positionVolumeUI, true);
    }
    setMasterVolume(g_masterVolume);
    positionVolumeUI();
}

function positionVolumeUI() {
    let panel = document.getElementById('volumePanel');
    if (!panel || !canvas) return;
    let rect = canvas.getBoundingClientRect();
    let panelRect = panel.getBoundingClientRect();
    panel.style.left = Math.max(0, rect.left + 12) + 'px';
    panel.style.top = Math.max(0, rect.bottom - panelRect.height - 12) + 'px';
}

function setupCompassUI() {
    let compass = document.getElementById('compassReadout');
    if (!compass) {
        compass = document.createElement('div');
        compass.id = 'compassReadout';
        compass.style.position = 'fixed';
        compass.style.transform = 'translateX(-100%)';
        compass.style.zIndex = '20';
        compass.style.padding = '7px 10px';
        compass.style.borderRadius = '6px';
        compass.style.background = 'rgba(0,0,0,0.5)';
        compass.style.color = '#d8f3ff';
        compass.style.fontFamily = GAME_UI_FONT;
        compass.style.fontSize = '12px';
        compass.style.lineHeight = '1.35';
        compass.style.whiteSpace = 'nowrap';
        compass.style.pointerEvents = 'none';
        document.body.appendChild(compass);
        window.addEventListener('resize', positionCompassUI);
        window.addEventListener('scroll', positionCompassUI, true);
    }
    positionCompassUI();
}

function positionCompassUI() {
    let compass = document.getElementById('compassReadout');
    let counter = document.getElementById('flowerCounter');
    if (!compass || !counter || !canvas) return;
    let rect = canvas.getBoundingClientRect();
    let counterRect = counter.getBoundingClientRect();
    compass.style.left = Math.max(0, rect.right - 12) + 'px';
    compass.style.top = Math.max(0, rect.top + 12 + counterRect.height + 8) + 'px';
}

function findNearestCompassTarget(targets) {
    if (!g_camera || !targets || targets.length === 0) return null;

    let playerCell = worldToMapCell(g_camera.eye.elements[0], g_camera.eye.elements[2]);
    let best = null;
    let bestDistSq = Infinity;

    for (let i = 0; i < targets.length; i++) {
        let tx = targets[i][0];
        let tz = targets[i][1];
        let dx = tx - playerCell[0];
        let dz = tz - playerCell[1];
        let distSq = dx * dx + dz * dz;
        if (distSq < bestDistSq) {
            bestDistSq = distSq;
            best = { dx: dx, dy: -dz };
        }
    }
    return best;
}

function getNearestFlowerOffset() {
    let flowerTargets = [];
    for (let i = 0; i < g_flowers.length; i++) {
        let flower = g_flowers[i];
        if (flower.collected) continue;
        flowerTargets.push([flower.x, flower.z]);
    }
    return findNearestCompassTarget(flowerTargets);
}

function getNearestGnomeOffset() {
    let gnomeTargets = [];
    for (let i = 0; i < g_gnomes.length; i++) {
        let gnomeCell = worldToMapCell(g_gnomes[i].x, g_gnomes[i].z);
        gnomeTargets.push([gnomeCell[0], gnomeCell[1]]);
    }
    return findNearestCompassTarget(gnomeTargets);
}

function updateCompassUI() {
    let compass = document.getElementById('compassReadout');
    if (!compass) return;

    let flowerOffset = getNearestFlowerOffset();
    let gnomeOffset = getNearestGnomeOffset();
    let flowerText = flowerOffset
        ? ('Nearest flower: x = ' + flowerOffset.dx + ', y = ' + flowerOffset.dy)
        : 'Nearest flower: x = --, y = --';
    let gnomeText = gnomeOffset
        ? ('Nearest gnome: x = ' + gnomeOffset.dx + ', y = ' + gnomeOffset.dy)
        : 'Nearest gnome: x = --, y = --';

    compass.innerHTML = flowerText + '<br>' + gnomeText;
}

function createMiniMapImage(primarySrc, fallbackSrc = null) {
    let image = new Image();
    let didFallback = false;
    image.onerror = function() {
        if (!didFallback && fallbackSrc) {
            didFallback = true;
            image.src = fallbackSrc;
        }
    };
    image.src = primarySrc;
    return image;
}

function ensureMiniMapImages() {
    if (!g_miniMapWallImage) {
        g_miniMapWallImage = createMiniMapImage('../resources/wall.jpg', '../resources/brickwall.jpg');
    }
    if (!g_miniMapStoneImage) {
        g_miniMapStoneImage = createMiniMapImage('../resources/stone.jpg', '../resources/brickwall.jpg');
    }
}

function setupMiniMapUI() {
    let miniMap = document.getElementById('miniMapCanvas');
    if (!miniMap) {
        miniMap = document.createElement('canvas');
        miniMap.id = 'miniMapCanvas';
        miniMap.width = MINIMAP_SIZE_PX;
        miniMap.height = MINIMAP_SIZE_PX;
        miniMap.style.position = 'fixed';
        miniMap.style.transform = 'translateX(-100%)';
        miniMap.style.zIndex = '20';
        miniMap.style.borderRadius = '6px';
        miniMap.style.border = '1px solid rgba(255,255,255,0.25)';
        miniMap.style.background = 'rgba(0,0,0,0.55)';
        miniMap.style.pointerEvents = 'none';
        miniMap.style.imageRendering = 'pixelated';
        document.body.appendChild(miniMap);
        window.addEventListener('resize', positionMiniMapUI);
        window.addEventListener('scroll', positionMiniMapUI, true);
    }
    ensureMiniMapImages();
    positionMiniMapUI();
}

function positionMiniMapUI() {
    let miniMap = document.getElementById('miniMapCanvas');
    let compass = document.getElementById('compassReadout');
    let counter = document.getElementById('flowerCounter');
    if (!miniMap || !canvas) return;

    if (!g_gameActive) {
        miniMap.style.display = 'none';
        return;
    }

    let rect = canvas.getBoundingClientRect();
    let top = rect.top + 12;
    if (compass) {
        let compassRect = compass.getBoundingClientRect();
        top = compassRect.bottom + 8;
    } else if (counter) {
        let counterRect = counter.getBoundingClientRect();
        top = counterRect.bottom + 8;
    }

    miniMap.style.display = 'block';
    miniMap.style.left = Math.max(0, rect.right - 12) + 'px';
    miniMap.style.top = Math.max(0, top) + 'px';
}

function drawMiniMapTexturedCell(ctx, image, x, y, size, fallbackColor) {
    if (image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
        ctx.drawImage(image, x, y, size, size);
    } else {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, size, size);
    }
}

function drawMiniMapMarkerByCell(ctx, startX, startY, cellSize, x, z, color, sizeRatio) {
    if (!isCellInBounds(x, z)) return;
    let diameter = Math.max(6, Math.floor(cellSize * sizeRatio));
    let centerX = startX + x * cellSize + cellSize * 0.5;
    let centerY = startY + z * cellSize + cellSize * 0.5;
    let radius = diameter * 0.5;

    // Use circular markers instead of flat square blocks.
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.stroke();
}

function updateMiniMapUI() {
    let miniMap = document.getElementById('miniMapCanvas');
    if (!miniMap || !g_map || g_map.length === 0 || g_map[0].length === 0) return;
    let ctx = miniMap.getContext('2d');
    if (!ctx) return;

    ensureMiniMapImages();

    let width = miniMap.width;
    let height = miniMap.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, width, height);

    let rows = g_map.length;
    let cols = g_map[0].length;
    let cellSize = Math.max(
        2,
        Math.floor(
            Math.min(
                (width - MINIMAP_CELL_PADDING_PX * 2) / cols,
                (height - MINIMAP_CELL_PADDING_PX * 2) / rows
            )
        )
    );
    let drawWidth = cellSize * cols;
    let drawHeight = cellSize * rows;
    let startX = Math.floor((width - drawWidth) * 0.5);
    let startY = Math.floor((height - drawHeight) * 0.5);

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(startX, startY, drawWidth, drawHeight);

    for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
            let px = startX + x * cellSize;
            let py = startY + z * cellSize;
            if (g_map[z][x] > 0) {
                drawMiniMapTexturedCell(ctx, g_miniMapWallImage, px, py, cellSize, '#7f6046');
            } else if (getPlayerBlockHeightAtCell(x, z) > 0) {
                drawMiniMapTexturedCell(ctx, g_miniMapStoneImage, px, py, cellSize, '#8f98a4');
            }
        }
    }

    for (let i = 0; i < g_flowers.length; i++) {
        if (g_flowers[i].collected) continue;
        drawMiniMapMarkerByCell(ctx, startX, startY, cellSize, g_flowers[i].x, g_flowers[i].z, '#b15cff', MINIMAP_MARKER_FLOWER_RATIO);
    }

    for (let i = 0; i < g_gnomes.length; i++) {
        let gnomeCell = worldToMapCell(g_gnomes[i].x, g_gnomes[i].z);
        drawMiniMapMarkerByCell(ctx, startX, startY, cellSize, gnomeCell[0], gnomeCell[1], '#38d46d', MINIMAP_MARKER_GNOME_RATIO);
    }

    if (g_camera) {
        let playerCell = worldToMapCell(g_camera.eye.elements[0], g_camera.eye.elements[2]);
        drawMiniMapMarkerByCell(ctx, startX, startY, cellSize, playerCell[0], playerCell[1], '#ffffff', MINIMAP_MARKER_PLAYER_RATIO);
    }
}

function setupGiveUpButtonUI() {
    let button = document.getElementById('giveUpButton');
    if (!button) {
        button = document.createElement('button');
        button.id = 'giveUpButton';
        button.textContent = 'Give up?';
        button.style.position = 'fixed';
        button.style.transform = 'translateX(-100%)';
        button.style.zIndex = '21';
        button.style.padding = '6px 10px';
        button.style.borderRadius = '6px';
        button.style.border = '1px solid rgba(255,255,255,0.35)';
        button.style.background = 'rgba(0,0,0,0.6)';
        button.style.color = '#ffe6e6';
        button.style.fontFamily = GAME_UI_FONT;
        button.style.fontSize = '12px';
        button.style.cursor = 'pointer';
        button.style.display = 'none';
        button.addEventListener('click', function(ev) {
            ev.preventDefault();
            giveUpCurrentRun();
        });
        document.body.appendChild(button);
        window.addEventListener('resize', positionGiveUpButtonUI);
        window.addEventListener('scroll', positionGiveUpButtonUI, true);
    }
    positionGiveUpButtonUI();
}

function positionGiveUpButtonUI() {
    let button = document.getElementById('giveUpButton');
    let counter = document.getElementById('flowerCounter');
    let compass = document.getElementById('compassReadout');
    let miniMap = document.getElementById('miniMapCanvas');
    if (!button || !counter || !canvas) return;

    if (!g_gameActive) {
        button.style.display = 'none';
        return;
    }

    let rect = canvas.getBoundingClientRect();
    let counterRect = counter.getBoundingClientRect();
    let compassHeight = 0;
    if (compass) {
        let compassRect = compass.getBoundingClientRect();
        compassHeight = compassRect.height + 8;
    }
    let miniMapHeight = 0;
    if (miniMap && miniMap.style.display !== 'none') {
        let miniMapRect = miniMap.getBoundingClientRect();
        miniMapHeight = miniMapRect.height + 8;
    }
    button.style.display = 'block';
    button.style.left = Math.max(0, rect.right - 12) + 'px';
    button.style.top = Math.max(0, rect.top + 12 + counterRect.height + 8 + compassHeight + miniMapHeight) + 'px';
}

function setupTimerUI() {
    let timer = document.getElementById('gameTimer');
    if (!timer) {
        timer = document.createElement('div');
        timer.id = 'gameTimer';
        timer.style.position = 'fixed';
        timer.style.zIndex = '20';
        timer.style.padding = '8px 12px';
        timer.style.borderRadius = '6px';
        timer.style.background = 'rgba(0,0,0,0.55)';
        timer.style.color = '#ffffff';
        timer.style.fontFamily = GAME_UI_FONT;
        timer.style.fontSize = '16px';
        timer.style.lineHeight = '1.2';
        timer.style.pointerEvents = 'none';
        document.body.appendChild(timer);
        window.addEventListener('resize', positionTimerUI);
        window.addEventListener('scroll', positionTimerUI, true);
    }
    positionTimerUI();
}

function positionTimerUI() {
    let timer = document.getElementById('gameTimer');
    if (!timer || !canvas) return;
    let rect = canvas.getBoundingClientRect();
    timer.style.left = Math.max(0, rect.left + 12) + 'px';
    timer.style.top = Math.max(0, rect.top + 12) + 'px';
}

function formatSeconds(totalSeconds) {
    let clamped = Math.max(0, totalSeconds);
    let minutes = Math.floor(clamped / 60);
    let seconds = clamped - minutes * 60;
    let wholeSeconds = Math.floor(seconds);
    let tenths = Math.floor((seconds - wholeSeconds) * 10);
    return String(minutes).padStart(2, '0') + ':' + String(wholeSeconds).padStart(2, '0') + '.' + tenths;
}

function updateTimerUI() {
    let timer = document.getElementById('gameTimer');
    if (!timer) return;
    timer.textContent = '⏰Time: ' + formatSeconds(g_elapsedTimeSeconds);
}

function setupNoticeUI() {
    let notice = document.getElementById('gameNotice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'gameNotice';
        notice.style.position = 'fixed';
        notice.style.zIndex = '25';
        notice.style.maxWidth = '420px';
        notice.style.padding = '10px 12px';
        notice.style.borderRadius = '6px';
        notice.style.background = 'rgba(30,30,30,0.85)';
        notice.style.color = '#ffffff';
        notice.style.fontFamily = GAME_UI_FONT;
        notice.style.fontSize = '15px';
        notice.style.lineHeight = '1.35';
        notice.style.pointerEvents = 'none';
        notice.style.display = 'none';
        document.body.appendChild(notice);
        window.addEventListener('resize', positionNoticeUI);
        window.addEventListener('scroll', positionNoticeUI, true);
    }
    positionNoticeUI();
}

function positionNoticeUI() {
    let notice = document.getElementById('gameNotice');
    if (!notice || !canvas) return;
    let rect = canvas.getBoundingClientRect();
    notice.style.left = Math.max(0, rect.left + 12) + 'px';
    notice.style.top = Math.max(0, rect.top + 70) + 'px';
}

function showNotice(message, durationMs = 7000) {
    let notice = document.getElementById('gameNotice');
    if (!notice) return;
    notice.textContent = message;
    notice.style.display = 'block';
    positionNoticeUI();

    if (g_noticeClearHandle !== null) {
        clearTimeout(g_noticeClearHandle);
    }
    g_noticeClearHandle = setTimeout(function() {
        notice.style.display = 'none';
        g_noticeClearHandle = null;
    }, durationMs);
}

function setupGameCompleteUI() {
    let panel = document.getElementById('gameCompleteOverlay');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'gameCompleteOverlay';
        panel.style.position = 'fixed';
        panel.style.zIndex = '30';
        panel.style.padding = '16px 20px';
        panel.style.borderRadius = '8px';
        panel.style.background = 'rgba(20,20,20,0.9)';
        panel.style.color = '#ffffff';
        panel.style.fontFamily = GAME_UI_FONT;
        panel.style.fontSize = '20px';
        panel.style.lineHeight = '1.35';
        panel.style.textAlign = 'center';
        panel.style.pointerEvents = 'auto';
        panel.style.display = 'none';
        panel.textContent = 'You have collected all eight flowers! Good job!😸';
        document.body.appendChild(panel);
        window.addEventListener('resize', positionGameCompleteUI);
        window.addEventListener('scroll', positionGameCompleteUI, true);
    }
    positionGameCompleteUI();
}

function positionGameCompleteUI() {
    let panel = document.getElementById('gameCompleteOverlay');
    if (!panel || !canvas) return;
    let rect = canvas.getBoundingClientRect();
    panel.style.left = (rect.left + rect.width * 0.5) + 'px';
    panel.style.top = (rect.top + rect.height * 0.5) + 'px';
    panel.style.transform = 'translate(-50%, -50%)';
}

function showGameCompletePanel(titleText) {
    let panel = document.getElementById('gameCompleteOverlay');
    if (!panel) return;

    panel.innerHTML =
        titleText +
        '<div style="margin-top:10px; font-size:15px; line-height:1.5; text-align:left;">' +
        'Flowers collected: ' + g_collectedFlowers + '<br>' +
        'Garden gnome chasers: ' + g_gnomeCount + '<br>' +
        'Time: ' + formatSeconds(g_elapsedTimeSeconds) + '<br>' +
        'Attacked count: ' + g_captureCount + '<br>' +
        'Attack count: ' + g_gnomesAttackedCount + '<br>' +
        'Blocks placed: ' + g_blocksPlacedCount +
        '</div>' +
        '<button id="playAgainButton" style="margin-top:14px; padding:8px 12px; font-family:' + GAME_UI_FONT + '; cursor:pointer;">Play again?</button>';
    panel.style.display = 'block';
    positionGameCompleteUI();

    let playAgainButton = document.getElementById('playAgainButton');
    if (playAgainButton) {
        playAgainButton.onclick = function(ev) {
            ev.preventDefault();
            returnToStartScreen();
        };
    }
}

function finishGameIfComplete() {
    if (!g_gameActive) return;
    if (g_collectedFlowers < FLOWER_TARGET) return;
    g_gameActive = false;
    stopLoopingGameAudio();
    playOneShotAudio(g_hoorayAudio);
    showGameCompletePanel('You have collected all eight flowers! Good job!😸');
}

function setupStartScreenUI() {
    let overlay = document.getElementById('gameStartOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gameStartOverlay';
        overlay.style.position = 'fixed';
        overlay.style.zIndex = '40';
        overlay.style.padding = '18px 20px';
        overlay.style.borderRadius = '10px';
        overlay.style.background = 'rgba(18,18,20,0.9)';
        overlay.style.color = '#ffffff';
        overlay.style.textAlign = 'center';
        overlay.style.fontFamily = GAME_UI_FONT;
        overlay.style.fontSize = '14px';
        overlay.style.lineHeight = '1.5';
        overlay.style.pointerEvents = 'auto';
        overlay.style.minWidth = '330px';

        let title = document.createElement('div');
        title.textContent = 'Gnome Way Out?';
        title.style.fontSize = '20px';
        overlay.appendChild(title);

        let subtitle = document.createElement('div');
        subtitle.textContent = 'Turn on your volume!';
        subtitle.style.color = '#ffa527';
        subtitle.style.fontSize = '12px';
        subtitle.style.opacity = '0.8';
        subtitle.style.marginBottom = '10px';
        overlay.appendChild(subtitle);

        let row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'center';
        row.style.gap = '8px';
        row.style.marginBottom = '14px';

        let label = document.createElement('span');
        label.id = 'startGnomeCountLabel';
        label.style.minWidth = '136px';
        label.style.textAlign = 'center';
        row.appendChild(label);

        let minusBtn = document.createElement('button');
        minusBtn.textContent = '-';
        minusBtn.style.width = '30px';
        minusBtn.style.height = '28px';
        minusBtn.style.fontFamily = GAME_UI_FONT;
        minusBtn.style.cursor = 'pointer';
        minusBtn.addEventListener('click', function() {
            if (g_gameStarted) return;
            setGnomeCount(g_gnomeCount - 1);
            updateStartScreenGnomeCountUI();
        });
        row.appendChild(minusBtn);

        let plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.style.width = '30px';
        plusBtn.style.height = '28px';
        plusBtn.style.fontFamily = GAME_UI_FONT;
        plusBtn.style.cursor = 'pointer';
        plusBtn.addEventListener('click', function() {
            if (g_gameStarted) return;
            setGnomeCount(g_gnomeCount + 1);
            updateStartScreenGnomeCountUI();
        });
        row.appendChild(plusBtn);

        overlay.appendChild(row);

        let btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.justifyContent = 'center';
        btnRow.style.gap = '10px';

        let startBtn = document.createElement('button');
        startBtn.id = 'startGameButton';
        startBtn.textContent = 'Start game';
        startBtn.style.padding = '8px 12px';
        startBtn.style.fontFamily = GAME_UI_FONT;
        startBtn.style.cursor = 'pointer';
        startBtn.addEventListener('click', startGame);
        btnRow.appendChild(startBtn);

        let helpBtn = document.createElement('button');
        helpBtn.id = 'startHelpButton';
        helpBtn.textContent = 'Need help?';
        helpBtn.style.padding = '8px 12px';
        helpBtn.style.fontFamily = GAME_UI_FONT;
        helpBtn.style.cursor = 'pointer';
        helpBtn.addEventListener('click', function() {
            showHelpOverlay();
        });
        btnRow.appendChild(helpBtn);

        overlay.appendChild(btnRow);
        document.body.appendChild(overlay);
        window.addEventListener('resize', positionStartScreenUI);
        window.addEventListener('scroll', positionStartScreenUI, true);
    }
    positionStartScreenUI();
}

function positionStartScreenUI() {
    let overlay = document.getElementById('gameStartOverlay');
    if (!overlay || !canvas) return;
    if (g_gameStarted) {
        overlay.style.display = 'none';
        return;
    }
    overlay.style.display = 'block';
    let rect = canvas.getBoundingClientRect();
    overlay.style.left = (rect.left + rect.width * 0.5) + 'px';
    overlay.style.top = (rect.top + rect.height * 0.5) + 'px';
    overlay.style.transform = 'translate(-50%, -50%)';
}

function updateStartScreenGnomeCountUI() {
    let label = document.getElementById('startGnomeCountLabel');
    if (label) label.textContent = 'Gnomes: ' + g_gnomeCount;
}

function setupHelpOverlayUI() {
    let help = document.getElementById('helpOverlay');
    if (!help) {
        help = document.createElement('div');
        help.id = 'helpOverlay';
        help.style.position = 'fixed';
        help.style.zIndex = '41';
        help.style.padding = '16px 18px';
        help.style.borderRadius = '8px';
        help.style.background = 'rgba(20,20,24,0.94)';
        help.style.color = '#ffffff';
        help.style.fontFamily = GAME_UI_FONT;
        help.style.fontSize = '14px';
        help.style.lineHeight = '1.5';
        help.style.pointerEvents = 'auto';
        help.style.minWidth = '260px';
        help.style.maxWidth = '420px';
        help.style.display = 'none';

        let title = document.createElement('div');
        title.textContent = '📋Rules';
        title.style.fontSize = '18px';
        title.style.marginBottom = '8px';
        help.appendChild(title);

        let body = document.createElement('div');
        body.textContent = 'Collect all eight flowers to win! But beware of the garden gnomes who will steal your flowers... '
                         + 'Click flowers to collect them. Use WASD to move, Q/E to rotate the camera, and F/G to add or remove stone blocks. '
                         + 'While stone blocks may be useful for defending, they disappear each time you collect a flower. '
                         + 'When encountering a garden gnome, click on them to attack. '
                         + 'If a garden gnome successfully attacks you, you will respawn somewhere else in the maze and lose one flower. '
                         + 'If you have no flowers when a garden gnome attacks you, your time will increase by ten seconds. '
                         + 'Garden gnomes always respawn—but don\'t worry, you\'ll always hear them when they are nearby. '
                         + 'If you need a break, retreat to the safe zone at spawn or create a stone barrier around yourself. Good luck! '
                         + '(Fun fact: the maze is randomized each play, so you\'ll never know what you\'ll get!)';
        body.style.marginBottom = '10px';
        help.appendChild(body);

        let closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.padding = '6px 10px';
        closeBtn.style.fontFamily = GAME_UI_FONT;
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', hideHelpOverlay);
        help.appendChild(closeBtn);

        document.body.appendChild(help);
        window.addEventListener('resize', positionHelpOverlayUI);
        window.addEventListener('scroll', positionHelpOverlayUI, true);
    }
    positionHelpOverlayUI();
}

function positionHelpOverlayUI() {
    let help = document.getElementById('helpOverlay');
    if (!help || !canvas) return;
    let rect = canvas.getBoundingClientRect();
    help.style.left = (rect.left + rect.width * 0.5) + 'px';
    help.style.top = (rect.top + rect.height * 0.5) + 'px';
    help.style.transform = 'translate(-50%, -50%)';
}

function showHelpOverlay() {
    let help = document.getElementById('helpOverlay');
    if (!help) return;
    help.style.display = 'block';
    positionHelpOverlayUI();
}

function hideHelpOverlay() {
    let help = document.getElementById('helpOverlay');
    if (!help) return;
    help.style.display = 'none';
}

function returnToStartScreen() {
    g_gameActive = false;
    g_gameStarted = false;
    stopLoopingGameAudio();
    hideHelpOverlay();

    let panel = document.getElementById('gameCompleteOverlay');
    if (panel) panel.style.display = 'none';

    g_collectedFlowers = 0;
    g_elapsedTimeSeconds = 0;
    g_timePenaltySeconds = 0;
    g_captureCount = 0;
    g_gnomesAttackedCount = 0;
    g_blocksPlacedCount = 0;
    generateFlowers(FLOWER_TARGET);
    updateFlowerCounterUI();
    updateTimerUI();

    clearPlayerBlocks();
    g_gnomes = [];
    setGnomeCount(g_gnomeCount);
    respawnPlayerAtSpawn();
    positionStartScreenUI();
    positionMiniMapUI();
    positionGiveUpButtonUI();
}

function restartGame() {
    g_gameActive = true;
    g_gameStarted = true;
    hideHelpOverlay();
    positionStartScreenUI();

    g_gameStartTime = performance.now() / 1000.0;
    g_elapsedTimeSeconds = 0;
    g_timePenaltySeconds = 0;
    g_captureCount = 0;
    g_gnomesAttackedCount = 0;
    g_blocksPlacedCount = 0;
    updateTimerUI();

    let panel = document.getElementById('gameCompleteOverlay');
    if (panel) panel.style.display = 'none';

    g_collectedFlowers = 0;
    generateFlowers(FLOWER_TARGET);
    clearPlayerBlocks();
    g_gnomes = [];
    setGnomeCount(g_gnomeCount);
    respawnPlayerAtSpawn();
    positionMiniMapUI();
    startLoopingGameAudio();
}

function startGame() {
    if (g_gameActive) return;
    restartGame();
}

function giveUpCurrentRun() {
    if (!g_gameActive) return;
    let now = performance.now() / 1000.0;
    g_elapsedTimeSeconds = (now - g_gameStartTime) + g_timePenaltySeconds;
    g_gameActive = false;
    stopLoopingGameAudio();
    playOneShotAudio(g_wompAudio);
    showGameCompletePanel('You gave up this round.😿');
}

function tryMoveCamera(moveX, moveZ) {
    keepCameraAboveGround();
    let eye = g_camera.eye.elements;
    let nextEyeY = eye[1];
    let moved = false;

    // Resolve X and Z separately so movement slides along walls smoothly.
    let nextEyeX = eye[0] + moveX;
    if (canOccupy(nextEyeX, nextEyeY, eye[2])) {
        eye[0] = nextEyeX;
        moved = true;
    }

    let nextEyeZ = eye[2] + moveZ;
    if (canOccupy(eye[0], nextEyeY, nextEyeZ)) {
        eye[2] = nextEyeZ;
        moved = true;
    }

    if (moved) {
        updateCameraDirectionFromAngles();
    }
}

function updateMovement(deltaTime) {
    if (!g_camera || deltaTime <= 0) return;

    let dt = Math.min(deltaTime, 0.05);
    let turnInput = 0;
    if (g_keys['q']) turnInput -= 1;
    if (g_keys['e']) turnInput += 1;
    if (turnInput !== 0) {
        g_cameraYaw += turnInput * TURN_SPEED_DEG_PER_SEC * dt;
        updateCameraDirectionFromAngles();
    }

    let moveForward = 0;
    let moveRight = 0;
    if (g_keys['w']) moveForward += 1;
    if (g_keys['s']) moveForward -= 1;
    if (g_keys['d']) moveRight += 1;
    if (g_keys['a']) moveRight -= 1;

    if (moveForward !== 0 || moveRight !== 0) {
        let yawRad = g_cameraYaw * Math.PI / 180;
        let forwardX = Math.cos(yawRad);
        let forwardZ = Math.sin(yawRad);
        let rightX = -forwardZ;
        let rightZ = forwardX;

        let moveX = forwardX * moveForward + rightX * moveRight;
        let moveZ = forwardZ * moveForward + rightZ * moveRight;
        let moveLen = Math.hypot(moveX, moveZ);
        if (moveLen > 1e-6) {
            let speed = MOVE_SPEED_PER_SEC * dt / moveLen;
            tryMoveCamera(moveX * speed, moveZ * speed);
        }
    }

    let verticalInput = 0;
    // if (g_keys['z']) verticalInput += 1;
    // if (g_keys['x']) verticalInput -= 1;
    if (verticalInput !== 0) {
        g_camera.eye.elements[1] += verticalInput * VERTICAL_SPEED_PER_SEC * dt;
        keepCameraAboveGround();
        updateCameraDirectionFromAngles();
    }
}

function keyup(ev) {
    let key = ev.key.toLowerCase();
    g_keys[key] = false;
    if ('wasdqezxfg'.includes(key)) ev.preventDefault();
}

function keydown(ev) {
    let key = ev.key.toLowerCase();
    g_keys[key] = true;
    if ('wasdqezxfg'.includes(key)) ev.preventDefault();

    if (key === 'f' && !ev.repeat) {
        addBlock();
    } else if (key === 'g' && !ev.repeat) {
        removeBlock();
    }
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

let g_mapBatches = [];
let g_playerBlocks = [];
let g_mazeInitialized = false;
let g_identityModelMatrix = new Matrix4();

const UNIT_CUBE_VERTICES = [
    // Front
    0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
    0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0,
    // Top
    0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0,
    0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0,
    // Bottom
    0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0,
    1.0, 0.0, 1.0,   0.0, 0.0, 1.0,   1.0, 0.0, 0.0,
    // Left
    0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 1.0,
    // Right
    1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0,
    1.0, 1.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0,
    0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0
];

const UNIT_CUBE_UVS = [
    // Front
    0.0, 0.0,   1.0, 1.0,   1.0, 0.0,
    0.0, 0.0,   0.0, 1.0,   1.0, 1.0,
    // Top
    0.0, 0.0,   0.0, 1.0,   1.0, 1.0,
    0.0, 0.0,   1.0, 1.0,   1.0, 0.0,
    // Bottom
    0.0, 0.0,   0.0, 1.0,   1.0, 0.0,
    1.0, 1.0,   0.0, 1.0,   1.0, 0.0,
    // Left
    0.0, 0.0,   1.0, 0.0,   0.0, 1.0,
    1.0, 1.0,   1.0, 0.0,   0.0, 1.0,
    // Right
    0.0, 0.0,   0.0, 1.0,   1.0, 0.0,
    1.0, 1.0,   0.0, 1.0,   1.0, 0.0,
    // Back
    0.0, 0.0,   1.0, 1.0,   1.0, 0.0,
    0.0, 0.0,   0.0, 1.0,   1.0, 1.0
];

function transformMapUV(u, v, uvScale, rotate90) {
    let scaledU = u * uvScale;
    let scaledV = v * uvScale;
    if (!rotate90) return [scaledU, scaledV];
    return [scaledV, 1.0 - scaledU];
}

function appendCubeToBatch(verticesOut, uvsOut, cellX, cellY, cellZ, uvScale = 1.0, rotate90 = false) {
    for (let i = 0; i < UNIT_CUBE_VERTICES.length; i += 3) {
        let vx = (UNIT_CUBE_VERTICES[i] + cellX) * BLOCK_SIZE;
        let vy = FLOOR_Y + (UNIT_CUBE_VERTICES[i + 1] + cellY) * BLOCK_SIZE;
        let vz = (UNIT_CUBE_VERTICES[i + 2] + cellZ) * BLOCK_SIZE;
        verticesOut.push(vx, vy, vz);
    }

    for (let i = 0; i < UNIT_CUBE_UVS.length; i += 2) {
        let transformed = transformMapUV(UNIT_CUBE_UVS[i], UNIT_CUBE_UVS[i + 1], uvScale, rotate90);
        uvsOut.push(transformed[0], transformed[1]);
    }
}

function appendWallCubeToBatch(verticesOut, uvsOut, cellX, cellY, cellZ, uvScale = 1.0, rotate90 = false) {
    for (let i = 0; i < UNIT_CUBE_VERTICES.length; i += 3) {
        let vx = cellX * BLOCK_SIZE + WALL_INSET + UNIT_CUBE_VERTICES[i] * WALL_THICKNESS;
        let vy = FLOOR_Y + (UNIT_CUBE_VERTICES[i + 1] + cellY) * BLOCK_SIZE;
        let vz = cellZ * BLOCK_SIZE + WALL_INSET + UNIT_CUBE_VERTICES[i + 2] * WALL_THICKNESS;
        verticesOut.push(vx, vy, vz);
    }

    for (let i = 0; i < UNIT_CUBE_UVS.length; i += 2) {
        let transformed = transformMapUV(UNIT_CUBE_UVS[i], UNIT_CUBE_UVS[i + 1], uvScale, rotate90);
        uvsOut.push(transformed[0], transformed[1]);
    }
}

function clearMapBatches() {
    for (let i = 0; i < g_mapBatches.length; i++) {
        let batch = g_mapBatches[i];
        if (batch.vertexBuffer) gl.deleteBuffer(batch.vertexBuffer);
        if (batch.uvBuffer) gl.deleteBuffer(batch.uvBuffer);
    }
    g_mapBatches = [];
}

function buildMapBatch(textureNum, vertices, uvs) {
    if (vertices.length === 0) return;

    let vertexBuffer = gl.createBuffer();
    let uvBuffer = gl.createBuffer();
    if (!vertexBuffer || !uvBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    g_mapBatches.push({
        textureNum: textureNum,
        vertexBuffer: vertexBuffer,
        uvBuffer: uvBuffer,
        vertexCount: vertices.length / 3
    });
}

function getCellCenterWorld(x, z) {
    return {
        x: getCellWorldMinX(x) + BLOCK_SIZE * 0.5,
        z: getCellWorldMinZ(z) + BLOCK_SIZE * 0.5
    };
}

function generateFlowers(count) {
    let spawnCell = worldToMapCell(g_camera.eye.elements[0], g_camera.eye.elements[2]);
    let spawnX = spawnCell[0];
    let spawnZ = spawnCell[1];
    let candidates = [];

    for (let z = 1; z < g_map.length - 1; z++) {
        for (let x = 1; x < g_map[z].length - 1; x++) {
            if (g_map[z][x] !== 0) continue;
            if (Math.abs(x - spawnX) <= 2 && Math.abs(z - spawnZ) <= 2) continue;
            candidates.push([x, z]);
        }
    }

    shuffleArray(candidates);
    g_flowers = [];
    g_collectedFlowers = 0;
    let n = Math.min(count, candidates.length);
    for (let i = 0; i < n; i++) {
        let x = candidates[i][0];
        let z = candidates[i][1];
        g_flowers.push({
            x: x,
            z: z,
            collected: false,
            phase: Math.random() * Math.PI * 2
        });
    }
    updateFlowerCounterUI();
}

function getFlowerBaseY(flower) {
    return FLOOR_Y + 0.02 * Math.sin(g_seconds * 2.5 + flower.phase);
}

function getFlowerBounds(flower) {
    let pos = getCellCenterWorld(flower.x, flower.z);
    let halfW = FLOWER_WIDTH * 0.5;
    let baseY = getFlowerBaseY(flower);
    return {
        minX: pos.x - halfW,
        maxX: pos.x + halfW,
        minY: baseY,
        maxY: baseY + FLOWER_HEIGHT,
        minZ: pos.z - halfW,
        maxZ: pos.z + halfW
    };
}

function getGnomeBounds(gnome) {
    if (!gnome) return null;
    let half = GNOME_WIDTH * 0.5;
    return {
        minX: gnome.x - half,
        maxX: gnome.x + half,
        minY: FLOOR_Y,
        maxY: FLOOR_Y + GNOME_HEIGHT,
        minZ: gnome.z - half,
        maxZ: gnome.z + half
    };
}

function clearPlayerBlocks() {
    let changed = false;
    for (let z = 0; z < g_playerBlocks.length; z++) {
        for (let x = 0; x < g_playerBlocks[z].length; x++) {
            if (g_playerBlocks[z][x] > 0) {
                g_playerBlocks[z][x] = 0;
                changed = true;
            }
        }
    }
    if (changed) initMap();
}

function collectFlowerAtIndex(index) {
    if (index < 0 || index >= g_flowers.length) return false;
    let flower = g_flowers[index];
    if (flower.collected) return false;

    flower.collected = true;
    g_collectedFlowers += 1;
    updateFlowerCounterUI();
    playOneShotAudio(g_collectFlowerAudio);

    // Player-placed stone blocks disappear after each flower collection.
    clearPlayerBlocks();
    finishGameIfComplete();
    return true;
}

function loseOneCollectedFlower() {
    let collected = [];
    for (let i = 0; i < g_flowers.length; i++) {
        if (g_flowers[i].collected) collected.push(i);
    }
    if (collected.length === 0) return false;

    let idx = collected[Math.floor(Math.random() * collected.length)];
    g_flowers[idx].collected = false;
    g_collectedFlowers = Math.max(0, g_collectedFlowers - 1);
    updateFlowerCounterUI();
    return true;
}

function isCellWalkableForGnome(x, z) {
    if (!isCellInBounds(x, z)) return false;
    if (g_map[z][x] > 0) return false;
    if (getPlayerBlockHeightAtCell(x, z) > 0) return false;
    if (isCellInSafeZone(x, z)) return false;
    return true;
}

function hasUncollectedFlowerAtCell(x, z) {
    for (let i = 0; i < g_flowers.length; i++) {
        let flower = g_flowers[i];
        if (!flower.collected && flower.x === x && flower.z === z) return true;
    }
    return false;
}

function getRandomOpenCell(avoidCell = null, minCellDistance = 0, avoidFlowers = false, avoidSafeZone = false) {
    let candidates = [];
    let minDistSq = minCellDistance * minCellDistance;
    for (let z = 1; z < g_map.length - 1; z++) {
        for (let x = 1; x < g_map[z].length - 1; x++) {
            if (!isCellWalkableForGnome(x, z)) continue;
            if (avoidFlowers && hasUncollectedFlowerAtCell(x, z)) continue;
            if (avoidSafeZone && isCellInSafeZone(x, z)) continue;
            if (avoidCell) {
                let dx = x - avoidCell[0];
                let dz = z - avoidCell[1];
                if (dx * dx + dz * dz < minDistSq) continue;
            }
            candidates.push([x, z]);
        }
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function respawnPlayerRandomly(avoidCell = null) {
    let cell =
        getRandomOpenCell(avoidCell, 6, false, true) ||
        getRandomOpenCell(avoidCell, 3, false, true) ||
        getRandomOpenCell(null, 0, false, true) ||
        getRandomOpenCell();
    if (!cell) return;

    let pos = getCellCenterWorld(cell[0], cell[1]);
    g_camera.eye.elements[0] = pos.x;
    g_camera.eye.elements[1] = FLOOR_Y + PLAYER_EYE_HEIGHT;
    g_camera.eye.elements[2] = pos.z;
    updateCameraDirectionFromAngles();
}

function respawnPlayerAtSpawn() {
    let pos = getCellCenterWorld(g_spawnCellX, g_spawnCellZ);
    g_camera.eye.elements[0] = pos.x;
    g_camera.eye.elements[1] = FLOOR_Y + PLAYER_EYE_HEIGHT;
    g_camera.eye.elements[2] = pos.z;
    updateCameraDirectionFromAngles();
}

function createGnomeAtRandom() {
    let playerCell = worldToMapCell(g_camera.eye.elements[0], g_camera.eye.elements[2]);
    let cell =
        getRandomOpenCell(playerCell, 6, true, true) ||
        getRandomOpenCell(playerCell, 3, true, true) ||
        getRandomOpenCell(null, 0, true, true) ||
        getRandomOpenCell();
    if (!cell) return null;

    let pos = getCellCenterWorld(cell[0], cell[1]);
    return {
        x: pos.x,
        z: pos.z,
        path: [],
        repathTimer: 0
    };
}

function setGnomeCount(count) {
    let clamped = clamp(Math.round(count), GNOME_MIN_COUNT, GNOME_MAX_COUNT);
    g_gnomeCount = clamped;

    while (g_gnomes.length < g_gnomeCount) {
        let gnome = createGnomeAtRandom();
        if (!gnome) break;
        g_gnomes.push(gnome);
    }

    if (g_gnomes.length > g_gnomeCount) {
        g_gnomes.length = g_gnomeCount;
    }

    if (g_gnomes.length < g_gnomeCount) {
        g_gnomeCount = g_gnomes.length;
    }

    ensureGnomeLaughAudioLoopCount();
    if (g_gameActive) {
        for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) {
            playLoopAudio(g_gnomeLaughAudioLoops[i]);
        }
        updateGnomeLaughVolumes();
    } else {
        for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) {
            stopLoopAudio(g_gnomeLaughAudioLoops[i]);
        }
    }

    updateStartScreenGnomeCountUI();
}

function respawnGnomeAtIndex(index) {
    if (index < 0 || index >= g_gnomes.length) return;
    let replacement = createGnomeAtRandom();
    if (!replacement) return;
    g_gnomes[index] = replacement;
}

function buildPathBFS(startX, startZ, targetX, targetZ) {
    if (!isCellInBounds(startX, startZ) || !isCellInBounds(targetX, targetZ)) return [];
    if (!isCellWalkableForGnome(startX, startZ) || !isCellWalkableForGnome(targetX, targetZ)) return [];

    let rows = g_map.length;
    let cols = g_map[0].length;
    let visited = create2DArray(rows, cols, false);
    let prev = create2DArray(rows, cols, null);
    let queue = [[startX, startZ]];
    let head = 0;
    visited[startZ][startX] = true;

    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (head < queue.length) {
        let node = queue[head++];
        let x = node[0];
        let z = node[1];
        if (x === targetX && z === targetZ) break;

        for (let i = 0; i < dirs.length; i++) {
            let nx = x + dirs[i][0];
            let nz = z + dirs[i][1];
            if (!isCellInBounds(nx, nz)) continue;
            if (visited[nz][nx]) continue;
            if (!isCellWalkableForGnome(nx, nz)) continue;
            visited[nz][nx] = true;
            prev[nz][nx] = [x, z];
            queue.push([nx, nz]);
        }
    }

    if (!visited[targetZ][targetX]) return [];
    let path = [];
    let cur = [targetX, targetZ];
    while (cur && !(cur[0] === startX && cur[1] === startZ)) {
        path.push(cur);
        cur = prev[cur[1]][cur[0]];
    }
    path.reverse();
    return path;
}

function updateSingleGnome(gnome, deltaTime) {
    if (!gnome) return;

    gnome.repathTimer -= deltaTime;
    let gCell = worldToMapCell(gnome.x, gnome.z);
    let pCell = worldToMapCell(g_camera.eye.elements[0], g_camera.eye.elements[2]);
    if (!isCellWalkableForGnome(gCell[0], gCell[1])) {
        let replacement = createGnomeAtRandom();
        if (replacement) {
            gnome.x = replacement.x;
            gnome.z = replacement.z;
            gnome.path = [];
            gnome.repathTimer = 0;
        }
        return;
    }

    if (isCellInSafeZone(pCell[0], pCell[1])) {
        gnome.path = [];
        return;
    }

    if (gnome.repathTimer <= 0 || gnome.path.length === 0) {
        gnome.path = buildPathBFS(gCell[0], gCell[1], pCell[0], pCell[1]);
        gnome.repathTimer = GNOME_REPATH_SECONDS;
    }

    if (gnome.path.length === 0) return;

    let targetX = gnome.x;
    let targetZ = gnome.z;
    if (gnome.path.length > 0) {
        let next = gnome.path[0];
        let center = getCellCenterWorld(next[0], next[1]);
        targetX = center.x;
        targetZ = center.z;

        if (Math.hypot(gnome.x - targetX, gnome.z - targetZ) < 0.02) {
            gnome.x = targetX;
            gnome.z = targetZ;
            gnome.path.shift();
            if (gnome.path.length > 0) {
                next = gnome.path[0];
                center = getCellCenterWorld(next[0], next[1]);
                targetX = center.x;
                targetZ = center.z;
            }
        }
    }

    let dx = targetX - gnome.x;
    let dz = targetZ - gnome.z;
    let dist = Math.hypot(dx, dz);
    if (dist < 1e-6) return;

    let step = Math.min(dist, GNOME_SPEED_PER_SEC * Math.min(deltaTime, 0.05));
    let moveX = dx / dist * step;
    let moveZ = dz / dist * step;
    let probeY = FLOOR_Y + PLAYER_EYE_HEIGHT;

    let nextX = gnome.x + moveX;
    let nextZ = gnome.z + moveZ;

    let nextCellX = worldToMapCell(nextX, gnome.z);
    if (!isCellInSafeZone(nextCellX[0], nextCellX[1]) &&
        canOccupyWithRadius(nextX, probeY, gnome.z, GNOME_RADIUS)) {
        gnome.x = nextX;
    }

    let nextCellZ = worldToMapCell(gnome.x, nextZ);
    if (!isCellInSafeZone(nextCellZ[0], nextCellZ[1]) &&
        canOccupyWithRadius(gnome.x, probeY, nextZ, GNOME_RADIUS)) {
        gnome.z = nextZ;
    }
}

function updateGnomes(deltaTime) {
    if (!g_gameActive || g_gnomes.length === 0) return;
    for (let i = 0; i < g_gnomes.length; i++) {
        updateSingleGnome(g_gnomes[i], deltaTime);
    }
}

function checkGnomeCatches() {
    if (!g_gameActive || g_gnomes.length === 0) return;
    if (isPlayerInsideSafeZone()) return;

    let feetY = g_camera.eye.elements[1] - PLAYER_EYE_HEIGHT;
    if (feetY > FLOOR_Y + GNOME_HEIGHT) return;

    for (let i = 0; i < g_gnomes.length; i++) {
        let gnome = g_gnomes[i];
        let dx = g_camera.eye.elements[0] - gnome.x;
        let dz = g_camera.eye.elements[2] - gnome.z;
        if (dx * dx + dz * dz > GNOME_CATCH_RADIUS * GNOME_CATCH_RADIUS) continue;

        g_captureCount += 1;
        playOneShotAudio(g_oofAudio);
        if (g_collectedFlowers > 0) {
            loseOneCollectedFlower();
            showNotice('The garden gnome has caught you! You have respawned and lost a flower.');
        } else {
            g_timePenaltySeconds += 10;
            g_elapsedTimeSeconds += 10;
            showNotice('The garden gnome has caught you! Since you have no flowers, your time has increased by 10 seconds.');
        }

        let gnomeCell = worldToMapCell(gnome.x, gnome.z);
        respawnPlayerRandomly(gnomeCell);
        respawnGnomeAtIndex(i);
        break;
    }
}

function drawFlowers() {
    for (let i = 0; i < g_flowers.length; i++) {
        let flower = g_flowers[i];
        if (flower.collected) continue;

        let pos = getCellCenterWorld(flower.x, flower.z);
        let baseY = getFlowerBaseY(flower);

        let p1 = new Cube();
        p1.color = [1.0, 1.0, 1.0, 1.0];
        p1.textureNum = 4;
        p1.matrix.translate(pos.x, baseY, pos.z);
        p1.matrix.scale(FLOWER_WIDTH, FLOWER_HEIGHT, FLOWER_THICKNESS);
        p1.matrix.translate(-0.5, 0.0, -0.5);
        p1.renderFast();

        let p2 = new Cube();
        p2.color = [1.0, 1.0, 1.0, 1.0];
        p2.textureNum = 4;
        p2.matrix.translate(pos.x, baseY, pos.z);
        p2.matrix.rotate(90, 0, 1, 0);
        p2.matrix.scale(FLOWER_WIDTH, FLOWER_HEIGHT, FLOWER_THICKNESS);
        p2.matrix.translate(-0.5, 0.0, -0.5);
        p2.renderFast();
    }
}

function drawSingleGnome(gnome) {
    let toCamX = g_camera.eye.elements[0] - gnome.x;
    let toCamZ = g_camera.eye.elements[2] - gnome.z;
    let faceAngle = Math.atan2(toCamX, toCamZ) * 180 / Math.PI;

    let model = new Matrix4();
    model.translate(gnome.x, FLOOR_Y, gnome.z);
    model.rotate(faceAngle, 0, 1, 0);
    model.scale(GNOME_WIDTH, GNOME_HEIGHT, 1.0);
    model.translate(-0.5, 0.0, 0.0);

    gl.uniform1i(u_whichTexture, 5);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, model.elements);

    drawTriangle3DUV(
        [
            0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
            0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0
        ],
        [
            0.0, 0.0,   1.0, 1.0,   1.0, 0.0,
            0.0, 0.0,   0.0, 1.0,   1.0, 1.0
        ]
    );
}

function drawGnomes() {
    for (let i = 0; i < g_gnomes.length; i++) {
        drawSingleGnome(g_gnomes[i]);
    }
}

function drawSafeZone() {
    let center = getCellCenterWorld(g_spawnCellX, g_spawnCellZ);
    let size = BLOCK_SIZE * (SAFE_ZONE_HALF_CELLS * 2 + 1);
    let height = BLOCK_SIZE * SAFE_ZONE_HEIGHT_BLOCKS;

    let safeZone = new Cube();
    safeZone.color = [0.2, 0.95, 0.3, 0.28];
    safeZone.textureNum = -2;
    safeZone.matrix.translate(center.x, FLOOR_Y + 0.002, center.z);
    safeZone.matrix.scale(size, height, size);
    safeZone.matrix.translate(-0.5, 0.0, -0.5);

    safeZone.renderFast();
}

function create2DArray(rows, cols, initialValue = 0) {
    return Array.from({ length: rows }, function() {
        return Array(cols).fill(initialValue);
    });
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

function generateMazeLayout(rows, cols) {
    let maze = create2DArray(rows, cols, MAZE_WALL_HEIGHT);

    function isInterior(x, z) {
        return x > 0 && x < cols - 1 && z > 0 && z < rows - 1;
    }

    maze[1][1] = 0;
    let stack = [[1, 1]];

    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        let x = current[0];
        let z = current[1];

        let directions = [[2, 0], [-2, 0], [0, 2], [0, -2]];
        shuffleArray(directions);

        let carved = false;
        for (let i = 0; i < directions.length; i++) {
            let dx = directions[i][0];
            let dz = directions[i][1];
            let nx = x + dx;
            let nz = z + dz;

            if (!isInterior(nx, nz)) continue;
            if (maze[nz][nx] === 0) continue;

            maze[z + dz / 2][x + dx / 2] = 0;
            maze[nz][nx] = 0;
            stack.push([nx, nz]);
            carved = true;
            break;
        }

        if (!carved) {
            stack.pop();
        }
    }

    // Keep the outside wall exactly one cube thick on all 4 sides.
    for (let x = 1; x < cols - 1; x++) {
        maze[1][x] = 0;
        maze[rows - 2][x] = 0;
    }
    for (let z = 1; z < rows - 1; z++) {
        maze[z][1] = 0;
        maze[z][cols - 2] = 0;
    }

    return maze;
}

function carveSpawnArea() {
    let [spawnX, spawnZ] = worldToMapCell(g_camera.eye.elements[0], g_camera.eye.elements[2]);
    g_spawnCellX = spawnX;
    g_spawnCellZ = spawnZ;
    for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
            let x = spawnX + dx;
            let z = spawnZ + dz;
            if (isCellInBounds(x, z)) {
                g_map[z][x] = 0;
            }
        }
    }
}

function ensureMazeInitialized() {
    if (g_mazeInitialized) return;

    let rows = g_map.length;
    let cols = g_map[0].length;
    g_map = generateMazeLayout(rows, cols);
    g_playerBlocks = create2DArray(rows, cols, 0);
    carveSpawnArea();
    generateFlowers(FLOWER_TARGET);
    g_gnomes = [];
    setGnomeCount(g_gnomeCount);
    g_mazeInitialized = true;
}

function initMap() {
    ensureMazeInitialized();
    clearMapBatches();
    let brickVertices = [];
    let brickUVs = [];
    let stoneVertices = [];
    let stoneUVs = [];
    let mapHalfX = g_map[0].length / 2;
    let mapHalfZ = g_map.length / 2;

    for (let z = 0; z < g_map.length; z++) {
        for (let x = 0; x < g_map[z].length; x++) {
            let mazeHeight = g_map[z][x];
            if (mazeHeight > 0) {
                for (let h = 0; h < mazeHeight; h++) {
                    appendWallCubeToBatch(
                        brickVertices,
                        brickUVs,
                        x - mapHalfX,
                        h,
                        z - mapHalfZ,
                        WALL_UV_SCALE,
                        true
                    );
                }
            }

            let stoneHeight = getPlayerBlockHeightAtCell(x, z);
            if (stoneHeight > 0) {
                for (let h = 0; h < stoneHeight; h++) {
                    appendCubeToBatch(
                        stoneVertices,
                        stoneUVs,
                        x - mapHalfX,
                        h,
                        z - mapHalfZ,
                        1.0,
                        false
                    );
                }
            }
        }
    }

    buildMapBatch(2, brickVertices, brickUVs);
    buildMapBatch(3, stoneVertices, stoneUVs);
}

function drawMap() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, g_identityModelMatrix.elements);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);

    for (let i = 0; i < g_mapBatches.length; i++) {
        let batch = g_mapBatches[i];
        gl.uniform1i(u_whichTexture, batch.textureNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, batch.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, batch.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, batch.vertexCount);
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
    projectionMatrix.setPerspective(60, canvas.width / canvas.height, CAMERA_NEAR, CAMERA_FAR);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);

    // Pass the view matrix
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(...g_camera.eye.elements, ...g_camera.at.elements, ...g_camera.up.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    // Pass the matrix to u_ModelMatrix attribute variable
    var globalRotMat = buildGlobalRotateMatrix();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the floor
    var floor = new Cube();
    floor.color = [1.0, 1.0, 1.0, 1.0];
    floor.textureNum = 1;
    floor.uvScale = GROUND_UV_SCALE;
    floor.matrix.translate(0.0, -0.75, 0.0);
    floor.matrix.scale(12.0, 0.0, 12.0);
    floor.matrix.translate(-0.5, 0.0, -0.5);
    floor.renderFast();

    // Draw the sky
    var sky = new Cube();
    sky.color = [1.0, 1.0, 1.0, 1.0];
    sky.textureNum = 0;
    sky.matrix.translate(0.0, 0.25, 0.0);
    sky.matrix.scale(40.0, 40.0, 40.0);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.renderFast();

    // Draw the map
    drawMap();
    drawSafeZone();
    drawFlowers();
    drawGnomes();

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
    // Use latest cursor location; if none yet, use canvas center.
    let rect = canvas.getBoundingClientRect();
    let clientX = (g_cursorX === null) ? rect.left + rect.width / 2 : g_cursorX;
    let clientY = (g_cursorY === null) ? rect.top + rect.height / 2 : g_cursorY;
    let ray = getPickRayFromClientPos(clientX, clientY);
    if (!ray) return null;

    let origin = ray.origin.elements;
    let dir = ray.dir.elements;
    let enteredMap = false;

    // March along the cursor ray and stop at the first visible column.
    for (let t = 0; t <= PICK_MAX_DIST; t += PICK_STEP) {
        let wx = origin[0] + dir[0] * t;
        let wy = origin[1] + dir[1] * t;
        let wz = origin[2] + dir[2] * t;
        let [x, z] = worldToMapCell(wx, wz);

        if (!isCellInBounds(x, z)) {
            if (enteredMap) break;
            continue;
        }
        enteredMap = true;

        let topY = FLOOR_Y + getTotalHeightAtCell(x, z) * BLOCK_SIZE;
        if (wy <= topY && wy >= FLOOR_Y - BLOCK_SIZE) {
            return [x, z];
        }
    }

    // Fallback: if the ray doesn't hit a column, use the floor plane.
    if (Math.abs(dir[1]) > 1e-6) {
        let tGround = (FLOOR_Y - origin[1]) / dir[1];
        if (tGround >= 0) {
            let wx = origin[0] + dir[0] * tGround;
            let wz = origin[2] + dir[2] * tGround;
            let [x, z] = worldToMapCell(wx, wz);
            if (isCellInBounds(x, z)) return [x, z];
        }
    }

    return null;
}
function addBlock() {
    if (!g_gameActive) return;
    let target = getFrontCell();
    if (!target) return;
    let [x, z] = target;

    if (isCellInBounds(x, z)) {
        // Only place removable stone blocks in non-maze cells.
        if (g_map[z][x] > 0) return;
        g_playerBlocks[z][x] += 1;
        g_blocksPlacedCount += 1;
        playOneShotAudio(g_blockAudio);
        initMap();
    }
}
function removeBlock() {
    if (!g_gameActive) return;
    let target = getFrontCell();
    if (!target) return;
    let [x, z] = target;

    if (isCellInBounds(x, z)) {
        // Only stone blocks are removable.
        if (g_playerBlocks[z][x] > 0) {
            g_playerBlocks[z][x] -= 1;
            playOneShotAudio(g_blockAudio);
            initMap();
        }
    }
}
