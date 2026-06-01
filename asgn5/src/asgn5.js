/*
Name: Alice Xiao-Li
Email: axiaoli@ucsc.edu
Note: Used LLM as a coding assistant

Assignment 5: Three.js remake of Assignment 3.
*/

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let canvas;
let renderer;
let scene;
let camera;
let raycaster;
let pointer;
let g_lastFrameTime = 0;
let g_sceneStartTime = 0;

let wallMesh = null;
let stoneMesh = null;
let floorMesh = null;
let skyMesh = null;
let safeZoneMesh = null;
let safeZoneEdges = null;
let moonMesh = null;
let moonLight = null;
let flowersGroup = null;
let gnomesGroup = null;
let spikesGroup = null;
let firefliesGroup = null;
let fireflyMesh = null;
let flowerModelPrototype = null;

let g_cameraYaw = 0;
let g_cameraPitch = 0;
let g_mouseDown = false;
let g_lastX = 0;
let g_lastY = 0;
let g_cursorX = null;
let g_cursorY = null;
let g_keys = {};
let g_flowers = [];
let g_spikes = [];
let g_fireflies = [];
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
let g_spikeDeathCount = 0;
let g_gnomesAttackedCount = 0;
let g_blocksPlacedCount = 0;
let g_spawnCellX = 0;
let g_spawnCellZ = 0;
let g_masterVolume = 1.0;
let g_audioInitialized = false;
let g_backgroundMusicAudio = null;
let g_collectFlowerAudio = null;
let g_hoorayAudio = null;
let g_oofAudio = null;
let g_gnomeHurtAudio = null;
let g_blockAudio = null;
let g_wompAudio = null;
let g_gnomeLaughAudioLoops = [];
let g_activeOneShots = [];
let g_miniMapWallImage = null;
let g_miniMapStoneImage = null;
let g_mazeInitialized = false;
let g_playerBlocks = [];
let g_lastSlowUIUpdateTime = 0;
let g_lastDebugUpdateTime = 0;
let g_lastMiniMapStaticKey = '';
let g_miniMapStaticCanvas = null;
let g_miniMapStaticLayout = null;
let g_uiPositionDirty = true;
let g_spikeFogEffectEndTime = 0;
let g_spikeFogEffectActive = false;

const BLOCK_SIZE = 0.4;
const FLOOR_Y = -0.75;
const PLAYER_RADIUS = 0.1;
const PLAYER_EYE_HEIGHT = 0.75;
const PLAYER_HEIGHT = 1.5;
const CAMERA_NEAR = 0.03;
const CAMERA_FAR = 100;
const LOOK_SENSITIVITY = 0.25;
const CAMERA_MIN_PITCH = -89;
const CAMERA_MAX_PITCH = 89;
const MAZE_WALL_HEIGHT = 3;
const MOVE_SPEED_PER_SEC = 1.9;
const SPIKE_MOVE_SPEED_PER_SEC = 1;
const SPIKE_FOG_EFFECT_SECONDS = 10;
const NORMAL_FOG_COLOR = 0xFFB6C1;
const NORMAL_FOG_DENSITY = 0.01;
const SPIKE_FOG_COLOR = 0x000000;
const SPIKE_FOG_DENSITY = 1.00;
const TURN_SPEED_DEG_PER_SEC = 120;
const FLOWER_TARGET = 8;
const FLOWER_WIDTH = 0.16;
const FLOWER_HEIGHT = 0.22;
const SPIKE_GROUP_COUNT = 75;
const SPIKES_PER_GROUP = 8;
const SPIKE_COLLISION_RADIUS = BLOCK_SIZE * 0.34;
const SPIKE_HEIGHT = BLOCK_SIZE * 0.34;
const FIREFLY_COUNT = 500;
const FIREFLY_RADIUS = 0.018;
const GNOME_SPEED_PER_SEC = 1.5;
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
const GNOME_LAUGH_NEAR_DIST = BLOCK_SIZE;
const GNOME_LAUGH_FAR_DIST = BLOCK_SIZE * 18;
const MINIMAP_SIZE_PX = 250;
const MINIMAP_CELL_PADDING_PX = 4;
const BLOCK_PICK_STEP = 0.04;
const BLOCK_PICK_MAX_DIST = 50;
const BLOCK_PICK_MIN_DIST = 0.35;

let g_map = create2DArray(32, 32, MAZE_WALL_HEIGHT);

const textureLoader = new THREE.TextureLoader();
const textures = {};
const materials = {};

function clamp(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
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

function makeTexture(src, repeatX = 1, repeatY = 1, colorSpace = THREE.SRGBColorSpace) {
    let texture = textureLoader.load(src);
    texture.colorSpace = colorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 8;
    return texture;
}

function initMaterials() {
    textures.sky = makeTexture('../resources/sky4.png', 1, 1);
    textures.grass = makeTexture('../resources/grass.jpg', 12, 12);
    textures.brick = makeTexture('../resources/brickwall.jpg', 1, 1);
    textures.stone = makeTexture('../resources/stone.jpg', 1, 1);
    textures.flower = makeTexture('../resources/lavender.gif', 1, 1);
    textures.gnome = makeTexture('../resources/gnome.gif', 1, 1);

    materials.floor = new THREE.MeshLambertMaterial({ map: textures.grass, color: 0x384a3f });
    materials.wall = new THREE.MeshLambertMaterial({ map: textures.brick, color: 0x6f7484 });
    materials.stone = new THREE.MeshLambertMaterial({ map: textures.stone, color: 0x768090 });
    materials.spike = new THREE.MeshLambertMaterial({ map: textures.stone, color: 0x9a9aa5 });
    materials.spikeGlow = new THREE.MeshBasicMaterial({
        color: 0xff1f1f,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    materials.firefly = new THREE.MeshBasicMaterial({
        color: 0xfff2a0,
        transparent: true,
        opacity: 0.56,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    materials.flower = new THREE.MeshBasicMaterial({
        map: textures.flower,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide
    });
    materials.gnome = new THREE.MeshBasicMaterial({
        map: textures.gnome,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide
    });
    materials.safeZone = new THREE.MeshBasicMaterial({
        color: 0x33f24d,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.DoubleSide
    });
}

function setupThree() {
    canvas = document.getElementById('webgl');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050815);
    scene.fog = new THREE.FogExp2(NORMAL_FOG_COLOR, NORMAL_FOG_DENSITY);
    camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(0, FLOOR_Y + PLAYER_EYE_HEIGHT, 0);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    scene.add(new THREE.HemisphereLight(0x1c2445, 0x050706, 0.38));
    moonLight = new THREE.DirectionalLight(0xdce8ff, 3);
    moonLight.position.set(-5, 10, 4);
    moonLight.target.position.set(0, FLOOR_Y, 0);
    scene.add(moonLight);
    scene.add(moonLight.target);
    scene.add(new THREE.AmbientLight(0x445577, 6.5));

  flowersGroup = new THREE.Group();
  gnomesGroup = new THREE.Group();
  spikesGroup = new THREE.Group();
  firefliesGroup = new THREE.Group();
  scene.add(flowersGroup);
  scene.add(gnomesGroup);
  scene.add(spikesGroup);
  scene.add(firefliesGroup);
}

function buildStaticScene() {
    let floorGeometry = new THREE.PlaneGeometry(12, 12);
    floorMesh = new THREE.Mesh(floorGeometry, materials.floor);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = FLOOR_Y;
    scene.add(floorMesh);

    let skyGeometry = new THREE.BoxGeometry(40, 40, 40);
    skyMesh = new THREE.Mesh(skyGeometry, new THREE.MeshBasicMaterial({
        map: textures.sky,
        color: 0x10172d,
        side: THREE.BackSide
    }));
    skyMesh.position.y = 0.25;
    scene.add(skyMesh);

    let moonGeometry = new THREE.SphereGeometry(0.7, 32, 16);
    let moonMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f7ff });
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.position.copy(moonLight.position);
    scene.add(moonMesh);

    safeZoneMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials.safeZone);
    scene.add(safeZoneMesh);
    safeZoneEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
        new THREE.LineBasicMaterial({
        color: 0x77ff88,
        transparent: true,
        opacity: 0.85
        })
    );
    scene.add(safeZoneEdges);
}

function fitModelToBox(object, maxWidth, maxHeight, maxDepth) {
    object.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(object);
    let size = new THREE.Vector3();
    box.getSize(size);
    let scale = Math.min(
        maxWidth / Math.max(size.x, 1e-6),
        maxHeight / Math.max(size.y, 1e-6),
        maxDepth / Math.max(size.z, 1e-6)
    );
    object.scale.multiplyScalar(scale);
    object.updateMatrixWorld(true);

    box.setFromObject(object);
    let center = new THREE.Vector3();
    box.getCenter(center);
    object.position.x -= center.x;
    object.position.z -= center.z;
    object.position.y -= box.min.y;
}

