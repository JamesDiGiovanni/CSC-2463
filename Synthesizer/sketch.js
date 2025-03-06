let synth1, filt, rev, noise1, ampEnv1, filt1, lfo, distortion;

let activeKey = null;

let keyNotes = {
  'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4',
  'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5'
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  filt = new Tone.Filter(1500, "lowpass").toDestination();
  rev = new Tone.Reverb(2).connect(filt);
  distortion = new Tone.Distortion(0.4).connect(filt);
  
  synth1 = new Tone.Synth({
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.9,
      release: 0.3
    }
  }).connect(distortion);
  synth1.portamento = 0.1;
  
  ampEnv1 = new Tone.AmplitudeEnvelope({
    attack: 0.1,
    decay: 0.5,
    sustain: 0,
    release: 0.1
  }).toDestination();
  filt1 = new Tone.Filter(1500, "highpass").connect(ampEnv1);
  noise1 = new Tone.Noise('pink').start().connect(filt1);
  
  lfo = new Tone.LFO(2, 200, 1500).start();
  lfo.connect(filt.frequency);
}

function draw() {
  background(30);
  fill(255);
  textSize(20);
  text("Press keys A, S, D, F, G, H, J, K", 20, 30);
  text("Distortion added for variation.", 20, 120);
}

function keyPressed() {
  let pitch = keyNotes[key];
  if (pitch && key !== activeKey) {
    synth1.triggerRelease();
    activeKey = key;
    synth1.triggerAttack(pitch);
  } else if (key === "z") {
    ampEnv1.triggerAttackRelease(0.1);
  }
}

function keyReleased() {
  if (key === activeKey) {
    synth1.triggerRelease();
    activeKey = null;
  }
}
