let filter, noise, reverb, panner, LFOfilt, fmSynth, noiseEnv, noise1, filt1;
let values1;

function preload() {
  img = loadImage("images/crash.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  panner = new Tone.AutoPanner({
    frequency: 0.2,
    depth: 1
  }).toDestination().start();

  filter = new Tone.Filter(5000, "bandpass").connect(panner);

  noise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.01,
      decay: 1.5,
      sustain: 0.1,
      release: 2.5,
    }
  }).connect(filter);

  LFOfilt = new Tone.LFO(0.5, 300, 8000).start();
  LFOfilt.connect(filter.frequency);

  fmSynth = new Tone.FMSynth({
    harmonicity: 2.5,
    modulationIndex: 10,
    envelope: {
      attack: 0.01,
      decay: 1.5,
      sustain: 0.1,
      release: 2.5,
    }
  }).toDestination();

  reverb = new Tone.Reverb({
    decay: 3,
    preDelay: 0.1,
    wet: 0.7,
  });
  filter.connect(reverb);
  reverb.toDestination();

  filt1 = new Tone.AutoFilter({
    frequency: 0.1,
    depth: 0.3,
    baseFrequency: 500,
    octaves: 4
  }).toDestination().start();

  noiseEnv = new Tone.AmplitudeEnvelope({
    attack: 3,
    decay: 0.1,
    sustain: 1,
    release: 1
  }).connect(filt1);

  noise1 = new Tone.Noise().connect(noiseEnv).start();

  values1 = new Float32Array([-96, -30, -30, -12, 0, -12, 0, 0, -6, -12, -30, -96]);
}

function draw() {
  if (mouseIsPressed) {
    background(img);
  } else {
    background(240);
  }
  fill(0); 
  textSize(32);
  textAlign(CENTER, CENTER); 
  text("CLICK HERE!", width / 2, height / 2);
}

function mousePressed() {
  noise.triggerAttackRelease("16n"); 
  fmSynth.triggerAttackRelease("C4", "16n");  
  filter.frequency.rampTo(8000, 0.2);
}

function mouseReleased() {
  filter.frequency.value = 5000;
}