function makeFlowerFallback() {
    let root = new THREE.Group();
    let geometry = new THREE.PlaneGeometry(FLOWER_WIDTH, FLOWER_HEIGHT);
    let p1 = new THREE.Mesh(geometry, materials.flower);
    let p2 = new THREE.Mesh(geometry, materials.flower);
    p1.position.y = FLOWER_HEIGHT / 2;
    p2.position.y = FLOWER_HEIGHT / 2;
    p2.rotation.y = Math.PI / 2;
    root.add(p1, p2);
  return root;
}

function createSpikeGeometry() {
    let geometry = new THREE.ConeGeometry(BLOCK_SIZE * 0.075, SPIKE_HEIGHT, 4);
    geometry.rotateY(Math.PI / 4);
    geometry.computeVertexNormals();
    return geometry;
}

function loadFlowerModel() {
    let loader = new GLTFLoader();
    loader.load(
        '../resources/redFlower.glb',
        function(gltf) {
        flowerModelPrototype = gltf.scene;
        flowerModelPrototype.traverse(function(obj) {
            if (obj.isMesh && obj.material) {
            obj.material = obj.material.clone();
            if ('emissive' in obj.material) {
                obj.material.emissive = new THREE.Color(0x260000);
                obj.material.emissiveIntensity = 0.18;
            }
            }
        });
        fitModelToBox(flowerModelPrototype, FLOWER_WIDTH * 2.1, FLOWER_HEIGHT * 1.8, FLOWER_WIDTH * 2.1);
        rebuildFlowerMeshes();
        },
        undefined,
        function(err) {
        console.warn('Failed to load red flower model.', err);
        }
    );
}

function getCellWorldMinX(x) {
    return (x - g_map[0].length / 2) * BLOCK_SIZE;
}

function getCellWorldMinZ(z) {
    return (z - g_map.length / 2) * BLOCK_SIZE;
}

function getCellCenterWorld(x, z) {
    return {
        x: getCellWorldMinX(x) + BLOCK_SIZE * 0.5,
        z: getCellWorldMinZ(z) + BLOCK_SIZE * 0.5
    };
}

function worldToMapCell(worldX, worldZ) {
    let mapHalfX = g_map[0].length / 2;
    let mapHalfZ = g_map.length / 2;
    let gridX = Math.floor(worldX / BLOCK_SIZE + mapHalfX);
    let gridZ = Math.floor(worldZ / BLOCK_SIZE + mapHalfZ);
    return [gridX, gridZ];
}

function isCellInBounds(x, z) {
    return z >= 0 && z < g_map.length && x >= 0 && x < g_map[0].length;
}

function isCellInSafeZone(x, z) {
    return Math.abs(x - g_spawnCellX) <= SAFE_ZONE_HALF_CELLS && Math.abs(z - g_spawnCellZ) <= SAFE_ZONE_HALF_CELLS;
}

function isPlayerInsideSafeZone() {
    let cell = worldToMapCell(camera.position.x, camera.position.z);
    return isCellInSafeZone(cell[0], cell[1]);
}

function getPlayerBlockHeightAtCell(x, z) {
    if (!g_playerBlocks || g_playerBlocks.length === 0 || !isCellInBounds(x, z)) return 0;
    let row = g_playerBlocks[z];
    if (!row) return 0;
    return row[x] || 0;
}

function overlapsInY(worldY, columnHeight) {
    if (columnHeight <= 0) return false;
    let feetY = worldY - PLAYER_EYE_HEIGHT;
    let headY = feetY + PLAYER_HEIGHT;
    let topY = FLOOR_Y + columnHeight * BLOCK_SIZE;
    return feetY < topY && headY > FLOOR_Y;
}

function isInsideColumn(worldX, worldZ, x, z) {
    let minX = getCellWorldMinX(x);
    let maxX = minX + BLOCK_SIZE;
    let minZ = getCellWorldMinZ(z);
    let maxZ = minZ + BLOCK_SIZE;
    return worldX >= minX && worldX <= maxX && worldZ >= minZ && worldZ <= maxZ;
}

function isSolidAtWorldPos(worldX, worldY, worldZ) {
    let cell = worldToMapCell(worldX, worldZ);
    let cx = cell[0];
    let cz = cell[1];
    if (!isCellInBounds(cx, cz)) return true;

    for (let z = cz - 1; z <= cz + 1; z++) {
        for (let x = cx - 1; x <= cx + 1; x++) {
        if (!isCellInBounds(x, z)) continue;
        if (!isInsideColumn(worldX, worldZ, x, z)) continue;

        let mazeHeight = g_map[z][x];
        let stoneHeight = getPlayerBlockHeightAtCell(x, z);
        if (mazeHeight > 0 && overlapsInY(worldY, mazeHeight)) return true;
        if (stoneHeight > 0 && overlapsInY(worldY, stoneHeight)) return true;
        }
    }
    return false;
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

function canOccupy(worldX, worldY, worldZ) {
    return canOccupyWithRadius(worldX, worldY, worldZ, PLAYER_RADIUS);
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
        if (!carved) stack.pop();
    }

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
    let cell = worldToMapCell(camera.position.x, camera.position.z);
    g_spawnCellX = cell[0];
    g_spawnCellZ = cell[1];
    for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
        let x = g_spawnCellX + dx;
        let z = g_spawnCellZ + dz;
        if (isCellInBounds(x, z)) g_map[z][x] = 0;
        }
    }
}

function ensureMazeInitialized() {
  if (g_mazeInitialized) return;
  g_map = generateMazeLayout(32, 32);
  g_playerBlocks = create2DArray(g_map.length, g_map[0].length, 0);
  carveSpawnArea();
  generateSpikes(SPIKE_GROUP_COUNT);
  generateFlowers(FLOWER_TARGET);
  generateFireflies(FIREFLY_COUNT);
  g_gnomes = [];
  setGnomeCount(g_gnomeCount);
  g_mazeInitialized = true;
}

function createInstancedColumns(material, cells) {
    if (cells.length === 0) return null;
    let geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    let mesh = new THREE.InstancedMesh(geometry, material, cells.length);
    let matrix = new THREE.Matrix4();

    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        let pos = getCellCenterWorld(cell.x, cell.z);
        matrix.makeTranslation(pos.x, FLOOR_Y + BLOCK_SIZE * (cell.h + 0.5), pos.z);
        mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
    return mesh;
}

function rebuildMapMeshes() {
    if (wallMesh) scene.remove(wallMesh);
    if (stoneMesh) scene.remove(stoneMesh);
    g_lastMiniMapStaticKey = '';

    let wallCells = [];
    let stoneCells = [];
    for (let z = 0; z < g_map.length; z++) {
        for (let x = 0; x < g_map[z].length; x++) {
        for (let h = 0; h < g_map[z][x]; h++) wallCells.push({ x, z, h });
        for (let h = 0; h < getPlayerBlockHeightAtCell(x, z); h++) stoneCells.push({ x, z, h });
        }
    }

    wallMesh = createInstancedColumns(materials.wall, wallCells);
    stoneMesh = createInstancedColumns(materials.stone, stoneCells);
    updateSafeZoneMesh();
}

function updateSafeZoneMesh() {
    if (!safeZoneMesh) return;
    let center = getCellCenterWorld(g_spawnCellX, g_spawnCellZ);
    let size = BLOCK_SIZE * (SAFE_ZONE_HALF_CELLS * 2 + 1);
    let height = BLOCK_SIZE * SAFE_ZONE_HEIGHT_BLOCKS;
    safeZoneMesh.scale.set(size, height, size);
    safeZoneMesh.position.set(center.x, FLOOR_Y + height / 2 + 0.002, center.z);
    if (safeZoneEdges) {
        safeZoneEdges.scale.copy(safeZoneMesh.scale);
        safeZoneEdges.position.copy(safeZoneMesh.position);
    }
}

function generateFlowers(count) {
    let spawnCell = worldToMapCell(camera.position.x, camera.position.z);
    let candidates = [];
    for (let z = 1; z < g_map.length - 1; z++) {
        for (let x = 1; x < g_map[z].length - 1; x++) {
        if (g_map[z][x] !== 0) continue;
        if (Math.abs(x - spawnCell[0]) <= 2 && Math.abs(z - spawnCell[1]) <= 2) continue;
        if (hasSpikeAtCell(x, z)) continue;
        candidates.push([x, z]);
        }
    }

    shuffleArray(candidates);
    g_flowers = [];
    g_collectedFlowers = 0;
    let n = Math.min(count, candidates.length);
    for (let i = 0; i < n; i++) {
        g_flowers.push({
        x: candidates[i][0],
        z: candidates[i][1],
        collected: false,
        phase: Math.random() * Math.PI * 2,
        meshes: []
        });
    }
  rebuildFlowerMeshes();
  updateFlowerCounterUI();
}

