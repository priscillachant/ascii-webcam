let video;
let asciiDiv;
let capturer;
let isRecording = false;
let photoButton;
let flashOverlay;
let shutterSound;
let brightnessSlider;

const density = "Ñ@#W$9876543210?!abc;:+=-,._                    ";

function preload() {
  shutterSound = loadSound('sound-and-visuals/8-bit shutter.mp3');
  console.log('Shutter sound loaded:', shutterSound);
}

function setup() {
  noCanvas();
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(160, 120);
  video.hide();

  const layoutWrapper = createDiv();
  layoutWrapper.parent(document.body);
  layoutWrapper.style('display', 'flex');
  layoutWrapper.style('align-items', 'flex-start');
  layoutWrapper.style('justify-content', 'center');
  layoutWrapper.style('gap', '20px');

  asciiDiv = createDiv();
  asciiDiv.parent(layoutWrapper);
  asciiDiv.style('margin-bottom', '120px');

  // New: asciiBox to isolate ASCII webcam output area
  const asciiBox = createDiv();
  asciiBox.parent(asciiDiv);
  asciiBox.style('background', '#000');
  asciiBox.style('color', '#fff');
  asciiBox.style('white-space', 'pre');
  asciiBox.style('font-family', 'monospace');
  asciiBox.style('font-size', '8px');
  asciiBox.style('line-height', '6px');
  asciiBox.style('letter-spacing', '1px');
  asciiBox.style('overflow', 'hidden');
  asciiBox.style('display', 'inline-block');
  asciiBox.style('margin', '0 auto');
  asciiBox.style('position', 'relative');
  asciiBox.style('z-index', '1');
  asciiBox.id('asciiBox');

  const asciiContent = createDiv();
  asciiContent.id('asciiContent');
  asciiContent.parent(asciiBox);

  const uiPanel = createDiv();
  uiPanel.parent(asciiDiv);
  uiPanel.style('display', 'flex');
  uiPanel.style('justify-content', 'center');
  uiPanel.style('align-items', 'center');
  uiPanel.style('gap', '20px');

  // Wrap the brightness slider in its own container for label
  const sliderGroup = createDiv();
  sliderGroup.parent(uiPanel);
  sliderGroup.style('display', 'flex');
  sliderGroup.style('flex-direction', 'column');
  sliderGroup.style('align-items', 'center');

  const brightnessLabel = createDiv('Brightness');
  brightnessLabel.parent(sliderGroup);
  brightnessLabel.style('font-family', 'monospace');
  brightnessLabel.style('color', '#fff');
  brightnessLabel.style('margin-bottom', '10px');
  brightnessLabel.style('font-size', '14px');

  brightnessSlider = createSlider(0.0, 2.0, 1.0, 0.01);
  brightnessSlider.parent(sliderGroup);
  brightnessSlider.style('width', '160px');
  brightnessSlider.style('appearance', 'none');
  brightnessSlider.style('height', '6px');
  brightnessSlider.style('background', '#fff');
  brightnessSlider.style('outline', 'none');
  brightnessSlider.style('border-radius', '0');
  brightnessSlider.style('margin', '0');
  brightnessSlider.style('display', 'block');
  brightnessSlider.style('margin-left', 'auto');
  brightnessSlider.style('margin-right', 'auto');

  const style = document.createElement('style');
  style.innerHTML = `
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      background: red;
      cursor: pointer;
    }
    input[type=range]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: red;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // --- Color controls for ASCII text and background ---
  const colorControls = createDiv();
  colorControls.parent(uiPanel);
  colorControls.style('display', 'flex');
  colorControls.style('flex-direction', 'column');
  colorControls.style('align-items', 'center');
  colorControls.style('gap', '10px');

  const textColorLabel = createDiv('Text Color');
  textColorLabel.parent(colorControls);
  textColorLabel.style('font-family', 'monospace');
  textColorLabel.style('color', '#fff');
  textColorLabel.style('font-size', '14px');

  const textColorPicker = createColorPicker('#ffffff');
  textColorPicker.parent(colorControls);
  textColorPicker.input(() => {
    asciiBox.style('color', textColorPicker.value());
  });

  const bgColorLabel = createDiv('Background');
  bgColorLabel.parent(colorControls);
  bgColorLabel.style('font-family', 'monospace');
  bgColorLabel.style('color', '#fff');
  bgColorLabel.style('font-size', '14px');

  const bgColorPicker = createColorPicker('#000000');
  bgColorPicker.parent(colorControls);
  bgColorPicker.input(() => {
    asciiBox.style('background', bgColorPicker.value());
  });

  // Export format selection checkboxes
  const formatGroup = createDiv();
  formatGroup.parent(uiPanel);
  formatGroup.style('display', 'flex');
  formatGroup.style('flex-direction', 'column');
  formatGroup.style('align-items', 'center');
  formatGroup.style('gap', '4px');
  formatGroup.style('margin-top', '10px');

  const formatLabel = createDiv('Export Format');
  formatLabel.parent(formatGroup);
  formatLabel.style('font-family', 'monospace');
  formatLabel.style('color', '#fff');
  formatLabel.style('font-size', '14px');

  const exportTxt = createCheckbox('.txt', true);
  exportTxt.parent(formatGroup);
  exportTxt.style('color', '#fff');
  exportTxt.style('font-family', 'monospace');

  const exportJpg = createCheckbox('.jpg', false);
  exportJpg.parent(formatGroup);
  exportJpg.style('color', '#fff');
  exportJpg.style('font-family', 'monospace');

  const exportPng = createCheckbox('.png', false);
  exportPng.parent(formatGroup);
  exportPng.style('color', '#fff');
  exportPng.style('font-family', 'monospace');

  // Save checkboxes globally for access in saveAsciiImage
  window.exportTxt = exportTxt;
  window.exportJpg = exportJpg;
  window.exportPng = exportPng;

  photoButton = createDiv(`
+----------------------+<br>
|    [ TAKE PHOTO ]    |<br>
+----------------------+
  `);
  photoButton.parent(uiPanel);
  photoButton.style('font-family', 'monospace');
  photoButton.style('color', '#fff');
  photoButton.style('cursor', 'pointer');
  photoButton.style('text-align', 'center');
  photoButton.style('line-height', '1.2');
  photoButton.style('font-size', '16px');
  photoButton.style('display', 'inline-block');
  photoButton.style('padding', '4px 8px');
  // photoButton.style('background-color', '#000');
  // photoButton.style('border', '1px solid #fff');
  photoButton.style('box-sizing', 'content-box');
  photoButton.style('margin', '0');
  photoButton.mousePressed(saveAsciiImage);

  document.body.style.display = 'flex';
  document.body.style.justifyContent = 'center';
  document.body.style.alignItems = 'center';
  document.body.style.backgroundColor = '#000';
  document.body.style.margin = '0';
  document.body.style.height = '100vh';

  flashOverlay = createDiv('');
  flashOverlay.parent(asciiBox);
  flashOverlay.style('position', 'absolute');
  flashOverlay.style('top', '0');
  flashOverlay.style('left', '0');
  flashOverlay.style('width', '100%');
  flashOverlay.style('height', '100%');
  flashOverlay.style('background', 'white');
  flashOverlay.style('opacity', '0');
  flashOverlay.style('pointer-events', 'none');
  flashOverlay.style('z-index', '100');
  flashOverlay.style('transition', 'opacity 0.2s');

  if (typeof CCapture === 'function') {
    capturer = new CCapture({ format: 'webm', framerate: 30 });
  }
}

function saveAsciiImage() {
  if (shutterSound && shutterSound.isLoaded()) {
    console.log('Attempting to play shutter sound');
    shutterSound.play();
  } else {
    console.warn('Shutter sound not loaded or missing');
  }

  flashOverlay.elt.style.opacity = '0.5';
  setTimeout(() => {
    flashOverlay.elt.style.opacity = '0';

    if (window.exportJpg?.checked() || window.exportPng?.checked()) {
      html2canvas(document.getElementById('asciiBox')).then(canvas => {
        if (window.exportJpg?.checked()) {
          const jpgLink = document.createElement('a');
          jpgLink.download = 'ascii-photo.jpg';
          jpgLink.href = canvas.toDataURL('image/jpeg');
          jpgLink.click();
        }
        if (window.exportPng?.checked()) {
          const pngLink = document.createElement('a');
          pngLink.download = 'ascii-photo.png';
          pngLink.href = canvas.toDataURL('image/png');
          pngLink.click();
        }
      });
    }
  }, 150);

  const content = asciiDiv.html().replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ');
  const asciiBox = select('#asciiContent').parent();

  if (window.exportTxt?.checked()) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-photo.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}

function draw() {
  background(0);
  video.loadPixels();

  if (video.pixels.length === 0) {
    return;
  }

  let asciiImage = '';

  for (let j = 0; j < video.height; j++) {
    for (let i = video.width - 1; i >= 0; i--) {
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex + 0];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      let rawValue = brightnessSlider.value();
if (abs(rawValue - 1.0) < 0.05) {
  rawValue = 1.0;
  brightnessSlider.value(1.0); // Snap to center more assertively
}
const brightness = constrain(rawValue, 0.5, 2.0);
      const adjustedR = r * brightness;
      const adjustedG = g * brightness;
      const adjustedB = b * brightness;
      const avg = (adjustedR + adjustedG + adjustedB) / 3;
      const len = density.length;
      const charIndex = floor(map(avg, 0, 255, len - 1, 0));
      const c = density.charAt(charIndex);
      asciiImage += c;
    }
    asciiImage += '\n';
  }

  select('#asciiContent').html(asciiImage);

  if (isRecording && capturer) {
    capturer.capture(document.getElementById(asciiDiv.id));
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    if (capturer) {
      if (!isRecording) {
        capturer.start();
        isRecording = true;
        console.log("Recording started");
      } else {
        capturer.stop();
        capturer.save();
        isRecording = false;
        console.log("Recording stopped and saved");
      }
    } else {
      console.warn("Cannot record — CCapture is not available.");
    }
  }
}
