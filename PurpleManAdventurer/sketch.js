let player, playing, pImg, purpleheart, maptiles, tileSize = 64, tileMap, score = 0, potionImg, port, joyX, joyY, sw;
const DEAD_ZONE = 30;

function preload() {
  player = new Player(loadImage("etc/purpleboy.png"));
  maptiles = loadImage("etc/maps.png");
  potionImg = loadImage("etc/potion.png");
  purpleheart = loadImage("etc/purpleheart.png");
}

/* ************************ HARDWARE ************************ */

function connect() {
  if (!port.opened()) {
    port.open("Arduino", 9600);
  } else {
    port.close();
  }
}

function setup() {
  port = createSerial();
  createCanvas(windowWidth, windowHeight);
  connectButton = createButton("Connect");
  connectButton.mousePressed(connect);
  createGame();
}

function movement() {
  let str = port.readUntil("\n");
  let values = str.split(",");

  if (values.length > 2) {
    const [xVal, yVal, swVal] = values;
    joyX = parseInt(xVal);
    joyY = parseInt(yVal);
    sw = Number(swVal);
  
    const deadzone = 150;
    const p = player.sprite;
  
    if (joyX < -deadzone) {
      Object.assign(p.vel, { x: -3 });
      p.ani = "run";
      p.mirror.x = true;
    } else if (joyX > deadzone) {
      Object.assign(p.vel, { x: 3 });
      p.ani = "run";
      p.mirror.x = false;
    } else {
      p.vel.x = 0;
      p.ani = "stand";
    }
  
    const isJumpPressed = sw === 1;
    const isOnGround = p.colliding(walkable);
  
    if (isJumpPressed && isOnGround) {
      p.vel.y = -10;
      sounds.player("jump").start();
    }
  }
  
}

/* ************************ SOUND ************************ */

const spike = new Tone.Synth({
  oscillator: { type: "square" },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 0.5,
  },
}).toDestination();

const potionSound = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.001,
    decay: 0.4,
    sustain: 0.01,
    release: 0.4,
  }
}).chain(
  new Tone.Vibrato(5, 0.5),
  new Tone.Freeverb(0.3),
  Tone.Destination
);
potionSound.volume.value = -8;

let sounds = new Tone.Players({
  jump: "etc/whoosh.wav",
}).toDestination();

let spaceSynth = new Tone.MonoSynth({
  oscillator: {
    type: "fatsawtooth",
    count: 3,
    spread: 30
  },
  envelope: {
    attack: 0.5,
    decay: 1.5,
    sustain: 0.4,
    release: 2.0
  },
  filterEnvelope: {
    attack: 0.5,
    baseFrequency: 200,
    octaves: 4
  }
}).chain(
  new Tone.Freeverb(0.8, 0.7),
  new Tone.FeedbackDelay("8n", 0.5),
  Tone.Destination
);
spaceSynth.volume.value = -12;

const spaceSong = 
[
  { time: "0:0:0", note: "tile2", duration: "1n" },
  { time: "0:0:0", note: "C3", duration: "2n" },
  { time: "0:1:0", note: "G#2", duration: "1n" },
  { time: "0:1:0", note: "D#3", duration: "2n" },
  { time: "0:2:0", note: "A2", duration: "1n" },
  { time: "0:2:0", note: "E3", duration: "2n" },
  { time: "0:3:0", note: "B2", duration: "1n" },
  { time: "0:3:0", note: "F#3", duration: "2n" }
];

const spaceTrack = new Tone.Part((time, note) => {
  spaceSynth.triggerAttackRelease(note.note, note.duration, time);
}, spaceSong);
spaceTrack.loop = true;
spaceTrack.loopEnd = "0:3:0";

let noisePad = new Tone.NoiseSynth({
  noise: { type: "brown" },
  envelope: { attack: 5, sustain: 1, release: 5 }
}).chain(
  new Tone.Filter(200, "lowpass"),
  new Tone.Panner(-0.5),
  Tone.Destination
);
noisePad.volume.value = -25;


/* ************************ GAME STATE ************************ */