function hasSpikeAtCell(x, z) {
    for (let i = 0; i < g_spikes.length; i++) {
        if (g_spikes[i].x === x && g_spikes[i].z === z) return true;
    }
    return false;
}

function hasOtherSpikeAtCell(x, z, skipIndex) {
    for (let i = 0; i < g_spikes.length; i++) {
        if (i === skipIndex) continue;
        if (g_spikes[i].x === x && g_spikes[i].z === z) return true;
    }
    return false;
}

function generateSpikes(count) {
    let spawnCell = worldToMapCell(camera.position.x, camera.position.z);
    let candidates = [];
    for (let z = 1; z < g_map.length - 1; z++) {
        for (let x = 1; x < g_map[z].length - 1; x++) {
            if (g_map[z][x] !== 0) continue;
            if (Math.abs(x - spawnCell[0]) <= 3 && Math.abs(z - spawnCell[1]) <= 3) continue;
            candidates.push([x, z]);
        }
    }

    shuffleArray(candidates);
    g_spikes = [];
    let n = Math.min(count, candidates.length);
    for (let i = 0; i < n; i++) {
        g_spikes.push({
            x: candidates[i][0],
            z: candidates[i][1],
            phase: Math.random() * Math.PI * 2
        });
    }
    rebuildSpikeMeshes();
}

