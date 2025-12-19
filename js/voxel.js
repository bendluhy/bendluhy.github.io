// ✅ CDN ES-module imports (NO "three" specifier)
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

/* -------------------- desktop detection -------------------- */
function isDesktop() {
  return !window.matchMedia("(pointer: coarse)").matches &&
         window.innerWidth > 800;
}

const canvas   = document.getElementById("voxel-canvas");
const overlay  = document.getElementById("overlay");
const startBtn = document.getElementById("startVoxel");
const fallback = document.getElementById("fallback");

if (!isDesktop()) {
  overlay.style.display = "none";
  fallback.style.display = "block";
}

/* -------------------- scene bootstrap -------------------- */
startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  init();
}, { once: true });

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020617);

  const camera = new THREE.PerspectiveCamera(
    70,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(8, 8, 8);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);

  /* -------------------- lighting -------------------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  /* -------------------- voxels -------------------- */
  const voxelGeo = new THREE.BoxGeometry(1, 1, 1);
  const defaultColor = 0x7dd3fc;
  const voxelMat = new THREE.MeshStandardMaterial({
    color: defaultColor,
    roughness: 0.7
  });
  let currentColor = defaultColor;
  const hexStr = (val) => val.toString(16).padStart(6, "0");

  const voxels = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;

  function addVoxel(x, y, z) {
    const k = key(x, y, z);
    if (voxels.has(k)) return;

    const mat = voxelMat.clone();
    mat.color.set(currentColor);
    const m = new THREE.Mesh(voxelGeo, mat);
    m.position.set(x + 0.5, y + 0.5, z + 0.5);
    scene.add(m);
    voxels.set(k, m);
  }

  function removeVoxel(x, y, z) {
    const k = key(x, y, z);
    const m = voxels.get(k);
    if (!m) return;
    scene.remove(m);
    voxels.delete(k);
  }

  /* -------------------- ground -------------------- */
  for (let x = -10; x <= 10; x++) {
    for (let z = -10; z <= 10; z++) {
      addVoxel(x, 0, z);
    }
  }

  /* -------------------- color picker -------------------- */
  const swatches = document.querySelectorAll("[data-voxel-color]");

  function selectColor(hex) {
    currentColor = hex;
    voxelMat.color.set(hex); // keep template updated for clones
    const target = hexStr(hex);
    swatches.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.voxelColor.toLowerCase() === target);
    });
  }

  swatches.forEach((btn) => {
    btn.addEventListener("click", () => {
      const hex = parseInt(btn.dataset.voxelColor, 16);
      selectColor(hex);
    });
  });

  // set initial active
  selectColor(defaultColor);

  /* -------------------- raycasting -------------------- */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function updateMouseFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  canvas.addEventListener("mousedown", (e) => {
    updateMouseFromEvent(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects([...voxels.values()]);
    if (!hits.length) return;

    const hit = hits[0];
    const p = hit.object.position;

    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const z = Math.floor(p.z);

    if (e.shiftKey) {
      removeVoxel(x, y, z);
    } else {
      const n = hit.face.normal;
      addVoxel(x + n.x, y + n.y, z + n.z);
    }
  });

  /* -------------------- resize -------------------- */
  window.addEventListener("resize", () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  /* -------------------- loop -------------------- */
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
