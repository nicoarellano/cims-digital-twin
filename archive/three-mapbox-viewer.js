// import { models } from "../static/data/cdc-models.js";
// import { IFCLoader } from "../node_modules/web-ifc-three";
// // import { IfcViewerAPI } from '../node_modules/web-ifc-viewer';
// import {
//   AmbientLight,
//   AxesHelper,
//   DirectionalLight,
//   GridHelper,
//   PerspectiveCamera,
//   Scene,
//   WebGLRenderer,
// } from "../node_modules/three";
// import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls";

import { mapStyles } from "../static/map-styles.js";
// Mapbox

mapboxgl.accessToken =
    "pk.eyJ1Ijoibmljby1hcmVsbGFubyIsImEiOiJjbDU2bTA3cmkxa3JzM2luejI2dnd3bzJsIn0.lKKSghBtWMQdXszpTJN32Q";
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: mapStyles[0].url,
    center: [-75.697, 45.384], // starting position [lng, lat]
    zoom: 18, // starting zoom
    pitch: 80,
    antialias: true,
    // projection: "globe", // display the map as a 3D globe
  });
  // Day sky
  map.on("style.load", () => {
    map.setFog({}); // Set the default atmosphere style
  });

  const modelOrigin = [-75.697, 45.384];
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, 0, 0];
   
  const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
  modelOrigin,
  modelAltitude
  );

  // transformation parameters to position, rotate and scale the 3D model onto the map
const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since the 3D model is in real world meters, a scale transform needs to be
    * applied since the CustomLayerInterface expects units in MercatorCoordinates.
    */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    const THREE = window.THREE;
 
// configuration of the custom layer for a 3D model per the CustomLayerInterface
const customLayer = {
id: '3d-model',
type: 'custom',
renderingMode: '3d',
onAdd: function (map, gl) {
this.camera = new THREE.Camera();
this.scene = new THREE.Scene();
 
// create two three.js lights to illuminate the model
const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(0, -70, 100).normalize();
this.scene.add(directionalLight);
 
const directionalLight2 = new THREE.DirectionalLight(0xffffff);
directionalLight2.position.set(0, 70, 100).normalize();
this.scene.add(directionalLight2);
 
// use the three.js GLTF loader to add the 3D model to the three.js scene
const loader = new THREE.GLTFLoader();
loader.load(
'../static/public-glb/CDC-MASSES.glb',
(gltf) => {
this.scene.add(gltf.scene);
}
);
this.map = map;
 
// use the Mapbox GL JS map canvas for three.js
this.renderer = new THREE.WebGLRenderer({
canvas: map.getCanvas(),
context: gl,
antialias: true
});
 
this.renderer.autoClear = false;
},
render: function (gl, matrix) {
const rotationX = new THREE.Matrix4().makeRotationAxis(
new THREE.Vector3(1, 0, 0),
modelTransform.rotateX
);
const rotationY = new THREE.Matrix4().makeRotationAxis(
new THREE.Vector3(0, 1, 0),
modelTransform.rotateY
);
const rotationZ = new THREE.Matrix4().makeRotationAxis(
new THREE.Vector3(0, 0, 1),
modelTransform.rotateZ
);
 
const m = new THREE.Matrix4().fromArray(matrix);
const l = new THREE.Matrix4()
.makeTranslation(
modelTransform.translateX,
modelTransform.translateY,
modelTransform.translateZ
)
.scale(
new THREE.Vector3(
modelTransform.scale,
-modelTransform.scale,
modelTransform.scale
)
)
.multiply(rotationX)
.multiply(rotationY)
.multiply(rotationZ);
 
this.camera.projectionMatrix = m.multiply(l);
this.renderer.resetState();
this.renderer.render(this.scene, this.camera);
this.map.triggerRepaint();
}
};
 
map.on('style.load', () => {
map.addLayer(customLayer, 'waterway-label');
});