function getRandomSpikeCell(skipIndex = -1) {
    let spawnCell = worldToMapCell(camera.position.x, camera.position.z);
    let candidates = [];
    for (let z = 1; z < g_map.length - 1; z++) {
        for (let x = 1; x < g_map[z].length - 1; x++) {
            if (g_map[z][x] !== 0) continue;
            if (getPlayerBlockHeightAtCell(x, z) > 0) continue;
            if (isCellInSafeZone(x, z)) continue;
            if (Math.abs(x - spawnCell[0]) <= 2 && Math.abs(z - spawnCell[1]) <= 2) continue;
            if (hasUncollectedFlowerAtCell(x, z)) continue;
            if (hasOtherSpikeAtCell(x, z, skipIndex)) continue;
            candidates.push([x, z]);
        }
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function respawnSpikeAtIndex(index) {
    if (index < 0 || index >= g_spikes.length) return;
    let cell = getRandomSpikeCell(index);
    if (!cell) return;
    g_spikes[index].x = cell[0];
    g_spikes[index].z = cell[1];
    g_spikes[index].phase = Math.random() * Math.PI * 2;
    rebuildSpikeMeshes();
}

function rebuildFlowerMeshes() {
    flowersGroup.clear();
    for (let i = 0; i < g_flowers.length; i++) {
        let flower = g_flowers[i];
        flower.meshes = [];
        if (flower.collected) continue;
        let pos = getCellCenterWorld(flower.x, flower.z);
        let root = new THREE.Group();
        root.position.set(pos.x, FLOOR_Y, pos.z);
        root.userData.type = 'flower';
        root.userData.index = i;

        let model = flowerModelPrototype ? flowerModelPrototype.clone(true) : makeFlowerFallback();
        model.traverse(function(obj) {
        obj.userData.type = 'flower';
        obj.userData.index = i;
        if (obj.isMesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;
        }
        });
        root.add(model);

        let flowerSpot = new THREE.SpotLight(0xfff0d8, 3, BLOCK_SIZE * 4.5, Math.PI / 5, 0.5, 1.2);
        flowerSpot.position.set(0, BLOCK_SIZE * 2.1, 0);
        flowerSpot.userData.type = 'flower';
        flowerSpot.userData.index = i;
        let flowerSpotTarget = new THREE.Object3D();
        flowerSpotTarget.position.set(0, 0.03, 0);
        flowerSpotTarget.userData.type = 'flower';
        flowerSpotTarget.userData.index = i;
        root.add(flowerSpotTarget);
        flowerSpot.target = flowerSpotTarget;
        root.add(flowerSpot);

        flower.meshes.push(root, model);
        flowersGroup.add(root);
  }
}

function rebuildSpikeMeshes() {
    if (!spikesGroup) return;
    spikesGroup.clear();
    let spikeGeometry = createSpikeGeometry();
    let spikeCount = g_spikes.length * SPIKES_PER_GROUP;
    let spikeMesh = new THREE.InstancedMesh(spikeGeometry, materials.spike, spikeCount);
    spikeMesh.userData.type = 'spike';
    let glowGeometry = new THREE.CircleGeometry(BLOCK_SIZE * 0.35, 24);
    let glowMesh = new THREE.InstancedMesh(glowGeometry, materials.spikeGlow, g_spikes.length);
    glowMesh.userData.type = 'spikeGlow';
    let offsets = [
        [-0.15, -0.15], [0, -0.15], [0.15, -0.15],
        [-0.15, 0],                 [0.15, 0],
        [-0.15, 0.15],  [0, 0.15],  [0.15, 0.15]
    ];
    let matrix = new THREE.Matrix4();
    let position = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let scale = new THREE.Vector3(1, 1, 1);
    let instanceIndex = 0;

    for (let i = 0; i < g_spikes.length; i++) {
        let spike = g_spikes[i];
        let pos = getCellCenterWorld(spike.x, spike.z);

        for (let j = 0; j < Math.min(SPIKES_PER_GROUP, offsets.length); j++) {
            position.set(
                pos.x + offsets[j][0] * BLOCK_SIZE,
                FLOOR_Y + SPIKE_HEIGHT * 0.5,
                pos.z + offsets[j][1] * BLOCK_SIZE
            );
            rotation.setFromEuler(new THREE.Euler(0, (j % 2) * Math.PI / 4, 0));
            matrix.compose(position, rotation, scale);
            spikeMesh.setMatrixAt(instanceIndex, matrix);
            instanceIndex += 1;
        }

        position.set(pos.x, FLOOR_Y + 0.006, pos.z);
        rotation.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
        scale.set(1, 1, 1);
        matrix.compose(position, rotation, scale);
        glowMesh.setMatrixAt(i, matrix);
    }
    spikeMesh.instanceMatrix.needsUpdate = true;
    glowMesh.instanceMatrix.needsUpdate = true;
    spikesGroup.add(spikeMesh);
    spikesGroup.add(glowMesh);
}

function generateFireflies(count) {
    g_fireflies = [];
    if (!firefliesGroup) return;
    firefliesGroup.clear();
    fireflyMesh = null;
    let geometry = new THREE.SphereGeometry(FIREFLY_RADIUS, 10, 8);
    fireflyMesh = new THREE.InstancedMesh(geometry, materials.firefly, count);
    let matrix = new THREE.Matrix4();
    let position = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let scale = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < count; i++) {
        let x = (Math.random() - 0.5) * g_map[0].length * BLOCK_SIZE * 0.86;
        let z = (Math.random() - 0.5) * g_map.length * BLOCK_SIZE * 0.86;
        let y = FLOOR_Y + 0.45 + Math.random() * 1.45;
        let firefly = {
            baseX: x,
            baseY: y,
            baseZ: z,
            x: x,
            y: y,
            z: z,
            phaseA: Math.random() * Math.PI * 2,
            phaseB: Math.random() * Math.PI * 2,
            speedA: 0.35 + Math.random() * 0.55,
            speedB: 0.22 + Math.random() * 0.45,
            radiusX: 0.16 + Math.random() * 0.38,
            radiusY: 0.08 + Math.random() * 0.22,
            radiusZ: 0.16 + Math.random() * 0.38
        };
        position.set(x, y, z);
        matrix.compose(position, rotation, scale);
        fireflyMesh.setMatrixAt(i, matrix);
        g_fireflies.push(firefly);
    }
    fireflyMesh.instanceMatrix.needsUpdate = true;
    firefliesGroup.add(fireflyMesh);
}

function rebuildGnomeMeshes() {
    gnomesGroup.clear();
    let geometry = new THREE.PlaneGeometry(GNOME_WIDTH, GNOME_HEIGHT);
    for (let i = 0; i < g_gnomes.length; i++) {
        let mesh = new THREE.Mesh(geometry, materials.gnome);
        mesh.userData.type = 'gnome';
        mesh.userData.index = i;
        mesh.position.set(g_gnomes[i].x, FLOOR_Y + GNOME_HEIGHT / 2, g_gnomes[i].z);
        g_gnomes[i].mesh = mesh;
        gnomesGroup.add(mesh);
    }
}

function updateFlowerAnimation(seconds) {
    for (let i = 0; i < g_flowers.length; i++) {
        let flower = g_flowers[i];
        if (flower.collected || !flower.meshes[0]) continue;
        let y = FLOOR_Y + 0.02 * Math.sin(seconds * 2.5 + flower.phase);
        flower.meshes[0].position.y = y;
    }
}

function updateFireflies(seconds) {
    if (!fireflyMesh) return;
    let limitX = g_map[0].length * BLOCK_SIZE * 0.47;
    let limitZ = g_map.length * BLOCK_SIZE * 0.47;
    let matrix = new THREE.Matrix4();
    let position = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let scaleVec = new THREE.Vector3();
    for (let i = 0; i < g_fireflies.length; i++) {
        let f = g_fireflies[i];
        let driftX = Math.sin(seconds * f.speedA + f.phaseA) * f.radiusX +
                     Math.sin(seconds * f.speedB * 0.73 + f.phaseB) * f.radiusX * 0.45;
        let driftZ = Math.cos(seconds * f.speedB + f.phaseB) * f.radiusZ +
                     Math.sin(seconds * f.speedA * 0.61 + f.phaseA) * f.radiusZ * 0.4;
        let driftY = Math.sin(seconds * f.speedA * 1.6 + f.phaseB) * f.radiusY;

        f.x = clamp(f.baseX + driftX, -limitX, limitX);
        f.z = clamp(f.baseZ + driftZ, -limitZ, limitZ);
        f.y = clamp(f.baseY + driftY, FLOOR_Y + 0.25, FLOOR_Y + 2.45);
        let pulse = 0.42 + 0.28 * (0.5 + 0.5 * Math.sin(seconds * 2.0 + f.phaseA));
        let scale = 0.8 + pulse * 1.35;
        position.set(f.x, f.y, f.z);
        scaleVec.setScalar(scale);
        matrix.compose(position, rotation, scaleVec);
        fireflyMesh.setMatrixAt(i, matrix);
    }
    fireflyMesh.instanceMatrix.needsUpdate = true;
}

function updateGnomeMeshes() {
    for (let i = 0; i < g_gnomes.length; i++) {
        let gnome = g_gnomes[i];
        if (!gnome.mesh) continue;
        gnome.mesh.position.set(gnome.x, FLOOR_Y + GNOME_HEIGHT / 2, gnome.z);
        gnome.mesh.lookAt(camera.position.x, gnome.mesh.position.y, camera.position.z);
    }
}

function getRandomOpenCell(avoidCell = null, minCellDistance = 0, avoidFlowers = false, avoidSafeZone = false) {
    let candidates = [];
    let minDistSq = minCellDistance * minCellDistance;
    for (let z = 1; z < g_map.length - 1; z++) {
        for (let x = 1; x < g_map[z].length - 1; x++) {
      if (!isCellWalkableForGnome(x, z)) continue;
      if (avoidFlowers && hasUncollectedFlowerAtCell(x, z)) continue;
      if (hasSpikeAtCell(x, z)) continue;
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

function hasUncollectedFlowerAtCell(x, z) {
    for (let i = 0; i < g_flowers.length; i++) {
        let flower = g_flowers[i];
        if (!flower.collected && flower.x === x && flower.z === z) return true;
    }
  return false;
}

function isCellWalkableForGnome(x, z) {
    if (!isCellInBounds(x, z)) return false;
    if (g_map[z][x] > 0) return false;
    if (getPlayerBlockHeightAtCell(x, z) > 0) return false;
    if (isCellInSafeZone(x, z)) return false;
  return true;
}

function getSpikeAtWorldPos(worldX, worldZ) {
    for (let i = 0; i < g_spikes.length; i++) {
        let spike = g_spikes[i];
        let pos = getCellCenterWorld(spike.x, spike.z);
        if (Math.hypot(worldX - pos.x, worldZ - pos.z) <= SPIKE_COLLISION_RADIUS) {
            return spike;
        }
    }
    return null;
}

function createGnomeAtRandom() {
    let playerCell = worldToMapCell(camera.position.x, camera.position.z);
    let cell =
        getRandomOpenCell(playerCell, 6, true, true) ||
        getRandomOpenCell(playerCell, 3, true, true) ||
        getRandomOpenCell(null, 0, true, true) ||
        getRandomOpenCell();
    if (!cell) return null;
    let pos = getCellCenterWorld(cell[0], cell[1]);
    return { x: pos.x, z: pos.z, path: [], repathTimer: 0, mesh: null };
}

function setGnomeCount(count) {
    let clamped = clamp(Math.round(count), GNOME_MIN_COUNT, GNOME_MAX_COUNT);
    g_gnomeCount = clamped;

    while (g_gnomes.length < g_gnomeCount) {
        let gnome = createGnomeAtRandom();
        if (!gnome) break;
        g_gnomes.push(gnome);
    }
    if (g_gnomes.length > g_gnomeCount) g_gnomes.length = g_gnomeCount;
    if (g_gnomes.length < g_gnomeCount) g_gnomeCount = g_gnomes.length;

    ensureGnomeLaughAudioLoopCount();
    rebuildGnomeMeshes();
    updateStartScreenGnomeCountUI();
}

function respawnGnomeAtIndex(index) {
    if (index < 0 || index >= g_gnomes.length) return;
    let replacement = createGnomeAtRandom();
    if (!replacement) return;
    g_gnomes[index] = replacement;
    rebuildGnomeMeshes();
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
    let pCell = worldToMapCell(camera.position.x, camera.position.z);

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

    if (gnome.repathTimer <= 0) {
        gnome.path = buildPathBFS(gCell[0], gCell[1], pCell[0], pCell[1]);
        gnome.repathTimer = GNOME_REPATH_SECONDS;
    }

    let hasPath = gnome.path.length > 0;
    let targetX = camera.position.x;
    let targetZ = camera.position.z;
    if (hasPath) {
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
        } else {
            gnome.repathTimer = 0;
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
    let nextCellX = worldToMapCell(nextX, gnome.z);
    if (!isCellInSafeZone(nextCellX[0], nextCellX[1]) &&
        canOccupyWithRadius(nextX, probeY, gnome.z, GNOME_RADIUS)) {
        gnome.x = nextX;
    }

    let nextZ = gnome.z + moveZ;
    let nextCellZ = worldToMapCell(gnome.x, nextZ);
    if (!isCellInSafeZone(nextCellZ[0], nextCellZ[1]) &&
        canOccupyWithRadius(gnome.x, probeY, nextZ, GNOME_RADIUS)) {
        gnome.z = nextZ;
    }
}

function updateGnomes(deltaTime) {
    if (!g_gameActive || g_gnomes.length === 0) return;
    for (let i = 0; i < g_gnomes.length; i++) updateSingleGnome(g_gnomes[i], deltaTime);
}

function checkGnomeCatches() {
    if (!g_gameActive || g_gnomes.length === 0 || isPlayerInsideSafeZone()) return;
    for (let i = 0; i < g_gnomes.length; i++) {
        let gnome = g_gnomes[i];
        let dx = camera.position.x - gnome.x;
        let dz = camera.position.z - gnome.z;
        if (dx * dx + dz * dz > GNOME_CATCH_RADIUS * GNOME_CATCH_RADIUS) continue;

        g_captureCount += 1;
        playOneShotAudio(g_oofAudio);
        if (g_collectedFlowers > 0) {
        loseOneCollectedFlower();
        showNotice('The garden gnome caught you! You respawned and lost a flower.');
        } else {
        g_timePenaltySeconds += 10;
        g_elapsedTimeSeconds += 10;
        showNotice('The garden gnome caught you! Since you have no flowers, your time increased by 10 seconds.');
        }

        let gnomeCell = worldToMapCell(gnome.x, gnome.z);
        respawnPlayerRandomly(gnomeCell);
        respawnGnomeAtIndex(i);
        break;
    }
}

function checkSpikeDeaths() {
    if (!g_gameActive) return;

    let playerSpike = getSpikeAtWorldPos(camera.position.x, camera.position.z);
    if (playerSpike) {
        g_spikeDeathCount += 1;
        playOneShotAudio(g_oofAudio);
        showNotice('You stepped on some spikes. Ouch!🤕');
        activateSpikeFogEffect();
        respawnPlayerRandomly([playerSpike.x, playerSpike.z]);
    }

    for (let i = 0; i < g_gnomes.length; i++) {
        let gnome = g_gnomes[i];
        let spike = getSpikeAtWorldPos(gnome.x, gnome.z);
        if (!spike) continue;
        respawnGnomeAtIndex(i);
    }
}

function collectFlowerAtIndex(index) {
    if (index < 0 || index >= g_flowers.length) return false;
    let flower = g_flowers[index];
    if (flower.collected) return false;
    flower.collected = true;
    g_collectedFlowers += 1;
    updateFlowerCounterUI();
    playOneShotAudio(g_collectFlowerAudio);
    clearPlayerBlocks();
    rebuildFlowerMeshes();
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
    rebuildFlowerMeshes();
    return true;
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
    if (changed) rebuildMapMeshes();
}

function respawnPlayerRandomly(avoidCell = null) {
    let cell =
        getRandomOpenCell(avoidCell, 6, false, true) ||
        getRandomOpenCell(avoidCell, 3, false, true) ||
        getRandomOpenCell(null, 0, false, true) ||
        getRandomOpenCell();
    if (!cell) return;
    let pos = getCellCenterWorld(cell[0], cell[1]);
    camera.position.set(pos.x, FLOOR_Y + PLAYER_EYE_HEIGHT, pos.z);
    updateCameraDirectionFromAngles();
}

function respawnPlayerAtSpawn() {
    let pos = getCellCenterWorld(g_spawnCellX, g_spawnCellZ);
    camera.position.set(pos.x, FLOOR_Y + PLAYER_EYE_HEIGHT, pos.z);
    updateCameraDirectionFromAngles();
}

function keepCameraAboveGround() {
    let minEyeY = FLOOR_Y + PLAYER_EYE_HEIGHT;
    if (camera.position.y < minEyeY) camera.position.y = minEyeY;
}

function updateCameraDirectionFromAngles() {
    keepCameraAboveGround();
    let yawRad = THREE.MathUtils.degToRad(g_cameraYaw);
    let pitchRad = THREE.MathUtils.degToRad(g_cameraPitch);
    let cosPitch = Math.cos(pitchRad);
    let dir = new THREE.Vector3(
        Math.cos(yawRad) * cosPitch,
        Math.sin(pitchRad),
        Math.sin(yawRad) * cosPitch
    );
    camera.lookAt(camera.position.clone().add(dir));
}

function tryMoveCamera(moveX, moveZ) {
    keepCameraAboveGround();
    let moved = false;
    let nextX = camera.position.x + moveX;
    if (canOccupy(nextX, camera.position.y, camera.position.z)) {
        camera.position.x = nextX;
        moved = true;
    }
    let nextZ = camera.position.z + moveZ;
    if (canOccupy(camera.position.x, camera.position.y, nextZ)) {
        camera.position.z = nextZ;
        moved = true;
    }
    if (moved) updateCameraDirectionFromAngles();
}

function updateMovement(deltaTime) {
    if (deltaTime <= 0) return;
    let dt = Math.min(deltaTime, 0.05);
    let turnInput = 0;
    if (g_keys.q) turnInput -= 1;
    if (g_keys.e) turnInput += 1;
    if (turnInput !== 0) {
        g_cameraYaw += turnInput * TURN_SPEED_DEG_PER_SEC * dt;
        updateCameraDirectionFromAngles();
    }

    let moveForward = 0;
    let moveRight = 0;
    if (g_keys.w) moveForward += 1;
    if (g_keys.s) moveForward -= 1;
    if (g_keys.d) moveRight += 1;
    if (g_keys.a) moveRight -= 1;

    if (moveForward !== 0 || moveRight !== 0) {
        let yawRad = THREE.MathUtils.degToRad(g_cameraYaw);
        let forwardX = Math.cos(yawRad);
        let forwardZ = Math.sin(yawRad);
        let rightX = -forwardZ;
        let rightZ = forwardX;
        let moveX = forwardX * moveForward + rightX * moveRight;
        let moveZ = forwardZ * moveForward + rightZ * moveRight;
        let moveLen = Math.hypot(moveX, moveZ);
        if (moveLen > 1e-6) {
        let speed = getCurrentMoveSpeed() * dt / moveLen;
        tryMoveCamera(moveX * speed, moveZ * speed);
        }
    }
}

function isSpikeFogEffectActive(nowSeconds = performance.now() / 1000) {
    return nowSeconds < g_spikeFogEffectEndTime;
}

function getCurrentMoveSpeed() {
    return isSpikeFogEffectActive() ? SPIKE_MOVE_SPEED_PER_SEC : MOVE_SPEED_PER_SEC;
}

function setSpikeFogEffectActive(active) {
    if (g_spikeFogEffectActive === active) return;
    g_spikeFogEffectActive = active;
    if (!scene) return;
    if (active) {
        scene.fog = new THREE.FogExp2(SPIKE_FOG_COLOR, SPIKE_FOG_DENSITY);
        playOneShotAudio(g_oofAudio);
    } else {
        scene.fog = new THREE.FogExp2(NORMAL_FOG_COLOR, NORMAL_FOG_DENSITY);
    }
}

function activateSpikeFogEffect() {
    g_spikeFogEffectEndTime = performance.now() / 1000 + SPIKE_FOG_EFFECT_SECONDS;
    setSpikeFogEffectActive(true);
    updateMiniMapUI();
}

function updateSpikeFogEffect(nowSeconds) {
    setSpikeFogEffectActive(isSpikeFogEffectActive(nowSeconds));
}

function clearSpikeFogEffect() {
    g_spikeFogEffectEndTime = 0;
    setSpikeFogEffectActive(false);
    updateMiniMapUI();
}

function getPointerFromClient(clientX, clientY) {
    let rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    return pointer;
}

function handleCanvasClick(clientX, clientY) {
    if (!g_gameActive) return;
    raycaster.setFromCamera(getPointerFromClient(clientX, clientY), camera);
    let interactive = [];
    flowersGroup.traverse(function(obj) {
        if (obj.isMesh) interactive.push(obj);
    });
    gnomesGroup.traverse(function(obj) {
        if (obj.isMesh) interactive.push(obj);
    });
    spikesGroup.traverse(function(obj) {
        if (obj.isMesh) interactive.push(obj);
    });

    let hits = raycaster.intersectObjects(interactive, false);
    if (hits.length === 0) return;
    let picked = hits[0];
    let hit = picked.object.userData;
    if (hit.type === 'flower') {
        collectFlowerAtIndex(hit.index);
    } else if (hit.type === 'gnome') {
        g_gnomesAttackedCount += 1;
        playOneShotAudio(g_gnomeHurtAudio);
        respawnGnomeAtIndex(hit.index);
    } else if (hit.type === 'spike') {
        playOneShotAudio(g_blockAudio, 0.55);
        let spikeIndex = (typeof picked.instanceId === 'number')
            ? Math.floor(picked.instanceId / SPIKES_PER_GROUP)
            : hit.index;
        respawnSpikeAtIndex(spikeIndex);
    } else if (hit.type === 'spikeGlow') {
        playOneShotAudio(g_blockAudio, 0.55);
        respawnSpikeAtIndex(picked.instanceId);
    }
}

function getCursorPickRay() {
    let rect = canvas.getBoundingClientRect();
    let clientX = g_cursorX === null ? rect.left + rect.width / 2 : g_cursorX;
    let clientY = g_cursorY === null ? rect.top + rect.height / 2 : g_cursorY;
    raycaster.setFromCamera(getPointerFromClient(clientX, clientY), camera);
    return raycaster.ray;
}

function getColumnHeightAtCell(x, z) {
    if (!isCellInBounds(x, z)) return 0;
    return g_map[z][x] + getPlayerBlockHeightAtCell(x, z);
}

function getCursorTargetCell(forPlacement) {
    let ray = getCursorPickRay();
    let origin = ray.origin;
    let dir = ray.direction;
    let playerCell = worldToMapCell(camera.position.x, camera.position.z);
    let lastOpenCell = null;
    let enteredMap = false;

    for (let t = BLOCK_PICK_MIN_DIST; t <= BLOCK_PICK_MAX_DIST; t += BLOCK_PICK_STEP) {
        let p = origin.clone().addScaledVector(dir, t);
        let cell = worldToMapCell(p.x, p.z);
        let x = cell[0];
        let z = cell[1];

        if (!isCellInBounds(x, z)) {
        if (enteredMap) break;
        continue;
        }
        enteredMap = true;

        if (x === playerCell[0] && z === playerCell[1] && t < BLOCK_SIZE * 1.4) {
        continue;
        }

        let columnHeight = getColumnHeightAtCell(x, z);
        let columnTop = FLOOR_Y + columnHeight * BLOCK_SIZE;
        let insideColumn = columnHeight > 0 && isInsideColumn(p.x, p.z, x, z) && p.y >= FLOOR_Y && p.y <= columnTop;
        if (insideColumn) {
        if (!forPlacement) return cell;
        return g_map[z][x] === 0 ? cell : lastOpenCell;
        }

        if (p.y <= FLOOR_Y) {
        return cell;
        }

        if (columnHeight === 0) {
        lastOpenCell = cell;
        }
    }

    return null;
}

function addBlock() {
    if (!g_gameActive) return;
    let target = getCursorTargetCell(true);
    if (!target) return;
    let x = target[0];
    let z = target[1];
    if (!isCellInBounds(x, z) || g_map[z][x] > 0 || isCellInSafeZone(x, z)) return;
    g_playerBlocks[z][x] += 1;
    g_blocksPlacedCount += 1;
    playOneShotAudio(g_blockAudio);
    rebuildMapMeshes();
}

function removeBlock() {
    if (!g_gameActive) return;
    let target = getCursorTargetCell(false);
    if (!target) return;
    let x = target[0];
    let z = target[1];
    if (isCellInBounds(x, z) && g_playerBlocks[z][x] > 0) {
        g_playerBlocks[z][x] -= 1;
        playOneShotAudio(g_blockAudio);
        rebuildMapMeshes();
    }
}

function addActionsForHtmlUI() {
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
    document.onkeydown = keydown;
    document.onkeyup = keyup;
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
    if (key === 'f' && !ev.repeat) addBlock();
    if (key === 'g' && !ev.repeat) removeBlock();
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
    if (!loopAudio || !loopAudio.paused) return;
    let playPromise = loopAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function() {});
}

function stopLoopAudio(loopAudio) {
    if (!loopAudio) return;
    loopAudio.pause();
    try { loopAudio.currentTime = 0; } catch (err) {}
}

function playOneShotAudio(sourceAudio, volumeScale = 1.0) {
    if (!sourceAudio) return;
    let shot = sourceAudio.cloneNode(true);
    shot.loop = false;
    let sourceBase = typeof sourceAudio._baseVolume === 'number' ? sourceAudio._baseVolume : clamp(sourceAudio.volume, 0, 1);
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
    if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(forgetShot);
}

function ensureGnomeLaughAudioLoopCount() {
    if (!g_audioInitialized) return;
    while (g_gnomeLaughAudioLoops.length < g_gnomes.length) {
        g_gnomeLaughAudioLoops.push(createAudioClip('../resources/gnomeLaugh.mp3', true, GNOME_LAUGH_MAX_VOLUME));
    }
    while (g_gnomeLaughAudioLoops.length > g_gnomes.length) {
        stopLoopAudio(g_gnomeLaughAudioLoops.pop());
    }
}

function updateGnomeLaughVolumes() {
    if (!g_audioInitialized) return;
    ensureGnomeLaughAudioLoopCount();
    for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) {
        let gain = 0;
        if (i < g_gnomes.length) {
        let dx = camera.position.x - g_gnomes[i].x;
        let dz = camera.position.z - g_gnomes[i].z;
        let distance = Math.hypot(dx, dz);
        let t = clamp((distance - GNOME_LAUGH_NEAR_DIST) / (GNOME_LAUGH_FAR_DIST - GNOME_LAUGH_NEAR_DIST), 0, 1);
        gain = 1 - t;
        }
        g_gnomeLaughAudioLoops[i].volume = applyMasterVolume(GNOME_LAUGH_MAX_VOLUME * gain);
    }
}

function startLoopingGameAudio() {
    initAudio();
    playLoopAudio(g_backgroundMusicAudio);
    ensureGnomeLaughAudioLoopCount();
    for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) playLoopAudio(g_gnomeLaughAudioLoops[i]);
    updateGnomeLaughVolumes();
}

function stopLoopingGameAudio() {
    if (!g_audioInitialized) return;
    stopLoopAudio(g_backgroundMusicAudio);
    for (let i = 0; i < g_gnomeLaughAudioLoops.length; i++) stopLoopAudio(g_gnomeLaughAudioLoops[i]);
}

function setMasterVolume(level) {
    g_masterVolume = clamp(level, 0, 1);
    let clips = [g_backgroundMusicAudio, g_collectFlowerAudio, g_hoorayAudio, g_oofAudio, g_gnomeHurtAudio, g_blockAudio, g_wompAudio];
    for (let i = 0; i < clips.length; i++) {
        if (clips[i] && typeof clips[i]._baseVolume === 'number') clips[i].volume = applyMasterVolume(clips[i]._baseVolume);
    }
    for (let i = 0; i < g_activeOneShots.length; i++) {
        let shot = g_activeOneShots[i];
        if (shot && typeof shot._baseVolume === 'number') shot.volume = applyMasterVolume(shot._baseVolume);
    }
    updateGnomeLaughVolumes();
    let slider = document.getElementById('masterVolumeSlider');
    if (slider) slider.value = String(Math.round(g_masterVolume * 100));
    let readout = document.getElementById('masterVolumeReadout');
    if (readout) readout.textContent = Math.round(g_masterVolume * 100) + '%';
}

function setupPanel(id) {
    let panel = document.getElementById(id);
    if (!panel) {
        panel = document.createElement('div');
        panel.id = id;
        panel.style.position = 'fixed';
        panel.style.zIndex = '20';
        panel.style.padding = '8px 12px';
        panel.style.borderRadius = '6px';
        panel.style.background = 'rgba(0,0,0,0.55)';
        panel.style.color = '#ffffff';
        panel.style.fontFamily = GAME_UI_FONT;
        panel.style.fontSize = '14px';
        panel.style.lineHeight = '1.25';
        panel.style.pointerEvents = 'none';
        document.body.appendChild(panel);
    }
    return panel;
}

function setupFlowerCounterUI() { setupPanel('flowerCounter'); }
function updateFlowerCounterUI() {
    let counter = document.getElementById('flowerCounter');
    if (counter) counter.textContent = '🪻' + g_collectedFlowers + '/' + FLOWER_TARGET + ' flowers collected';
}

function setupTimerUI() { setupPanel('gameTimer'); }
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
    if (timer) timer.textContent = '⏰Time: ' + formatSeconds(g_elapsedTimeSeconds);
}

function findNearestCompassTarget(targets) {
    if (!targets || targets.length === 0) return null;
    let playerCell = worldToMapCell(camera.position.x, camera.position.z);
    let best = null;
    let bestDistSq = Infinity;
    for (let i = 0; i < targets.length; i++) {
        let dx = targets[i][0] - playerCell[0];
        let dz = targets[i][1] - playerCell[1];
        let distSq = dx * dx + dz * dz;
        if (distSq < bestDistSq) {
        bestDistSq = distSq;
        best = { dx: dx, dy: -dz };
        }
    }
    return best;
}

function setupCompassUI() { setupPanel('compassReadout'); }
function updateCompassUI() {
    let compass = document.getElementById('compassReadout');
    if (!compass) return;
    let flowerTargets = g_flowers.filter(f => !f.collected).map(f => [f.x, f.z]);
    let gnomeTargets = g_gnomes.map(g => worldToMapCell(g.x, g.z));
    let flower = findNearestCompassTarget(flowerTargets);
    let gnome = findNearestCompassTarget(gnomeTargets);
    compass.innerHTML =
        (flower ? 'Nearest flower: x = ' + flower.dx + ', y = ' + flower.dy : 'Nearest flower: x = --, y = --') +
        '<br>' +
        (gnome ? 'Nearest gnome: x = ' + gnome.dx + ', y = ' + gnome.dy : 'Nearest gnome: x = --, y = --');
}

function createMiniMapImage(src) {
    let image = new Image();
    image.src = src;
    return image;
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
    }
    g_miniMapWallImage = createMiniMapImage('../resources/brickwall.jpg');
    g_miniMapStoneImage = createMiniMapImage('../resources/stone.jpg');
}