function draw() 
{
  clear();
  background("black");
  checkPlaying();
}

  function createGame() {
    playing = false;
    world.gravity.y = 12;
    world.autoStep = false;
    player.sprite.w = 50;
    player.sprite.h = 60;
    walkable = new Group(); 
    walkable.layer = 1;
  
    const createTile = (group, tileX, tileY, tileCode, options = {}) => {
      const img = getTile(tileX, tileY);
      const newTile = new group.Group();
      
      newTile.w = options.width || tileSize;
      newTile.h = options.height || tileSize;
      newTile.tile = tileCode;
      newTile.collider = options.collider || "static";
      newTile.image = img;
      
      if (options.y !== undefined) newTile.y = options.y;
      if (options.debug !== undefined) newTile.debug = options.debug;
      
      return newTile;
    };
  
    const tileDefinitions = [
      { var: "tile1", x: 17, y: 27, code: "b" },
      { var: "tile2", x: 17, y: 24, code: "t" },
      { var: "tile9", x: 19, y: 25, code: "d" },
      { var: "tile8", x: 19, y: 26, code: "z" },
      { var: "tile7", x: 7,  y: 13, code: "y" },
      { var: "tile6", x: 1,  y: 9,  code: "x" }
    ];
  
    tileDefinitions.forEach(def => {
      window[def.var] = createTile(walkable, def.x, def.y, def.code);
    });
  
    tile4 = createTile(walkable, 21, 24, "p", {
      height: 0.1,
      y: tileSize - 10,
      debug: false
    });
  
    death = new Group(); 
    death.layer = 1;
    tile3 = createTile(death, 20, 6, "s", {
      width: tileSize / 2,
      height: tileSize / 2
    });
  
    potion = new Group();  
    potion.layer = 1;
    potion.w = 16;
    potion.h = 16;
    potion.spriteSheet = potionImg;
    potion.addAnis({ 
      spin: { 
        row: 0, 
        frames: 8 
      } 
    });
    potion.tile = "e";
    potion.collider = "static";
    potion.rotationLock = true;
  
    player.sprite.overlaps(potion, (p, c) => {
      c.remove();
      score++;
      
      const bubbleSynth = new Tone.MonoSynth({
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0,
          release: 0.1
        }
      }).toDestination();
      
      bubbleSynth.triggerAttackRelease("C4", "16n", "+0.0");
      bubbleSynth.triggerAttackRelease("E4", "16n", "+0.1");
      bubbleSynth.triggerAttackRelease("G4", "16n", "+0.2");
      
      const splashNoise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0
        }
      }).chain(
        new Tone.Filter(1200, "highpass"),
        Tone.Destination
      );
      splashNoise.triggerAttackRelease("16n", "+0.3");
    });
  
    tileMap = new Tiles(
      /*
        b : represents "background" map, player does not walk on it
        t : represents walkable tile
        s : represetns spikes, kills player
        p : represents ledges player can jump on
        e : represents potions a player can pick up
        d : represents a "vertical" tile
        z : represents a "horizontal" tile
        y : represents a stylish tile
        x : represents a stylish tile
      */
      [
          "..............ee.........e............",
          "......pp.............pppppppp.........",
          "...........pp...p.e...........p.......",
          ".....p..............s....e............",
          "........e.......p...sss.........p.....",
          ".....p......sss...........ppp.........",
          "......ppp.......p..p...........p......",
          "..e........s....y..y........ppppp.....",
          "..p..ssssttxtteeteet......ssstttt.....",
          ".....xxxxtyyttttxttttsssstxxxtttt.....",
          "tttsssstttttttttxttttxxxxtyttttttttttt",
          "bbbxxxxbbbbbbbbbbbybbbdbbbbbbbbbbbxxbb",
          "ybxbbbdzzzzbbbbbbybbbbdbbbyybbbbzzzbbbb",
          "bbbbbbdbbbbbbbbbybbbbbdbbxxxbbbbbzzbbbb",
          "bbbbbbdbbbbbbbybbbbbbbdbbbbbbbbbbbbbbbb"
      ],
      tileSize,
      tileSize,
      tileSize - 1,
      tileSize - 1
    );
  }

function checkPlaying() {
  if (playing) {
    if (player.lives > -1) {
      fill(0, 0, 0, 150);
      noStroke();
      rect(width - 200, 10, 190, 40, 10);
      
      fill(255);
      fill("purple");
      textSize(24);
      textAlign(LEFT, TOP);
      // text(`Potions: ${score}`, width - 20, 20);
      // text(`Potions: ${score}`, 20 + (i * 40), 20, 36, 36);
      for (let i = 0; i < player.lives; i++) {
        image(purpleheart, 20 + (i * 40), 20, 36, 36);
      }
      text(`Potions: ${score}`, 20, 20 + 36 + 20);

      fill("purple");
      textSize(24);
      text(`Time: ${nf(floor(millis()/1000), 2)}s`, 20, 20 + 36 + 20 + 24 + 20);

      world.step();
      camera.x = player.sprite.x + 400;
      camera.y = player.sprite.y - 70;
      player.sprite.visible = true;
      walkable.visible = true;
      death.visible = true;
      potion.visible = true;

      Tone.Transport.start();
      Tone.Transport.bpm.value = 90;
      spaceTrack.start();
      noisePad.triggerAttackRelease("32n");

      movement();
      if (player.sprite.collides(death)) {
        player.sprite.x = 120;
        player.sprite.y = 630;
        player.lives--;
        spike.triggerAttackRelease("E3", "8n");
      }
      if (port.opened()) {
        let msg = `${player.lives}\n`;
        port.write(msg);
      }
    } else {
      background(0);
      fill("purple");
      textAlign(CENTER, CENTER); 
      textSize(32);
      text("Bye Bye!", width / 2, height / 2 - 20);
      textSize(20);
      text(`You collected ${score} potions`, width / 2, height / 2 + 20); 
      spaceTrack.stop();
      noisePad.triggerRelease();
      player.sprite.visible = false;
      walkable.visible = false;
      death.visible = false;
      potion.visible = false;
    }
  } else {
    background(0);
    fill("purple");
    textSize(50);
    textAlign(CENTER, CENTER);
    text("Purple Man Adventurer", width / 2, height / 2 - 30);
    text('Press "Enter" to start!', width / 2, height / 2 + 30);
    player.sprite.visible = false;
    walkable.visible = false;
    death.visible = false;
    potion.visible = false;
    if (kb.presses("enter")) {
      playing = true;
    }
  }
}

function getTile(x, y) {
  return maptiles.get(x * tileSize, y * tileSize, tileSize, tileSize);
}

class Player {
  constructor(img) {
    this.lives = 3;
    this.sprite = new Sprite(120, 620, 80, 80);

    const player = this.sprite;
    player.spriteSheet = img;
    player.rotationLock = true;
    player.friction = 0;

    player.addAnis(
      {
        stand: {
          row: 0,
          frames: 1
        },
        run: {
          row: 0,
          frames: 9
        },
        jump: {
          row: 9,
          frames: 12
        }
      }
    );
    

    player.debug = false;
    player.ani = "stand";
  }
}

