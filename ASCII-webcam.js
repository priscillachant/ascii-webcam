// Hello, World! This is my first time "programming" so expect lots of errors.
// Also this was made with the help of AI. I am not a programmer, I am an artist.

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
  // --- Helper functions for label and value styling ---
  function styleAsciiLabel(div, size = '20px') {
    div.style('font-family', 'CozetteCrossedSevenVector, monospace');
    div.style('color', '#fff');
    div.style('font-size', size);
    div.style('margin-bottom', '10px');
  }

  function styleValueDisplay(div, size = '16px') {
    div.style('font-family', 'CozetteCrossedSevenVector, monospace');
    div.style('color', '#fff');
    div.style('font-size', size);
    div.style('margin-bottom', '6px');
  }
  noCanvas();
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(160, 120);
  video.hide();

  // Use existing .page-layout from HTML
  const layoutWrapper = select('.page-layout');

  asciiDiv = createDiv();
  asciiDiv.parent(layoutWrapper);

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
  // Lock to fixed 1280x720 size
  asciiBox.style('width', '960px');
  asciiBox.style('height', '720px');
  asciiBox.style('min-width', '960px');
  asciiBox.style('min-height', '720px');

  const asciiContent = createDiv();
  asciiContent.id('asciiContent');
  asciiContent.parent(asciiBox);
  // Set placeholder content so it's visibly populated on load
  asciiContent.html('( . . . loading )');

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
  styleAsciiLabel(brightnessLabel);

  // Add brightness value display before asciiSlider
  const brightnessValueDisplay = createDiv(`Brightness: ${asciiKnobIndex - 10}`);
  brightnessValueDisplay.parent(sliderGroup);
  styleValueDisplay(brightnessValueDisplay);
  window.brightnessValueDisplay = brightnessValueDisplay;

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
    if (isDraggingKnob && mouseIsPressed) {
      const rect = asciiSlider.elt.getBoundingClientRect();
      const moveX = event.clientX - rect.left;
      const charWidth = rect.width / 20;
      asciiKnobIndex = constrain(Math.floor(moveX / charWidth), 0, 19);
    } else {
      isDraggingKnob = false;
    }
  });

  // --- Character Scale Slider ---
  const scaleGroup = createDiv();
  scaleGroup.parent(uiPanel);
  scaleGroup.style('display', 'flex');
  scaleGroup.style('flex-direction', 'column');
  scaleGroup.style('align-items', 'center');

  const scaleLabel = createDiv('Character Scale');
  scaleLabel.parent(scaleGroup);
  styleAsciiLabel(scaleLabel);

  window.charScaleIndex = 1; // default to charScale = 4
  const charScaleValues = Array.from({ length: 20 }, (_, i) => 2 + i * 2);
  const charScaleLabels = charScaleValues.map(val => val === 4 ? `${val} (true-to-scale)` : `${val}`);
  window.charScaleLabels = charScaleLabels;

  // Character Scale Value Display (inserted before charScaleSlider)
  const charScaleValueDisplay = createDiv(`Scale: ${charScaleValues[window.charScaleIndex]}`);
  charScaleValueDisplay.parent(scaleGroup);
  styleValueDisplay(charScaleValueDisplay);
  window.charScaleValueDisplay = charScaleValueDisplay;

  const charScaleSlider = createDiv(generateAsciiSlider(window.charScaleIndex));
  charScaleSlider.parent(scaleGroup);
  charScaleSlider.style('color', 'white');
  charScaleSlider.style('font-family', 'monospace');
  charScaleSlider.style('font-size', '13px');
  charScaleSlider.style('text-align', 'center');
  charScaleSlider.style('user-select', 'none');
  charScaleSlider.style('cursor', 'default');

  charScaleSlider.mousePressed((event) => {
    const rect = charScaleSlider.elt.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const charWidth = rect.width / 20;
    window.charScaleIndex = constrain(Math.floor(clickX / charWidth), 0, 19);
    window.isDraggingScale = true;
  });

  charScaleSlider.mouseReleased(() => {
    window.isDraggingScale = false;
  });

  charScaleSlider.mouseMoved((event) => {
    if (window.isDraggingScale && mouseIsPressed) {
      const rect = charScaleSlider.elt.getBoundingClientRect();
      const moveX = event.clientX - rect.left;
      const charWidth = rect.width / 20;
      window.charScaleIndex = constrain(Math.floor(moveX / charWidth), 0, 19);
    } else {
      window.isDraggingScale = false;
    }
  });

  window.charScaleSlider = charScaleSlider;
  window.charScaleValues = charScaleValues;

  // (Removed unused slider thumb style block)

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
  styleAsciiLabel(textColorLabel);

  const textColorPicker = createColorPicker('#ffffff');
  textColorPicker.parent(colorControls);
  textColorPicker.style('width', '60px');
  textColorPicker.style('height', '40px');
  textColorPicker.input(() => {
    asciiBox.style('color', textColorPicker.value());
  });

  const bgColorLabel = createDiv('Background');
  bgColorLabel.parent(colorControls);
  styleAsciiLabel(bgColorLabel);

  const bgColorPicker = createColorPicker('#000000');
  bgColorPicker.parent(colorControls);
  bgColorPicker.style('width', '60px');
  bgColorPicker.style('height', '40px');
  bgColorPicker.input(() => {
    asciiBox.style('background', bgColorPicker.value());
  });

  document.body.style.backgroundColor = '#000';
  document.body.style.margin = '0';
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
  styleAsciiLabel(formatLabel);

  // Custom ASCII checkboxes
  function createAsciiCheckbox(label, checked) {
    const box = createDiv();
    box.style('font-family', 'CozetteCrossedSevenVector, monospace');
    box.style('color', '#fff');
    box.style('font-size', '20px');
    box.style('cursor', 'pointer');
    box.style('user-select', 'none');
    box.style('text-align', 'left');
    box.isChecked = checked;

    const render = () => {
      const symbol = box.isChecked ? 'x' : ' ';
      box.html(`[${symbol}] ${label}`);
    };

    box.mousePressed(() => {
      box.isChecked = !box.isChecked;
      render();
    });
    // Add .checked() method to return current checked state
    box.checked = () => box.isChecked;

    render();
    return box;
  }

  const exportTxt = createAsciiCheckbox('.txt', true);
  exportTxt.parent(formatGroup);

  const exportJpg = createAsciiCheckbox('.jpg', false);
  exportJpg.parent(formatGroup);

  const exportPng = createAsciiCheckbox('.png', false);
  exportPng.parent(formatGroup);

  // Add spacer between export checkboxes and timer checkbox
  const formatSpacer = createDiv('');
  formatSpacer.parent(formatGroup);
  formatSpacer.style('height', '10px');

  // Add 3s Timer checkbox
  const timerCheckbox = createAsciiCheckbox('3s Timer', false);
  timerCheckbox.parent(formatGroup);
  window.timerCheckbox = timerCheckbox;

  // Make these accessible globally for saveAsciiImage
  window.exportTxt = exportTxt;
  window.exportJpg = exportJpg;
  window.exportPng = exportPng;

  const spacer = createDiv();
  spacer.parent(uiPanel);
  spacer.style('flex-grow', '1');

  formatGroup.parent(uiPanel);

  photoButton = createDiv(`
+ - - - - - - - - - - +<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;[ TAKE PHOTO ]&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
+ - - - - - - - - - - +
  `);
  photoButton.parent(uiPanel);
  photoButton.style('font-family', 'CozetteCrossedSevenVector, monospace');
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
  photoButton.style('box-sizing', 'content-box');
  photoButton.style('margin', '0');
  photoButton.mousePressed(() => saveAsciiImage());

  const downloadMessage = createDiv('');
  downloadMessage.parent(uiPanel);
  downloadMessage.style('color', '#0f0');
  styleValueDisplay(downloadMessage);
  downloadMessage.style('opacity', '0');
  downloadMessage.style('transition', 'opacity 0.5s ease-out');
  window.downloadMessage = downloadMessage;
  // Add logo at the bottom right corner
  const logo = createImg('images/asciicam-favicon.png', 'ASCIIcam Logo');
  logo.style('position', 'fixed');
  logo.style('bottom', '20px');
  logo.style('right', '20px');
  logo.style('width', '50px');
  logo.style('height', 'auto');
  logo.style('opacity', '0.8');
  logo.style('z-index', '1000');
  logo.style('cursor', 'pointer');
  logo.mouseOver(() => logo.style('opacity', '1'));
  logo.mouseOut(() => logo.style('opacity', '0.8'));
}