function drawMiniMapCell(ctx, image, x, y, size, fallbackColor) {
    if (image && image.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, x, y, size, size);
    } else {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, size, size);
    }
}

function drawMiniMapMarker(ctx, startX, startY, cellSize, x, z, color, sizeRatio) {
    if (!isCellInBounds(x, z)) return;
    let diameter = Math.max(6, Math.floor(cellSize * sizeRatio));
    let centerX = startX + x * cellSize + cellSize * 0.5;
    let centerY = startY + z * cellSize + cellSize * 0.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, diameter * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.stroke();
}

function getMiniMapStaticKey() {
    let parts = [];
    for (let z = 0; z < g_map.length; z++) {
        parts.push(g_map[z].join(''));
    }
    parts.push('|');
    for (let z = 0; z < g_playerBlocks.length; z++) {
        parts.push(g_playerBlocks[z].join(''));
    }
    return parts.join('/');
}

function updateMiniMapUI() {
    let miniMap = document.getElementById('miniMapCanvas');
    if (!miniMap) return;
    if (!g_gameActive || isSpikeFogEffectActive()) {
        miniMap.style.display = 'none';
        return;
    }
    miniMap.style.display = 'block';
    let width = miniMap.width;
    let height = miniMap.height;
    let rows = g_map.length;
    let cols = g_map[0].length;
    let cellSize = Math.max(2, Math.floor(Math.min((width - MINIMAP_CELL_PADDING_PX * 2) / cols, (height - MINIMAP_CELL_PADDING_PX * 2) / rows)));
    let drawWidth = cellSize * cols;
    let drawHeight = cellSize * rows;
    let startX = Math.floor((width - drawWidth) * 0.5);
    let startY = Math.floor((height - drawHeight) * 0.5);
    let staticKey = getMiniMapStaticKey() + ':' + width + ':' + height;

    if (!g_miniMapStaticCanvas || g_lastMiniMapStaticKey !== staticKey) {
        g_miniMapStaticCanvas = document.createElement('canvas');
        g_miniMapStaticCanvas.width = width;
        g_miniMapStaticCanvas.height = height;
        let staticCtx = g_miniMapStaticCanvas.getContext('2d');
        staticCtx.clearRect(0, 0, width, height);
        staticCtx.fillStyle = 'rgba(0,0,0,0.55)';
        staticCtx.fillRect(0, 0, width, height);

        for (let z = 0; z < rows; z++) {
            for (let x = 0; x < cols; x++) {
                let px = startX + x * cellSize;
                let py = startY + z * cellSize;
                if (g_map[z][x] > 0) drawMiniMapCell(staticCtx, g_miniMapWallImage, px, py, cellSize, '#7f6046');
                else if (getPlayerBlockHeightAtCell(x, z) > 0) drawMiniMapCell(staticCtx, g_miniMapStoneImage, px, py, cellSize, '#8f98a4');
            }
        }

        g_miniMapStaticLayout = { startX: startX, startY: startY, cellSize: cellSize };
        g_lastMiniMapStaticKey = staticKey;
    }

    let ctx = miniMap.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(g_miniMapStaticCanvas, 0, 0);
    startX = g_miniMapStaticLayout.startX;
    startY = g_miniMapStaticLayout.startY;
    cellSize = g_miniMapStaticLayout.cellSize;

    for (let i = 0; i < g_flowers.length; i++) {
        if (!g_flowers[i].collected) drawMiniMapMarker(ctx, startX, startY, cellSize, g_flowers[i].x, g_flowers[i].z, '#b15cff', 1.15);
    }
    for (let i = 0; i < g_gnomes.length; i++) {
        let cell = worldToMapCell(g_gnomes[i].x, g_gnomes[i].z);
        drawMiniMapMarker(ctx, startX, startY, cellSize, cell[0], cell[1], '#38d46d', 1.25);
    }
    let playerCell = worldToMapCell(camera.position.x, camera.position.z);
    drawMiniMapMarker(ctx, startX, startY, cellSize, playerCell[0], playerCell[1], '#ffffff', 1.35);
}

