// space.js – Enhanced animated space background with beautiful shooting stars

// === Setup renderer and scene ===
const canvas = document.getElementById("space");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030617); // deep navy background
scene.fog = new THREE.FogExp2(0x030617, 0.0008); // soft depth haze

// === Camera setup ===
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1;

// === Starfield ===
const starCount = 1200;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;

  let x, y, z;
  do {
    x = (Math.random() - 0.5) * 2000;
    y = (Math.random() - 0.5) * 2000;
    z = (Math.random() - 0.5) * 2000;
  } while (Math.sqrt(x * x + y * y + z * z) < 200); // avoid close stars

  positions[i3] = x;
  positions[i3 + 1] = y;
  positions[i3 + 2] = z;

  // blue–purple hues for cohesive "spacey" palette
  const hue = 0.6 + Math.random() * 0.2;
  const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
  colors[i3] = color.r;
  colors[i3 + 1] = color.g;
  colors[i3 + 2] = color.b;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 1.2,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const stars = new THREE.Points(geometry, starMaterial);
scene.add(stars);

// === Optional: faint nebula layer (requires assets/nebula.png) ===
const loader = new THREE.TextureLoader();
loader.load("assets/nebula.png", (nebulaTexture) => {
  const nebulaMaterial = new THREE.MeshBasicMaterial({
    map: nebulaTexture,
    transparent: true,
    opacity: 0.25,
    depthWrite: false
  });
  const nebula = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 2000),
    nebulaMaterial
  );
  nebula.position.z = -500;
  scene.add(nebula);
});

// === Enhanced Shooting Stars ===
const shootingStars = [];
const shootingStarCount = 5;

function createShootingStar() {
  const group = new THREE.Group();
  
  // Create gradient trail with multiple segments
  const trailLength = 8;
  const trailSegments = [];
  
  for (let i = 0; i < trailLength; i++) {
    const segmentGeometry = new THREE.BufferGeometry();
    const segmentPositions = new Float32Array(6); // 2 vertices * 3 coordinates
    segmentGeometry.setAttribute("position", new THREE.BufferAttribute(segmentPositions, 3));
    
    // Color transitions from bright cyan/white to transparent
    const brightness = 1 - (i / trailLength);
    const color = new THREE.Color().setHSL(0.52, 1, 0.5 + brightness * 0.3);
    
    const segmentMaterial = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: brightness * 0.9,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });
    
    const segment = new THREE.Line(segmentGeometry, segmentMaterial);
    trailSegments.push(segment);
    group.add(segment);
  }
  
  // Add glowing head particle
  const headGeometry = new THREE.SphereGeometry(1.5, 8, 8);
  const headMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  group.add(head);
  
  // Add outer glow
  const glowGeometry = new THREE.SphereGeometry(3, 8, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ddeb,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);
  
  // Position the shooting star
  group.position.x = (Math.random() - 0.5) * 800;
  group.position.y = (Math.random() - 0.5) * 400 + 200;
  group.position.z = -500 + Math.random() * 400;
  
  // Random angle for diagonal movement
  const angle = Math.random() * Math.PI / 4 - Math.PI / 8; // -22.5 to 22.5 degrees
  
  group.userData = {
    velocity: new THREE.Vector3(
      Math.cos(angle) * (Math.random() * 3 + 5),
      -Math.sin(angle) * (Math.random() * 2 + 3) - 4,
      Math.random() * 2 + 8
    ),
    life: 0,
    maxLife: 120 + Math.random() * 100,
    trailSegments: trailSegments,
    head: head,
    glow: glow,
    previousPositions: []
  };
  
  scene.add(group);
  shootingStars.push(group);
}

// Create shooting stars at random intervals
setInterval(() => {
  if (shootingStars.length < shootingStarCount) createShootingStar();
}, 2000 + Math.random() * 3000);

// === Animation loop ===
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.001;

  // gentle camera drift
  camera.position.x = Math.sin(t) * 5;
  camera.position.y = Math.cos(t / 2) * 3;

  stars.rotation.y += 0.0005;
  stars.rotation.x += 0.0002;

  // update shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    const data = star.userData;
    
    // Store current position
    data.previousPositions.unshift(star.position.clone());
    if (data.previousPositions.length > data.trailSegments.length) {
      data.previousPositions.pop();
    }
    
    // Move the shooting star
    star.position.add(data.velocity);
    data.life++;
    
    // Update trail segments to follow the path
    for (let j = 0; j < data.trailSegments.length; j++) {
      const segment = data.trailSegments[j];
      const positions = segment.geometry.attributes.position.array;
      
      if (j === 0) {
        // First segment connects to head
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0;
        
        if (data.previousPositions[j]) {
          const prevPos = data.previousPositions[j];
          positions[3] = prevPos.x - star.position.x;
          positions[4] = prevPos.y - star.position.y;
          positions[5] = prevPos.z - star.position.z;
        }
      } else if (data.previousPositions[j - 1] && data.previousPositions[j]) {
        const pos1 = data.previousPositions[j - 1];
        const pos2 = data.previousPositions[j];
        positions[0] = pos1.x - star.position.x;
        positions[1] = pos1.y - star.position.y;
        positions[2] = pos1.z - star.position.z;
        positions[3] = pos2.x - star.position.x;
        positions[4] = pos2.y - star.position.y;
        positions[5] = pos2.z - star.position.z;
      }
      
      segment.geometry.attributes.position.needsUpdate = true;
      
      // Fade out the trail and the segment
      const lifeFactor = data.life / data.maxLife;
      const segmentFade = (1 - (j / data.trailSegments.length)) * (1 - lifeFactor);
      segment.material.opacity = segmentFade * 0.9;
    }
    
    // Fade out head and glow
    const lifeFactor = data.life / data.maxLife;
    data.head.material.opacity = 1 - lifeFactor;
    data.glow.material.opacity = (1 - lifeFactor) * 0.5;
    
    // Pulse the glow
    const pulseScale = 1 + Math.sin(data.life * 0.2) * 0.3;
    data.glow.scale.set(pulseScale, pulseScale, pulseScale);
    
    // Remove when life expires
    if (data.life > data.maxLife) {
      scene.remove(star);
      shootingStars.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

animate();

// === Responsiveness ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});