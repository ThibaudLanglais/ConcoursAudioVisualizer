import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/GLTFLoader.js";

const ambientLight = new THREE.AmbientLight(0x404040);
const pointLight = new THREE.PointLight(0x404040);
pointLight.position.set(1, 1.5, -10);

const frustumValue = 500;

var container, camera, scene, renderer, mixer, clips, raycaster, mouse, ipod;

container = document.createElement("div");
document.body.appendChild(container);

camera = new THREE.OrthographicCamera(innerWidth / - frustumValue, innerWidth / frustumValue, innerHeight / frustumValue, innerHeight / - frustumValue, 1, 1000);
camera.position.set(0, 0, -8);

scene = new THREE.Scene();

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

var loader = new GLTFLoader().setPath("./");
loader.load("ipod.glb", function (gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);
  clips = gltf.animations;
  ipod = gltf.scene
  scene.add(ambientLight)
  scene.add(pointLight)
  scene.add(gltf.scene);

  const clip = THREE.AnimationClip.findByName(clips, "CubeAction");
  const action = mixer.clipAction(clip);
  action.clampWhenFinished = true;
  action.setLoop(THREE.LoopOnce);
  action.play();
  mixer.addEventListener('finished', () => {
    var topLeft = gltf.scene.children[0].children.filter(el => el.userData?.name == "TopLeft")[0];
    var bottomLeft = gltf.scene.children[0].children.filter(el => el.userData?.name == "BottomLeft")[0];
    var bottomRight = gltf.scene.children[0].children.filter(el => el.userData?.name == "BottomRight")[0];
    if(topLeft && bottomLeft && bottomRight){
      topLeft = WorldToScreenCoordinates(topLeft);
      bottomLeft = WorldToScreenCoordinates(bottomLeft);
      bottomRight = WorldToScreenCoordinates(bottomRight);
      const contentDiv = document.querySelector('#content');
      contentDiv.style.left = `${topLeft.x}px`;
      contentDiv.style.top = `${topLeft.y}px`;
      contentDiv.style.width = `${bottomRight.x - topLeft.x}px`;
      contentDiv.style.height = `${bottomLeft.y - topLeft.y}px`;
    }
    document.body.classList.add('ready')
  })
});

renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

var pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

window.addEventListener("resize", onWindowResize, false);

renderer.domElement.addEventListener("click", onClick, false);

function onClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    console.log("Intersection:", intersects[0]);
  }
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const clock = new THREE.Clock();
function render() {
  mixer?.update(clock.getDelta());
  ipod && camera.lookAt(ipod.position);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);

function WorldToScreenCoordinates(object){
  var widthHalf = innerWidth / 2, heightHalf = innerHeight / 2;
  var pos = object.getWorldPosition().clone();
  pos.project(camera);
  pos.x = ( pos.x * widthHalf ) + widthHalf;
  pos.y = - ( pos.y * heightHalf ) + heightHalf;
  return pos;
}