function setupVolumeUI() {
    let panel = document.getElementById('volumePanel');
    if (!panel) {
        panel = setupPanel('volumePanel');
        panel.style.pointerEvents = 'auto';
        panel.innerHTML = '<div style="margin-bottom:6px;">Volume:</div>';
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
        slider.addEventListener('input', function() {
        setMasterVolume(Number(slider.value) / 100);
        });
        let readout = document.createElement('span');
        readout.id = 'masterVolumeReadout';
        readout.textContent = Math.round(g_masterVolume * 100) + '%';
        row.appendChild(slider);
        row.appendChild(readout);
        panel.appendChild(row);
    }
    setMasterVolume(g_masterVolume);
}

function setupNoticeUI() {
    let notice = setupPanel('gameNotice');
    notice.style.zIndex = '25';
    notice.style.maxWidth = '420px';
    notice.style.background = 'rgba(30,30,30,0.85)';
    notice.style.display = 'none';
}

function showNotice(message, durationMs = 7000) {
    let notice = document.getElementById('gameNotice');
    if (!notice) return;
    notice.textContent = message;
    notice.style.display = 'block';
    if (g_noticeClearHandle !== null) clearTimeout(g_noticeClearHandle);
    g_noticeClearHandle = setTimeout(function() {
        notice.style.display = 'none';
        g_noticeClearHandle = null;
    }, durationMs);
}

