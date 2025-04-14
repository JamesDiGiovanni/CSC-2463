let port;
let connectButton;
let palette = [];
let latestLightValue = 512; 

function setup() 
{
  createCanvas(windowWidth, windowHeight);

  connectButton = createButton('Connect');
  connectButton.mousePressed(connect);

  noStroke();

  port = createSerial();

  palette = [
    [255, 0, 0],    // red
    [0, 255, 0],    // green
    [0, 0, 255],    // blue
    [255, 255, 0],  // yellow
    [0, 255, 255],  // cyan
    [255, 0, 255],  // magenta
    [255, 165, 0],  // orange
    [255, 255, 255] // white
  ];
}

function draw() 
{
  colorMode(HSB, 360, 100, 100);
  let bgHue = map(latestLightValue, 0, 1023, 0, 360);
  background(bgHue, 100, 80);
  colorMode(RGB); 
  for (let i = 0; i < palette.length; i++) 
  {
    fill(palette[i]);
    rect(0, i * 50, 50, 50);
  }

  let str = port.readUntil('\n');
  if (str !== "") 
    {
    if (!str.includes(',')) 
    {
      latestLightValue = parseInt(str.trim());
    } 
    else {
      const values = str.split(',');
      if (values.length === 3) {
        fill(values[0], values[1], values[2]);
        circle(25, 375, 25); 
      }
    }
  }

  if (port.opened() && mouseX < 50) {
    let index = floor(mouseY / 50);
    if (index >= 0 && index < palette.length) {
      let hoveredColor = palette[index];
      let msg = hoveredColor[0] + "," + hoveredColor[1] + "," + hoveredColor[2] + "\n";
      port.write(msg);
    }
  }
}

function connect() {
  port.open('Arduino', 9600);
}