function showDownloadMessage(text) {
  window.downloadMessage.html(text);
  window.downloadMessage.style('opacity', '1');
  setTimeout(() => {
    window.downloadMessage.style('opacity', '0');
  }, 2000);
}

function saveAsciiImage() {
  if (window.timerCheckbox?.checked()) {
    const countdownNumbers = ['3', '2', '1'];
    countdownNumbers.forEach((num, index) => {
      setTimeout(() => {
        photoButton.html(`
+----------------------+<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${num}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
+----------------------+
        `);
      }, index * 1000);
    });

    // After countdown, restore button text and take photo
    setTimeout(() => {
      photoButton.html(`
+----------------------+<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;[ TAKE PHOTO ]&nbsp;&nbsp;&nbsp;&nbsp;|<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>
+----------------------+
      `);
      captureAsciiPhoto();
    }, countdownNumbers.length * 1000);
  } else {
    captureAsciiPhoto();
  }
}

function captureAsciiPhoto() {
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
      html2canvas(document.getElementById('asciiBox'), { scale: 2 }).then(canvas => {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
    if (window.exportJpg?.checked()) {
      const jpgLink = document.createElement('a');
      jpgLink.download = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.jpg`;
      jpgLink.href = canvas.toDataURL('image/jpeg');
      document.body.appendChild(jpgLink);
      jpgLink.click();
      document.body.removeChild(jpgLink);
      showDownloadMessage('Saved as .jpg');
    }
    if (window.exportPng?.checked()) {
      const pngLink = document.createElement('a');
      pngLink.download = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.png`;
      pngLink.href = canvas.toDataURL('image/png');
      document.body.appendChild(pngLink);
      pngLink.click();
      document.body.removeChild(pngLink);
      showDownloadMessage('Saved as .png');
    }
      });
    }
  }, 150);

  const content = asciiDiv.html().replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ');
  if (window.exportTxt?.checked()) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showDownloadMessage('Saved as .txt');
  }
}

