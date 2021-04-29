// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const imageInput = document.getElementById("image-input");
const form = document.getElementById("generate-meme");
const canvas = document.getElementById("user-image");
const ctx = canvas.getContext('2d');
const clear = document.querySelector("button[type='reset']");
const read = document.querySelector("button[type='button']");
const volumeGroup = document.querySelector("input[type='range']");
let voiceSelect = document.getElementById('voice-selection');
let speechSyn = window.speechSynthesis;
let volume = 100;
let toSpeak = undefined;


// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // clear canvas context
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // toggle relevant buttons
  let buttonsList = document.getElementsByTagName('button');
  buttonsList[0].disabled = false; // submit
  buttonsList[1].disabled = true;  // reset
  buttonsList[2].disabled = true;  // button

  // fill context with black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw uploaded image
  const dimensions = getDimensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions["startX"], dimensions["startY"], dimensions["width"], dimensions["height"]);
});

// fires when new image is uploaded
imageInput.addEventListener("change", () => {
  // load in the selected image
  img.src = URL.createObjectURL(imageInput.files[0]);

  // set the image alt attribute
  img.alt = imageInput.files[0].name;
});

// fires when generate button is clicked
form.addEventListener("submit", (event) => {
  // on submit, generate meme
  event.preventDefault();
  let textTop = document.getElementById("text-top").value;
  let textBottom = document.getElementById("text-bottom").value;

  ctx.fillStyle = 'white';
  ctx.font = "25px Comic Sans MS";
  ctx.fillText(textTop, canvas.width / 2, 30);
  ctx.fillText(textBottom, canvas.width / 2, canvas.height - 10);

  // toggle relevant buttons
  let buttonsList = document.getElementsByTagName('button');
  buttonsList[0].disabled = true;   // submit
  buttonsList[1].disabled = false;  // reset
  buttonsList[2].disabled = false;  // button

  toSpeak = new SpeechSynthesisUtterance(textTop + " " + textBottom);

  let voices = speechSyn.getVoices();
  voiceSelect.disabled = false;
  voiceSelect.remove(0);

  for (var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }

  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      toSpeak.voice = voices[i];
    }
  }
})

// fires when clear button is clicked
clear.addEventListener("click", () => {
  // clear image and text
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  document.getElementById("text-top").value = "";
  document.getElementById("text-bottom").value = "";

  // toggle relevant buttons
  let buttonsList = document.getElementsByTagName('button');
  buttonsList[0].disabled = false; // submit
  buttonsList[1].disabled = true;  // reset
  buttonsList[2].disabled = true;  // button
})

// fires when read button is clicked
read.addEventListener("click", (event) => {
  // have the browser speak the text
  event.preventDefault();
  let textTop = document.getElementById("text-top").value;
  let textBottom = document.getElementById("text-bottom").value;
  let toSpeak = new SpeechSynthesisUtterance(textTop + " " + textBottom);

  let voices = speechSyn.getVoices();
  voiceSelect.disabled = false;
  voiceSelect.remove(0);

  for (var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }

  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      toSpeak.voice = voices[i];
    }
  }

  toSpeak.volume = volume / 100;
  speechSyn.speak(toSpeak);
})

// fires when volume slider is moved
volumeGroup.addEventListener("input", () => {
  volume = volumeGroup.value;
  let volumeImg = document.querySelector('#volume-group img');

  if (volume == 0){
    volumeImg.src = "icons/volume-level-0.svg";
    volumeImg.alt = "Volume Level 0";
  } else if (volume < 34){
    volumeImg.src = "icons/volume-level-1.svg";
    volumeImg.alt = "Volume Level 2";
  } else if (volume < 67){
    volumeImg.src = "icons/volume-level-2.svg";
    volumeImg.alt = "Volume Level 2";
  } else if (volume <= 100){
    volumeImg.src = "icons/volume-level-3.svg";
    volumeImg.alt = "Volume Level 3";
  }
})


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
