import assert from "node:assert/strict";
import { loadQorvyntGLTFCharacter } from "../engine/qorvynt-gltf-pipeline.js";

class Vector3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
}
class Group {
  constructor(){this.children=[];this.userData={};this.position=new Vector3();this.scale={value:1,multiplyScalar(n){this.value*=n}};this.rotation=new Vector3();this.name=""}
  add(child){this.children.push(child);child.parent=this}
  remove(child){this.children=this.children.filter(x=>x!==child)}
  traverse(fn){fn(this);for(const child of this.children)child.traverse?child.traverse(fn):fn(child)}
  updateMatrixWorld(){}
}
class Box3 {
  setFromObject(){this.min=new Vector3(-.5,0,-.5);this.max=new Vector3(.5,2,.5);return this}
  getSize(target){target.x=this.max.x-this.min.x;target.y=this.max.y-this.min.y;target.z=this.max.z-this.min.z;return target}
  getCenter(target){target.x=0;target.y=1;target.z=0;return target}
}
class Action {
  constructor(clip){this.clip=clip;this.running=false;this.enabled=false}
  setLoop(mode,count){this.loop={mode,count};return this}
  reset(){this.running=false;return this}
  play(){this.running=true;return this}
  crossFadeFrom(previous,duration){this.crossFade={previous,duration};return this}
  isRunning(){return this.running}
}
class AnimationMixer {
  constructor(root){this.root=root;this.actions=[]}
  clipAction(clip){const action=new Action(clip);this.actions.push(action);return action}
  update(delta){this.delta=delta}
  stopAllAction(){this.stopped=true}
}
const THREE={Group,AnimationMixer,Box3,Vector3,LoopOnce:2200,LoopRepeat:2201};
const clips=["Idle","Walk Cycle","Run","Jump","Pulse Attack"].map(name=>({name,duration:1,tracks:[]}));
class FakeGLTFLoader {
  async loadAsync(url){
    assert.equal(url,"blob:qorvynt-test");
    const model=new Group();model.name="TestHero";
    const mesh={isMesh:true,isSkinnedMesh:true,name:"HeroMesh",geometry:{disposed:false,dispose(){this.disposed=true}},material:{dispose(){this.disposed=true}},skeleton:{bones:["Hips","Spine","Head","LeftUpperLeg","RightUpperLeg"].map(name=>({name}))},traverse(fn){fn(this)}};
    model.add(mesh);
    return {scene:model,animations:clips};
  }
}
const character=await loadQorvyntGLTFCharacter(THREE,"blob:qorvynt-test",{GLTFLoader:FakeGLTFLoader,targetHeight:3});
assert.equal(character.boneNames.size,5);
assert.equal(character.actions.size,5);
assert.equal(character.root.userData.qorvyntRig.format,"glTF");
assert.equal(character.activeClip,"idle");
assert.equal(character.play("walk"),true);
assert.equal(character.activeClip,"walk");
assert.equal(character.actions.get("walk").crossFade.previous.clip.name,"Idle");
character.update(.016);
assert.equal(character.mixer.delta,.016);
assert.equal(character.play("jump"),true);
assert.equal(character.actions.get("jump").loop.mode,THREE.LoopOnce);
assert.equal(character.play("attack"),true);
assert.equal(character.actions.get("attack").loop.mode,THREE.LoopOnce);
character.dispose();
assert.equal(character.mixer.stopped,true);
await assert.rejects(()=>loadQorvyntGLTFCharacter(THREE,"file:///tmp/hero.glb",{GLTFLoader:FakeGLTFLoader}),/HTTP\(S\) or a local browser Blob URL/);
console.log("GLTF pipeline unit tests passed: skinned mesh, bone discovery, clip aliases, cross-fades, one-shots, disposal and URL validation.");
