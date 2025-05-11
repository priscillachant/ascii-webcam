let video;
let asciiDiv;
let capturer;
let isRecording = false;
let photoButton;
let flashOverlay;
let shutterSound;
let asciiSlider, asciiKnobIndex = 10, isDraggingKnob = false;

const density = "Ñ@#W$9876543210?!abc;:+=-,._                    ";

function preload() {
  shutterSound = loadSound('sounds/8-bit shutter.mp3');
  console.log('Shutter sound loaded:', shutterSound);
}

function setup() {
  noCanvas();
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(160, 120);
  video.hide();

  // Center everything vertically and horizontally using an outer wrapper
  const layoutWrapper = createDiv();
  const outerWrapper = createDiv();
  outerWrapper.parent(document.body);
  outerWrapper.style('display', 'flex');
  outerWrapper.style('justify-content', 'center');
  outerWrapper.style('align-items', 'center');
  outerWrapper.style('height', '100vh');
  layoutWrapper.parent(outerWrapper);
  layoutWrapper.style('display', 'flex');
  layoutWrapper.style('align-items', 'center');
  layoutWrapper.style('justify-content', 'center');
  layoutWrapper.style('gap', '20px');

  asciiDiv = createDiv();
  asciiDiv.parent(layoutWrapper);
  // asciiDiv.style('margin-bottom', '120px');

  // New: asciiBox to isolate ASCII webcam output area
  const asciiBox = createDiv();
  asciiBox.parent(asciiDiv);
  asciiBox.style('background', '#000');
  asciiBox.style('color', '#fff');
  asciiBox.style('white-space', 'pre');
  asciiBox.style('font-family', 'monospace');
  asciiBox.style('font-size', '10px');
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
  uiPanel.parent(layoutWrapper);
  uiPanel.style('display', 'flex');
  uiPanel.style('flex-direction', 'column');
  uiPanel.style('align-items', 'center');
  uiPanel.style('gap', '20px');
  uiPanel.style('justify-content', 'space-between');
  // Enable vertical scrolling for mobile usability
  uiPanel.style('overflow-y', 'auto');
  uiPanel.style('height', '100%');
  uiPanel.style('box-sizing', 'border-box');
  uiPanel.style('margin-top', '0px');
  uiPanel.style('font-family', 'CozetteCrossedSevenVector, monospace');
  uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';

  // Wrap the brightness slider in its own container for label
  const sliderGroup = createDiv();
  sliderGroup.parent(uiPanel);
  sliderGroup.style('display', 'flex');
  sliderGroup.style('flex-direction', 'column');
  sliderGroup.style('align-items', 'center');

  const brightnessLabel = createDiv('Brightness');
  brightnessLabel.parent(sliderGroup);
  brightnessLabel.style('font-family', 'CozetteCrossedSevenVector, monospace');
  uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';
  brightnessLabel.style('color', '#fff');
  brightnessLabel.style('margin-bottom', '10px');
  brightnessLabel.style('font-size', '20px');

  // brightnessSlider = createSlider(0.0, 2.0, 1.0, 0.01);
  // brightnessSlider.parent(sliderGroup);
  // brightnessSlider.style('width', '160px');
  // brightnessSlider.style('appearance', 'none');
  // brightnessSlider.style('height', '6px');
  // brightnessSlider.style('background', '#fff');
  // brightnessSlider.style('outline', 'none');
  // brightnessSlider.style('border-radius', '0');
  // brightnessSlider.style('margin', '0');
  // brightnessSlider.style('display', 'block');
  // brightnessSlider.style('margin-left', 'auto');
  // brightnessSlider.style('margin-right', 'auto');

  asciiSlider = createDiv(generateAsciiSlider(asciiKnobIndex));
  asciiSlider.parent(sliderGroup);
  asciiSlider.style('color', 'white');
  asciiSlider.style('font-family', 'monospace');
  asciiSlider.style('font-size', '13px');
  asciiSlider.style('text-align', 'center');
  asciiSlider.style('user-select', 'none');
  asciiSlider.style('cursor', 'default');

  asciiSlider.mousePressed((event) => {
    const rect = asciiSlider.elt.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const charWidth = rect.width / 20;
    asciiKnobIndex = constrain(Math.floor(clickX / charWidth), 0, 19);
    isDraggingKnob = true;
  });

  asciiSlider.mouseReleased(() => {
    isDraggingKnob = false;
  });

  asciiSlider.mouseMoved((event) => {
    if (isDraggingKnob) {
      const rect = asciiSlider.elt.getBoundingClientRect();
      const moveX = event.clientX - rect.left;
      const charWidth = rect.width / 20;
      asciiKnobIndex = constrain(Math.floor(moveX / charWidth), 0, 19);
    }
  });

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

  // --- Cozette font loading and application ---
  const fontStyle = document.createElement('style');
  fontStyle.innerHTML = `
    @font-face {
      font-family: 'CozetteCrossedSevenVector';
      src: url('fonts/CozetteCrossedSevenVector.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
    }

    #asciiBox, #asciiBox *, .p5Element, .p5Element * {
      font-family: 'CozetteCrossedSevenVector', monospace !important;
    }
  `;
  document.head.appendChild(fontStyle);

  // --- Color controls for ASCII text and background ---
  const colorControls = createDiv();
  colorControls.parent(uiPanel);
  colorControls.style('display', 'flex');
  colorControls.style('flex-direction', 'column');
  colorControls.style('align-items', 'center');
  colorControls.style('gap', '10px');

  const textColorLabel = createDiv('Text Color');
  textColorLabel.parent(colorControls);
  textColorLabel.style('font-family', 'CozetteCrossedSevenVector, monospace');
    uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';
  textColorLabel.style('color', '#fff');
  textColorLabel.style('font-size', '20px');

  const textColorPicker = createColorPicker('#ffffff');
  textColorPicker.parent(colorControls);
  textColorPicker.style('width', '60px');
  textColorPicker.style('height', '40px');
  textColorPicker.input(() => {
    asciiBox.style('color', textColorPicker.value());
  });

  const bgColorLabel = createDiv('Background');
  bgColorLabel.parent(colorControls);
  bgColorLabel.style('font-family', 'CozetteCrossedSevenVector, monospace');
      uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';
  bgColorLabel.style('color', '#fff');
  bgColorLabel.style('font-size', '20px');

  const bgColorPicker = createColorPicker('#000000');
  bgColorPicker.parent(colorControls);
  bgColorPicker.style('width', '60px');
  bgColorPicker.style('height', '40px');
  bgColorPicker.input(() => {
    asciiBox.style('background', bgColorPicker.value());
  });

  document.body.style.display = 'flex';
  document.body.style.justifyContent = 'center';
  document.body.style.alignItems = 'center';
  document.body.style.backgroundColor = '#000';
  document.body.style.margin = '0';
  // document.body.style.height = '100vh';
  document.body.style.overflow = 'auto';

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

  // Export format selection checkboxes
  const formatGroup = createDiv();
  formatGroup.style('display', 'flex');
  formatGroup.style('flex-direction', 'column');
  formatGroup.style('align-items', 'center');
  formatGroup.style('gap', '4px');
  formatGroup.style('margin-top', '10px');

  const formatLabel = createDiv('Export Format');
  formatLabel.parent(formatGroup);
  formatLabel.style('font-family', 'CozetteCrossedSevenVector, monospace');
    uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';
  formatLabel.style('color', '#fff');
  formatLabel.style('font-size', '20px');

  // Custom ASCII checkboxes
  function createAsciiCheckbox(label, checked) {
    const box = createDiv();
    box.style('font-family', 'CozetteCrossedSevenVector, monospace');
    uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';
    box.style('color', '#fff');
    box.style('font-size', '20px');
    box.style('cursor', 'pointer');
    box.style('user-select', 'none');
    box.style('text-align', 'left');
    box.checked = checked;

    const render = () => {
      const symbol = box.checked ? 'x' : ' ';
      box.html(`[${symbol}] ${label}`);
    };

    box.mousePressed(() => {
      box.checked = !box.checked;
      render();
    });

    render();
    return box;
  }

  const exportTxt = createAsciiCheckbox('.txt', true);
  exportTxt.parent(formatGroup);

  const exportJpg = createAsciiCheckbox('.jpg', false);
  exportJpg.parent(formatGroup);

  const exportPng = createAsciiCheckbox('.png', false);
  exportPng.parent(formatGroup);

  // Make these accessible globally for saveAsciiImage
  window.exportTxt = exportTxt;
  window.exportJpg = exportJpg;
  window.exportPng = exportPng;

  const spacer = createDiv();
  spacer.parent(uiPanel);
  spacer.style('flex-grow', '1');

  formatGroup.parent(uiPanel);

  photoButton = createDiv(`
+----------------------+<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;[ TAKE PHOTO ]&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
+----------------------+
  `);
  photoButton.parent(uiPanel);
  photoButton.style('font-family', 'CozetteCrossedSevenVector, monospace');
    uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';
  photoButton.style('color', '#fff');
  photoButton.style('cursor', 'pointer');
  photoButton.mouseOver(() => {
  photoButton.style('color', 'red');
  photoButton.style('font-size', '20px');

});
photoButton.mouseOut(() => {
  photoButton.style('color', '#fff');
});
  photoButton.style('text-align', 'center');
  photoButton.style('line-height', '1.2');
  photoButton.style('font-size', '20px');
  photoButton.style('display', 'inline-block');
  photoButton.style('padding', '4px 8px');
  // photoButton.style('background-color', '#000');
  // photoButton.style('border', '1px solid #fff');
  photoButton.style('box-sizing', 'content-box');
  photoButton.style('margin', '0');
  photoButton.mousePressed(saveAsciiImage);
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
      const rawValue = map(asciiKnobIndex, 0, 19, 0.0, 2.0);
      const brightness = constrain(rawValue, 0.5, 2.0);
      const adjustedR = 255 * pow(r / 255, 1 / brightness);
      const adjustedG = 255 * pow(g / 255, 1 / brightness);
      const adjustedB = 255 * pow(b / 255, 1 / brightness);
      const avg = (adjustedR + adjustedG + adjustedB) / 3;
      const len = density.length;
      const charIndex = floor(map(avg, 0, 255, len - 1, 0));
      const c = density.charAt(charIndex);
      asciiImage += c;
    }
    asciiImage += '\n';
  }

  select('#asciiContent').html(asciiImage);
  asciiSlider.html(generateAsciiSlider(asciiKnobIndex));

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

function generateAsciiSlider(index) {
  const total = 20;
  let slider = '';
  for (let i = 0; i < total; i++) {
    slider += (i === index)
      ? '<span style="color:white;">■</span>'
      : '<span style="color:white;">=</span>';
  }
  return '[' + slider + ']';
}
