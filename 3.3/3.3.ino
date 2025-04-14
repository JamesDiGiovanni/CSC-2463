const int redPin = 3;
const int greenPin = 5;
const int bluePin = 6;

const int ldrPin = A0;

void setup() {
  Serial.begin(9600);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() 
{
  int lightValue = analogRead(ldrPin);
  
  while (Serial.available() > 0) {
    int red = Serial.parseInt();
    int green = Serial.parseInt();
    int blue = Serial.parseInt();

    if (Serial.read() == '\n') {
      analogWrite(redPin, constrain(red, 0, 255));
      analogWrite(greenPin, constrain(green, 0, 255));
      analogWrite(bluePin, constrain(blue, 0, 255));
      
      Serial.println(lightValue);
    }
  }
}