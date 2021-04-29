import * as THREE from './three.module.js';
import {OrbitControls} from './OrbitControls.js'

// Our Javascript will go here.
let scene;
let camera;
let canvas;
let renderer;
let controls;

function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    canvas = document.querySelector('canvas.webgl');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setClearColor(new THREE.Color('#21282a'), 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // White directional light at half intensity shining from the top.
    const ambientLight = new THREE.AmbientLight(0x999999, 0.5);
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    scene.add(ambientLight);
    scene.add(spotLight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enableDamping = true
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5; // 30 seconds per orbit when fps is 60

    camera.position.z = 5;

    controls.update();

    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    window.addEventListener('resize', () => {
        //Update Sizes
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        //Update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        //update renderer
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}

let topIncal;
let topLine;
let bottomIncal;
let bottomLine;

function drawIncal() {
    const topPyramidGeo = new THREE.ConeGeometry(1, 1, 4, 1, false, 0);
    const topMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 100
    });
    topIncal = new THREE.Mesh(topPyramidGeo, topMaterial);
    const topWireframe = new THREE.WireframeGeometry(topPyramidGeo);
    topLine = new THREE.LineSegments(topWireframe);

    const bottomPyramidGeo = new THREE.ConeGeometry(1, 1, 4, 1, false, 0);
    const bottomMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        specular: 0xffffff,
        shininess: 100
    });
    bottomIncal = new THREE.Mesh(bottomPyramidGeo, bottomMaterial);
    const bottomWireframe = new THREE.WireframeGeometry(bottomPyramidGeo);
    bottomLine = new THREE.LineSegments(bottomWireframe);

    topIncal.position.y = -0.5;
    topLine.position.y = -0.5;
    bottomIncal.scale.y = -1;
    bottomLine.scale.y = -1;
    bottomIncal.position.y = 0.5;
    bottomLine.position.y = 0.5;

    scene.add(topIncal);
    // scene.add(topLine);
    scene.add(bottomIncal);
    // scene.add(bottomLine);    
}

let particlesMesh;

function drawStarField() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 25000;
    const posArray = new Float32Array(particlesCnt * 3);
    for (let i = 0; i < particlesCnt * 3; i++) {

        posArray[i] = (Math.random() - 0.5) * (Math.random() * 150);
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const pointsMaterial = new THREE.PointsMaterial({size: 0.005});
    particlesMesh = new THREE.Points(particlesGeometry, pointsMaterial);

    scene.add(particlesMesh);
}

document.addEventListener('wheel', animateIncal);

function animateIncal(event) {
    let topOffset = topIncal.position.y;
    topIncal.position.y = clamp(topOffset += event.deltaY * 0.001, -0.5, 0.125);
    topOffset = topLine.position.y;
    topLine.position.y = clamp(topOffset += event.deltaY * 0.001, -0.5, 0.125);
    let bottomOffset = bottomIncal.position.y;

    bottomIncal.position.y = clamp(bottomOffset -= event.deltaY * 0.001, -0.125, 0.5);
    bottomOffset = bottomLine.position.y;
    bottomLine.position.y = clamp(bottomOffset -= event.deltaY * 0.001, -0.125, 0.5);
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

document.addEventListener('mousemove', animateParticles);

let mouseX = 0;
let mouseY = 0;

function animateParticles(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

const clock = new THREE.Clock();


function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    particlesMesh.rotation.x = -mouseY * (elapsedTime * 0.00004);
    particlesMesh.rotation.y = mouseX * (elapsedTime * 0.00004);
    controls.update();

    renderer.render(scene, camera);
}

setupScene();
drawIncal();
drawStarField();
animate();