function draw() {
  // Preset configuration table for character grid settings
  const charGridSettings = [
    { scale: 2, charWidth: 1.42, charHeight: 2, cols: 500, rows: 360 },
    { scale: 4, charWidth: 2.84, charHeight: 4, cols: 338, rows: 180 },
    { scale: 6, charWidth: 4.26, charHeight: 6, cols: 255, rows: 120 },
    { scale: 8, charWidth: 5.68, charHeight: 8, cols: 205, rows: 90 },
    { scale: 10, charWidth: 7.1, charHeight: 10, cols: 171, rows: 72 },
    { scale: 12, charWidth: 8.52, charHeight: 12, cols: 147, rows: 60 },
    { scale: 14, charWidth: 9.94, charHeight: 14, cols: 129, rows: 51 },
    { scale: 16, charWidth: 11.36, charHeight: 16, cols: 115, rows: 45 },
    { scale: 18, charWidth: 12.78, charHeight: 18, cols: 104, rows: 40 },
    { scale: 20, charWidth: 14.2, charHeight: 20, cols: 95, rows: 36 },
    { scale: 22, charWidth: 15.62, charHeight: 22, cols: 87, rows: 33 },
    { scale: 24, charWidth: 17.04, charHeight: 24, cols: 80, rows: 30 },
    { scale: 26, charWidth: 18.46, charHeight: 26, cols: 74, rows: 28 },
    { scale: 28, charWidth: 19.88, charHeight: 28, cols: 69, rows: 26 },
    { scale: 30, charWidth: 21.3, charHeight: 30, cols: 65, rows: 24 },
    { scale: 32, charWidth: 22.72, charHeight: 32, cols: 62, rows: 22 },
    { scale: 34, charWidth: 24.14, charHeight: 34, cols: 58, rows: 21 },
    { scale: 36, charWidth: 25.56, charHeight: 36, cols: 55, rows: 20 },
    { scale: 38, charWidth: 26.98, charHeight: 38, cols: 52, rows: 19 },
    { scale: 40, charWidth: 28.4, charHeight: 40, cols: 50, rows: 18 }
  ];
  background(0);
  // Use preset grid settings for consistent ASCII output
  const {
    scale: charScale,
    charWidth,
    charHeight,
    cols,
    rows
  } = charGridSettings[window.charScaleIndex] || charGridSettings[1]; // fallback to default index 1
  // (Removed debug log of charScale and dimensions)
  video.size(cols, rows);
  video.loadPixels();

  if (video.pixels.length === 0) {
    return;
  }

  // --- Character scale logic ---
  const asciiBox = select('#asciiBox');
  asciiBox.style('font-size', `${charScale}px`);
  asciiBox.style('line-height', `${charHeight}px`);

  let asciiImage = '';
  // Loop over every character position, but traverse columns in reverse for horizontal mirroring
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
  // Update brightness value display
  if (window.brightnessValueDisplay) {
    const brightnessValue = asciiKnobIndex - 10;
    const prefix = brightnessValue > 0 ? '+' : '';
    window.brightnessValueDisplay.html(`${prefix}${brightnessValue}`);
  }
  window.charScaleSlider.html(generateAsciiSlider(window.charScaleIndex));
  if (window.charScaleValueDisplay) {
    window.charScaleValueDisplay.html(`${window.charScaleValues[window.charScaleIndex]}`);
  }

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
      ? `<span style="color:white;">■</span>`
      : `<span style="color:white;">=</span>`;
  }
  return '[' + slider + ']';
}