function setupButton(id, text) {
    let button = document.getElementById(id);
    if (!button) {
        button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.style.position = 'fixed';
        button.style.zIndex = '21';
        button.style.padding = '7px 10px';
        button.style.borderRadius = '6px';
        button.style.border = '1px solid rgba(255,255,255,0.35)';
        button.style.background = 'rgba(0,0,0,0.6)';
        button.style.color = '#ffffff';
        button.style.fontFamily = GAME_UI_FONT;
        button.style.fontSize = '12px';
        button.style.cursor = 'pointer';
        document.body.appendChild(button);
    }
    return button;
}

function setupGiveUpButtonUI() {
    let button = setupButton('giveUpButton', 'Give up?');
    button.onclick = giveUpCurrentRun;
}

function setupGameCompleteUI() {
    let panel = setupPanel('gameCompleteOverlay');
    panel.style.zIndex = '30';
    panel.style.padding = '16px 20px';
    panel.style.background = 'rgba(20,20,20,0.9)';
    panel.style.fontSize = '18px';
    panel.style.textAlign = 'center';
    panel.style.pointerEvents = 'auto';
    panel.style.display = 'none';
}

function showGameCompletePanel(titleText) {
    let panel = document.getElementById('gameCompleteOverlay');
    if (!panel) return;
    panel.innerHTML =
        titleText +
        '<div style="margin-top:10px; font-size:14px; line-height:1.5; text-align:left;">' +
        'Flowers collected: ' + g_collectedFlowers + '<br>' +
        'Garden gnome chasers: ' + g_gnomeCount + '<br>' +
        'Time: ' + formatSeconds(g_elapsedTimeSeconds) + '<br>' +
        'Caught count: ' + g_captureCount + '<br>' +
        'Attack count: ' + g_gnomesAttackedCount + '<br>' +
        'Spike death count: ' + g_spikeDeathCount + '<br>' +
        'Blocks placed: ' + g_blocksPlacedCount +
        '</div>' +
        '<button id="playAgainButton" style="margin-top:14px; padding:8px 12px; font-family:' + GAME_UI_FONT + '; cursor:pointer;">Play again?</button>';
    panel.style.display = 'block';
    let playAgainButton = document.getElementById('playAgainButton');
    if (playAgainButton) playAgainButton.onclick = returnToStartScreen;
}

function finishGameIfComplete() {
    if (!g_gameActive || g_collectedFlowers < FLOWER_TARGET) return;
    g_gameActive = false;
    clearSpikeFogEffect();
    stopLoopingGameAudio();
    playOneShotAudio(g_hoorayAudio);
    showGameCompletePanel('You collected all eight flowers. Good job!😸');
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
        overlay.innerHTML =
        '<div style="font-size:20px;">Gnome Way Out?</div>' +
        '<div style="color:#ffa527; font-size:12px; opacity:0.8; margin-bottom:10px;">Turn on your volume!</div>' +
        '<div id="gnomeCountRow" style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:14px;">' +
        '<span id="startGnomeCountLabel" style="min-width:136px; text-align:center;"></span>' +
        '<button id="gnomeMinusButton">-</button>' +
        '<button id="gnomePlusButton">+</button>' +
        '</div>' +
        '<div style="display:flex; justify-content:center; gap:10px;">' +
        '<button id="startGameButton">Start game</button>' +
        '<button id="startHelpButton">Need help?</button>' +
        '</div>';
        document.body.appendChild(overlay);
        document.getElementById('gnomeMinusButton').onclick = function() {
        if (!g_gameStarted) setGnomeCount(g_gnomeCount - 1);
        };
        document.getElementById('gnomePlusButton').onclick = function() {
        if (!g_gameStarted) setGnomeCount(g_gnomeCount + 1);
        };
        document.getElementById('startGameButton').onclick = startGame;
        document.getElementById('startHelpButton').onclick = showHelpOverlay;
    }
}

function updateStartScreenGnomeCountUI() {
    let label = document.getElementById('startGnomeCountLabel');
    if (label) label.textContent = 'Gnomes: ' + g_gnomeCount;
}

