import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const palette = [0xb9ee7b, 0x83c8ef, 0xeeb97b, 0xc6a0f6, 0xf38ba8, 0x89dceb, 0xf9e2af, 0xa6e3a1];

export function createRenderer(container) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x17221b);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2.1; controls.minDistance = 3; controls.maxDistance = 80;
  scene.add(new THREE.HemisphereLight(0xd6efcf, 0x303b2e, 2.3));
  const light = new THREE.DirectionalLight(0xf0ffd8, 3); light.position.set(5, 15, 3); light.castShadow = true; light.shadow.mapSize.set(2048, 2048); light.shadow.camera.left = -30; light.shadow.camera.right = 30; light.shadow.camera.top = 30; light.shadow.camera.bottom = -30; scene.add(light);
  let root = new THREE.Group(); scene.add(root); let world, robots = [], beams = [], showRays = true;
  const disposeRoot = () => { root.traverse(o => { o.geometry?.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); }); scene.remove(root); };
  function box(w, h, d, x, y, z, color) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness:0.85 }));
    mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); return mesh;
  }
  function setWorld(input) {
    disposeRoot(); root = new THREE.Group(); scene.add(root); world = input; robots = []; beams = [];
    box(world.width, 0.12, world.height, world.width/2, -0.08, -world.height/2, 0x26382a);
    const grid = new THREE.GridHelper(Math.max(world.width,world.height), Math.max(world.width,world.height), 0x506247, 0x344a34); grid.position.set(world.width/2,0,-world.height/2); root.add(grid);
    if (world.scenario?.type === 'sumo') {
      const ring = new THREE.Mesh(new THREE.CircleGeometry(world.scenario.radius,96),new THREE.MeshStandardMaterial({color:0x18241b,roughness:.9})); ring.rotation.x=-Math.PI/2;ring.position.set(world.scenario.x,.012,-world.scenario.y);ring.receiveShadow=true;root.add(ring);
      const edge = new THREE.Mesh(new THREE.RingGeometry(world.scenario.radius-.1,world.scenario.radius,96),new THREE.MeshBasicMaterial({color:0xd8e9bf,side:THREE.DoubleSide}));edge.rotation.x=-Math.PI/2;edge.position.set(world.scenario.x,.018,-world.scenario.y);root.add(edge);
    }
    box(world.width+.2,.35,.12,world.width/2,.12,0,0x4c6541); box(world.width+.2,.35,.12,world.width/2,.12,-world.height,0x4c6541);
    box(.12,.35,world.height,0,.12,-world.height/2,0x4c6541); box(.12,.35,world.height,world.width,.12,-world.height/2,0x4c6541);
    world.obstacles.forEach(o => box(o.width,.65,o.height,o.x+o.width/2,.325,-o.y-o.height/2,0x718569));
    world.robots.forEach((r,i) => {
      const group = new THREE.Group(); const material = new THREE.MeshStandardMaterial({ color:palette[i], roughness:.4 });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r.radius,r.radius,.22,32), material); body.position.y=.22; body.castShadow=true; group.add(body);
      for (const side of [-1,1]) { const wheel = new THREE.Mesh(new THREE.BoxGeometry(r.radius*.85,.23,.09),new THREE.MeshStandardMaterial({color:0x0d1710})); wheel.position.set(0,.15,side*r.radius); group.add(wheel); }
      const marker = new THREE.Mesh(new THREE.BoxGeometry(r.radius*.7,.03,.07),new THREE.MeshStandardMaterial({color:0x22321d})); marker.position.set(r.radius*.45,.345,0); group.add(marker);
      root.add(group); robots.push(group);
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(r.laser.rays*6),3));
      const lines = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:palette[i],transparent:true,opacity:.45})); lines.frustumCulled=false; root.add(lines); beams.push(lines);
    });
    controls.target.set(world.width/2,0,-world.height/2); camera.position.set(world.width/2+8,14,-world.height/2+12); controls.update();
  }
  function draw(state, selected) {
    state.robots.forEach((r,i) => {
      robots[i].position.set(r.x,0,-r.y); robots[i].rotation.y=r.theta;
      robots[i].scale.setScalar(r.id === selected ? 1.03 : 1);
      const array = beams[i].geometry.attributes.position.array;
      r.scan.forEach((distance,j) => { const a=r.theta+(r.laser.rays===1?0:-r.laser.fov/2+j*r.laser.fov/(r.laser.rays-1)); array.set([r.x,.3,-r.y,r.x+Math.cos(a)*distance,.3,-r.y-Math.sin(a)*distance],j*6); });
      beams[i].geometry.attributes.position.needsUpdate=true; beams[i].visible=showRays;
    });
    const width=container.clientWidth || 600, height=container.clientHeight || 420;
    renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix(); controls.update(); renderer.render(scene,camera);
  }
  return { setWorld, draw, setRays: value => {showRays=value;}, dispose: () => {disposeRoot(); controls.dispose(); renderer.dispose(); renderer.domElement.remove();} };
}
