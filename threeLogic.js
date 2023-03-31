import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/GLTFLoader.js";

const ambientLight = new THREE.AmbientLight(0x404040);
const pointLight = new THREE.PointLight(0x404040);
pointLight.position.set(1, 1.5, -10);

const frustumValue = 500;

var container, camera, scene, renderer, mixer, clips, raycaster, mouse, ipod, corners = {};

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

    corners.topLeft = topLeft;
    corners.bottomLeft = bottomLeft;
    corners.bottomRight = bottomRight;

    setContentDiv(corners, camera);
  })
});

renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize, false);

renderer.domElement.addEventListener("click", onClick, false);

function onClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const objectName = intersects[0].object.name ?? "";
    if(objectName.includes("Forward")){
      if(currentTrack && currentTrack.next) playTrack(currentTrack.next);
    }else if(objectName.includes("Backward")){
      if(oldTrack) playTrack(oldTrack);
    }else if(objectName.includes("PlayPause")){
      playPause();
    }else if(objectName.includes("Menu")){
      openMenu();
    }
  }
}

function onWindowResize() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.left = innerWidth / - frustumValue;
  camera.right = innerWidth / frustumValue;
  camera.top = innerHeight / frustumValue;
  camera.bottom = innerHeight / - frustumValue;
  camera.updateProjectionMatrix();

  setContentDiv(corners, camera);
}

const clock = new THREE.Clock();
function render() {
  if(menu.classList.contains('active')) return;
  mixer?.update(clock.getDelta());
  ipod && camera.lookAt(ipod.position);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);