function setupHelpOverlayUI() {
    let help = document.getElementById('helpOverlay');
    if (!help) {
        help = setupPanel('helpOverlay');
        help.style.zIndex = '41';
        help.style.padding = '16px 18px';
        help.style.background = 'rgba(20,20,24,0.94)';
        help.style.pointerEvents = 'auto';
        help.style.minWidth = '260px';
        help.style.maxWidth = '420px';
        help.style.display = 'none';
        help.innerHTML =
        '<div style="font-size:18px; margin-bottom:8px;">📋Rules</div>' +
        '<div style="margin-bottom:10px;">Collect all eight flowers to win! But beware of the garden gnomes who will steal your flowers... ' +
        'Click flowers to collect them. Use WASD to move, Q/E to rotate the camera, and F/G to add or remove stone blocks. ' +
        'While stone blocks may be useful for defending, they disappear each time you collect a flower. ' +
        'When encountering a garden gnome, click on them to attack. If a garden gnome successfully attacks you, you will respawn somewhere else in the maze and lose one flower. ' +
        'If you have no flowers when a garden gnome attacks you, your time will increase by ten seconds. ' +
        'Garden gnomes always respawn—but don\'t worry, you\'ll always hear them when they are nearby. ' +
        'If you need a break, retreat to the safe zone at spawn or create a stone barrier around yourself. Good luck! ' +
        '(Fun fact: the maze is randomized each play, so you\'ll never know what you\'ll get!)</div>' +
        '<button id="closeHelpButton" style="padding:6px 10px; font-family:' + GAME_UI_FONT + '; cursor:pointer;">Close</button>';
        document.getElementById('closeHelpButton').onclick = hideHelpOverlay;
    }
}

function showHelpOverlay() {
    let help = document.getElementById('helpOverlay');
    if (help) help.style.display = 'block';
}

function hideHelpOverlay() {
    let help = document.getElementById('helpOverlay');
    if (help) help.style.display = 'none';
}

function positionUI() {
    let rect = canvas.getBoundingClientRect();
    let timer = document.getElementById('gameTimer');
    let counter = document.getElementById('flowerCounter');
    let compass = document.getElementById('compassReadout');
    let miniMap = document.getElementById('miniMapCanvas');
    let volume = document.getElementById('volumePanel');
    let notice = document.getElementById('gameNotice');
    let giveUp = document.getElementById('giveUpButton');
    let complete = document.getElementById('gameCompleteOverlay');
    let start = document.getElementById('gameStartOverlay');
    let help = document.getElementById('helpOverlay');

    if (timer) {
        timer.style.left = rect.left + 12 + 'px';
        timer.style.top = rect.top + 12 + 'px';
    }
    if (counter) {
        counter.style.left = rect.right - counter.offsetWidth - 12 + 'px';
        counter.style.top = rect.top + 12 + 'px';
    }
    if (compass) {
        compass.style.left = rect.right - compass.offsetWidth - 12 + 'px';
        compass.style.top = rect.top + 58 + 'px';
    }
    if (miniMap) {
        miniMap.style.left = rect.right - 12 + 'px';
        miniMap.style.top = rect.top + 115 + 'px';
    }
    if (volume) {
        volume.style.left = rect.left + 12 + 'px';
        volume.style.top = rect.bottom - volume.offsetHeight - 12 + 'px';
    }
    if (notice) {
        notice.style.left = rect.left + 12 + 'px';
        notice.style.top = rect.top + 70 + 'px';
    }
    if (giveUp) {
        giveUp.style.display = g_gameActive ? 'block' : 'none';
        giveUp.style.left = rect.right - giveUp.offsetWidth - 12 + 'px';
        giveUp.style.top = rect.bottom - giveUp.offsetHeight - 12 + 'px';
    }
    if (complete) {
        complete.style.left = rect.left + rect.width * 0.5 + 'px';
        complete.style.top = rect.top + rect.height * 0.5 + 'px';
        complete.style.transform = 'translate(-50%, -50%)';
    }
    if (start) {
        start.style.display = g_gameStarted ? 'none' : 'block';
        start.style.left = rect.left + rect.width * 0.5 + 'px';
        start.style.top = rect.top + rect.height * 0.5 + 'px';
        start.style.transform = 'translate(-50%, -50%)';
    }
    if (help) {
        help.style.left = rect.left + rect.width * 0.5 + 'px';
        help.style.top = rect.top + rect.height * 0.5 + 'px';
        help.style.transform = 'translate(-50%, -50%)';
    }
}

function returnToStartScreen() {
    g_gameActive = false;
    g_gameStarted = false;
    clearSpikeFogEffect();
    stopLoopingGameAudio();
    hideHelpOverlay();
    let panel = document.getElementById('gameCompleteOverlay');
    if (panel) panel.style.display = 'none';
    g_collectedFlowers = 0;
    g_elapsedTimeSeconds = 0;
    g_timePenaltySeconds = 0;
    g_captureCount = 0;
    g_spikeDeathCount = 0;
    g_gnomesAttackedCount = 0;
    g_blocksPlacedCount = 0;
    clearPlayerBlocks();
    generateSpikes(SPIKE_GROUP_COUNT);
    generateFlowers(FLOWER_TARGET);
    generateFireflies(FIREFLY_COUNT);
    g_gnomes = [];
    setGnomeCount(g_gnomeCount);
    respawnPlayerAtSpawn();
    updateTimerUI();
    updateMiniMapUI();
}

function restartGame() {
    g_gameActive = true;
    g_gameStarted = true;
    clearSpikeFogEffect();
    hideHelpOverlay();
    g_gameStartTime = performance.now() / 1000;
    g_elapsedTimeSeconds = 0;
    g_timePenaltySeconds = 0;
    g_captureCount = 0;
    g_spikeDeathCount = 0;
    g_gnomesAttackedCount = 0;
    g_blocksPlacedCount = 0;
    let panel = document.getElementById('gameCompleteOverlay');
    if (panel) panel.style.display = 'none';
    clearPlayerBlocks();
    generateSpikes(SPIKE_GROUP_COUNT);
    generateFlowers(FLOWER_TARGET);
    generateFireflies(FIREFLY_COUNT);
    g_gnomes = [];
    setGnomeCount(g_gnomeCount);
    respawnPlayerAtSpawn();
    startLoopingGameAudio();
}

function startGame() {
    if (!g_gameActive) restartGame();
}

function giveUpCurrentRun() {
    if (!g_gameActive) return;
    let now = performance.now() / 1000;
    g_elapsedTimeSeconds = (now - g_gameStartTime) + g_timePenaltySeconds;
    g_gameActive = false;
    clearSpikeFogEffect();
    stopLoopingGameAudio();
    playOneShotAudio(g_wompAudio);
    showGameCompletePanel('You gave up this round. Better luck next time!😿');
}

function updateDebugReadout(durationMs) {
    let now = performance.now() / 1000;
    if (now - g_lastDebugUpdateTime < 0.25) return;
    g_lastDebugUpdateTime = now;
    let readout = document.getElementById('numdot');
    if (!readout) return;
    let fps = durationMs > 0 ? Math.floor(10000 / durationMs) / 10 : 0;
    readout.textContent = ' ms: ' + Math.floor(durationMs) + ' fps: ' + fps;
}

function tick() {
    let start = performance.now();
    let nowSeconds = performance.now() / 1000;
    if (g_lastFrameTime === 0) g_lastFrameTime = nowSeconds;
    let deltaTime = nowSeconds - g_lastFrameTime;
    g_lastFrameTime = nowSeconds;
    let seconds = nowSeconds - g_sceneStartTime;
    updateSpikeFogEffect(nowSeconds);

    if (g_gameActive) {
        updateMovement(deltaTime);
        updateGnomes(deltaTime);
        checkSpikeDeaths();
        checkGnomeCatches();
        updateGnomeLaughVolumes();
        g_elapsedTimeSeconds = (performance.now() / 1000 - g_gameStartTime) + g_timePenaltySeconds;
    }

    updateFlowerAnimation(seconds);
    updateFireflies(seconds);
    updateGnomeMeshes();
    if (seconds - g_lastSlowUIUpdateTime > 0.18) {
        updateTimerUI();
        updateCompassUI();
        updateMiniMapUI();
        positionUI();
        g_lastSlowUIUpdateTime = seconds;
    }
    renderer.render(scene, camera);
    updateDebugReadout(performance.now() - start);
}

function main() {
    setupThree();
    g_sceneStartTime = performance.now() / 1000;
    g_lastFrameTime = g_sceneStartTime;
    initMaterials();
    buildStaticScene();
    loadFlowerModel();
    addActionsForHtmlUI();
    initAudio();
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
  ensureMazeInitialized();
  rebuildMapMeshes();
  rebuildFlowerMeshes();
  rebuildSpikeMeshes();
  rebuildGnomeMeshes();
    updateCameraDirectionFromAngles();
    updateFlowerCounterUI();
    updateCompassUI();
    updateMiniMapUI();
    updateStartScreenGnomeCountUI();
    updateTimerUI();
    positionUI();
    renderer.setAnimationLoop(tick);
}

main();
