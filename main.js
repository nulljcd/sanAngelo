/* 
 * initialize game engine
 */
const j = new JSE2();

// setup screen
j.init(document.querySelector('#screen'), 0, 0, 1.6);

j.screen.setSizeToWindow();
window.onresize = () => j.screen.setSizeToWindow();

// load assets
const assets = [
  'assets/images/cursor/default.png',
  'assets/images/cursor/crosshair.png',
];
j.assetHandler.assets.load(assets);

/*
 * custom game classes
 */
class Cursor {
  constructor() {
    this.position = new j.Vector2();

    this.currentAnimation = 0;
    this.animations = [
      new j.Animation([j.assetHandler.assets.get('assets/images/cursor/default.png')], 0),
      new j.Animation([j.assetHandler.assets.get('assets/images/cursor/crosshair.png')], 0)];

    this.sprite = new j.ImageSprite(
      this.animations,
      this.position.clone(),
      new j.Vector2(0.08, 0.08));
  }

  updateAnimations() {
    this.sprite.currentAnimation = this.currentAnimation;
  }

  updatePosition() {
    if (this.currentAnimation == 0) {
      // default
      this.position.copy(j.inputHandler.mouse.position);
    } else if (this.currentAnimation == 1) {
      // crosshair
      this.position.copy(j.inputHandler.mouse.position.subtract(this.sprite.scale.multiplyScaler(0.5)));
    }

    // update sprite position
    this.sprite.position = this.position.clone();
  }

  update() {
    this.updatePosition();
    this.updateAnimations();
  }
}

class Player {
  constructor() {
    this.position = new j.Vector2();

    this.sprite = new j.ImageSprite(
      [],
      new j.Vector2(-0.08, -0.08),
      new j.Vector2(0.16, 0.16));

    this.hitBox = new j.HitBox(
      new j.Vector2(-0.08, -0.08),
      new j.Vector2(0.16, 0.16));
  }

  update() {
    
  }
}

class Wall {
  constructor(position) {
    this.position = position;
    this.scale = new j.Vector2(0.16, 0.16);

    this.sprite = new j.ImageSprite(
      [],
      this.position.clone(),
      this.scale.clone());

    this.hitBox = new j.HitBox(
      this.position.clone(),
      this.scale.clone());
  }
}

class Enimy {
  constructor(position, direction) {
    this.position = position;
    this.direction = direction;

    this.sprite = new j.ImageSprite(
      [],
      this.position.clone(),
      this.scale.clone());

    this.hitBox = new j.HitBox(
      this.position.clone(),
      this.scale.clone());
  }

  update() {

  }
}

/*
 * the game variables
 */
let world = {
  cursor: null,
  player: null,
  static: [],
  dynamic: [],
};

/*
 * all the scenes
 */
let sceneNum = 0;
let scenes = [
  { // start screen
    setup: () => {
      // set background
      j.screen.background = '#555';

      world.cursor = new Cursor();

      j.gameLoop.start();
    },
    update: () => {
      world.cursor.update();
    }
  }
];

/*
 * main setup and update functions
 */

// setup scene when the assets load
j.assetHandler.assets.onLoad = () => {
  scenes[sceneNum].setup();
};

// update the game on every game update tick
j.gameLoop.onUpdate = () => {
  scenes[sceneNum].update();
};