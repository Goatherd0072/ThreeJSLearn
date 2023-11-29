import {ModelPoint} from "./PointGenerater.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export default class ModelLoader {
    constructor(scene) {
        const gltfLoader = new GLTFLoader();
        this.model_Logos = [];
        new AddModel(scene);

        function AddModel(Scene) {
            let model_Logo = [];
            let that = this;
            gltfLoader.load("./model/Logo_p60_newnew.gltf", (gltf) => {
                console.log(gltf);

                for (let i = 0; i < gltf.scene.children.length; i++) {
                    console.log(model_Logo);
                    model_Logo.push(new ModelPoint(
                        gltf.scene.children[i],
                        0.025,
                        "#00ABD1"
                    ));
                    //model_Logo[i].geometry.position.set(0, 0, 0);
                    model_Logo[i].geometry.scale.set(1, 1, 1);
                    model_Logo[i].geometry.position.set(0, 0, i*100);
                    //model_Logo[i].geometry.rotateY(45);
                    // Scene.add(model_Logo[i].geometry);
                    // var mat = model_Logo[i].material;
                    console.log(model_Logo.length);
                    Scene.add(model_Logo[i].geometry);
                }
                that.model_Logos = model_Logo;
            });
        }

    }

    GetModels() {
        if (this.model_Logos === []) {
            console.log("models is null");
            return null;
        } else {
            return  this.model_Logos;
        }
    }
}

export {ModelLoader};
