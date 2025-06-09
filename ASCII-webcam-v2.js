// Hello, World! This is my first time "programming" so expect lots of errors.
// Also this was made with the help of AI. I am not a programmer, I am an artist.
// VERSION 2
let lastAsciiImage = '';
let video;
let isRecording = false;
let recBlinkInterval;
let recVisible = true;
let flashOverlay;
let shutterSound;
let countdownBeep;
let asciiSlider, asciiKnobIndex = 10, isDraggingKnob = false;
let captureMode = 'photo';
let videoReady = false;
let isDraggingCharScale = false;
let p5Canvas;
let captureFrameCount = 0;
let captureFrameStep = 2; // Capture every 2nd frame

const density = "Ñ@#W$9876543210?!abc;:+=-,._                    ";

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

  const charGridSettings = [
    { scale: 2, charWidth: 1.42, charHeight: 2, cols: 1038, rows: 360 },
    { scale: 4, charWidth: 2.84, charHeight: 4, cols: 519, rows: 180 },
    { scale: 6, charWidth: 4.26, charHeight: 6, cols: 346, rows: 120 },
    { scale: 8, charWidth: 5.68, charHeight: 8, cols: 260, rows: 90 },
    { scale: 10, charWidth: 7.1, charHeight: 10, cols: 208, rows: 72 },
    { scale: 12, charWidth: 8.52, charHeight: 12, cols: 173, rows: 60 },
    { scale: 14, charWidth: 9.94, charHeight: 14, cols: 148, rows: 51 },
    { scale: 16, charWidth: 11.36, charHeight: 16, cols: 129, rows: 45 },
    { scale: 18, charWidth: 12.78, charHeight: 18, cols: 115, rows: 40 },
    { scale: 20, charWidth: 14.2, charHeight: 20, cols: 103, rows: 36 },
    { scale: 22, charWidth: 15.62, charHeight: 22, cols: 94, rows: 32 },
    { scale: 24, charWidth: 17.04, charHeight: 24, cols: 86, rows: 31 },
    { scale: 26, charWidth: 18.46, charHeight: 26, cols: 79, rows: 28 },
    { scale: 28, charWidth: 19.88, charHeight: 28, cols: 73, rows: 26 },
    { scale: 30, charWidth: 21.3, charHeight: 30, cols: 68, rows: 24 },
    { scale: 32, charWidth: 22.72, charHeight: 32, cols: 64, rows: 22 },
    { scale: 34, charWidth: 24.14, charHeight: 34, cols: 60, rows: 21 },
    { scale: 36, charWidth: 25.56, charHeight: 36, cols: 57, rows: 20 },
    { scale: 38, charWidth: 26.98, charHeight: 38, cols: 54, rows: 19 },
    { scale: 40, charWidth: 28.4, charHeight: 40, cols: 51, rows: 18 }
  ];

function preload() {
  shutterSound = loadSound('sounds/8-bit-shutter.mp3');
  console.log('Shutter sound loaded:', shutterSound);
  countdownBeep = loadSound('sounds/8-bit-beep.mp3');
}

// Helper for countdown, runs action after countdown
function startCountdownThen(action) {
  const countdownNumbers = ['3', '2', '1'];
  countdownNumbers.forEach((num, index) => {
    setTimeout(() => {
      updateCameraUIWithCountdown(num);
      if (countdownBeep && countdownBeep.isLoaded()) countdownBeep.play();
    }, index * 1000);
  });
  setTimeout(() => {
    updateCameraUI();
    action();
  }, countdownNumbers.length * 1000);
}

function setup() {
  // Add global CSS for .download-toast
  const style = document.createElement('style');
  style.innerHTML = `.download-toast { pointer-events: none; }`;
  document.head.appendChild(style);
  frameRate(30);
  window.charScaleIndex = 5; // default to charScale = 12
  const charScaleValues = Array.from({ length: 20 }, (_, i) => 2 + i * 2);
  const charScaleLabels = charScaleValues.map(val => val === 4 ? `${val} (true-to-scale)` : `${val}`);
  window.charScaleLabels = charScaleLabels;
  window.charScaleValues = charScaleValues;

  // --- Helper functions for label and value styling ---
  function styleAsciiLabel(div, size = '20px') {
    div.style('font-family', 'CozetteCrossedSevenVector, monospace');
    div.style('color', '#fff');
    div.style('font-size', size);
    div.style('margin-bottom', '10px');
  }

  function styleValueDisplay(div, size = '16px') {
    div.style('font-family', 'CozetteCrossedSevenVector, monospace');
    div.style('color', '#black');
    div.style('font-size', size);
    div.style('margin-bottom', '6px');
  }

  const fixedCanvasWidth = 960;
  const maxCanvasHeight = 720;

  const {
    charWidth,
    charHeight
  } = charGridSettings[window.charScaleIndex] || charGridSettings[1];

  const cols = Math.floor(fixedCanvasWidth / charWidth);
  const rows = Math.floor(maxCanvasHeight / charHeight);

  const canvasWidth = cols * charWidth;
  const canvasHeight = rows * charHeight;
  p5Canvas = createCanvas(canvasWidth, canvasHeight);
  p5Canvas.style('display', 'block');
  p5Canvas.style('margin', '0');
  p5Canvas.style('z-index', '1');
  p5Canvas.style('background', '#000');
  p5Canvas.style('width', `${canvasWidth}px`);
  p5Canvas.style('height', `${canvasHeight}px`);
  textFont('CozetteCrossedSevenVector');
  textSize(charHeight);
  textLeading(charHeight);  fill(255);
  noStroke();
  pixelDensity(window.devicePixelRatio);
  video = createCapture(VIDEO, () => {
    videoReady = true;
  });
  video.size(160, 120);
  video.hide();

  const layoutWrapper = select('.page-layout');

  const canvasWrapper = createDiv();
  canvasWrapper.parent(layoutWrapper);
  canvasWrapper.child(p5Canvas);
  canvasWrapper.style('display', 'flex');
  canvasWrapper.style('justify-content', 'center');
  canvasWrapper.style('margin', '10px');

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
  uiPanel.style('width', '220px')
  uiPanel.style('box-sizing', 'border-box');
  uiPanel.style('margin-top', '0px');
  uiPanel.style('margin-left', '10px');
  uiPanel.style('margin-right', '10px');
  uiPanel.style('font-family', 'CozetteCrossedSevenVector, monospace');
  uiPanel.elt.style.fontFamily = 'CozetteCrossedSevenVector, monospace';

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
  window.asciiSlider = asciiSlider;

  asciiSlider.mousePressed((event) => {
    const rect = asciiSlider.elt.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const knobWidth = rect.width / 20;
    const index = constrain(Math.floor(clickX / knobWidth), 0, 19);
    asciiKnobIndex = index;
    asciiSlider.html(generateAsciiSlider(asciiKnobIndex));
    if (window.brightnessValueDisplay) {
      const brightnessValue = asciiKnobIndex - 10;
      const prefix = brightnessValue > 0 ? '+' : '';
      window.brightnessValueDisplay.html(`${prefix}${brightnessValue}`);
    }
    isDraggingKnob = true;
  });
  // Mouse moved event for asciiSlider
  asciiSlider.mouseMoved((event) => {
    if (isDraggingKnob) {
      const rect = asciiSlider.elt.getBoundingClientRect();
      const moveX = event.clientX - rect.left;
      const knobWidth = rect.width / 20;
      const index = constrain(Math.floor(moveX / knobWidth), 0, 19);
      if (index !== asciiKnobIndex) {
        asciiKnobIndex = index;
        asciiSlider.html(generateAsciiSlider(asciiKnobIndex));
        if (window.brightnessValueDisplay) {
          const brightnessValue = asciiKnobIndex - 10;
          const prefix = brightnessValue > 0 ? '+' : '';
          window.brightnessValueDisplay.html(`${prefix}${brightnessValue}`);
        }
      }
    }
  });
  asciiSlider.mouseReleased(() => { isDraggingKnob = false; });


  // --- Character Scale Slider ---
  const scaleGroup = createDiv();
  scaleGroup.style('display', 'flex');
  scaleGroup.style('flex-direction', 'column');
  scaleGroup.style('align-items', 'center');

  const scaleLabel = createDiv('Character Scale');
  scaleLabel.parent(scaleGroup);
  styleAsciiLabel(scaleLabel);


  const charScaleValueDisplay = createDiv(`Scale: ${charScaleValues[window.charScaleIndex]}`);
  charScaleValueDisplay.parent(scaleGroup);
  styleValueDisplay(charScaleValueDisplay);
  window.charScaleValueDisplay = charScaleValueDisplay;

  const charScaleSlider = createDiv(generateAsciiSlider(window.charScaleIndex));
  charScaleSlider.style('color', 'white');
  charScaleSlider.style('font-family', 'monospace');
  charScaleSlider.style('font-size', '13px');
  charScaleSlider.style('text-align', 'center');
  charScaleSlider.style('user-select', 'none');
  charScaleSlider.style('cursor', 'default');
  charScaleSlider.parent(scaleGroup);
  window.charScaleSlider = charScaleSlider;

  // Ensure scaleGroup is added to uiPanel after slider is set up
  scaleGroup.parent(uiPanel);

  // --- Character Scale Slider mouse events ---
  charScaleSlider.mousePressed((event) => {
    const rect = charScaleSlider.elt.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const knobWidth = rect.width / 20;
    const index = constrain(Math.floor(clickX / knobWidth), 0, 19);
    window.charScaleIndex = index;
    isDraggingCharScale = true;

    const settings = charGridSettings[index];
    textSize(settings.charHeight);
    textLeading(settings.charHeight);
    charScaleSlider.html(generateAsciiSlider(index));
    if (window.charScaleValueDisplay) {
      window.charScaleValueDisplay.html(`${window.charScaleValues[index]}`);
    }
  });
  // Mouse moved event for charScaleSlider
  charScaleSlider.mouseMoved((event) => {
    if (isDraggingCharScale) {
      const rect = charScaleSlider.elt.getBoundingClientRect();
      const moveX = event.clientX - rect.left;
      const knobWidth = rect.width / 20;
      const index = constrain(Math.floor(moveX / knobWidth), 0, 19);
      if (index !== window.charScaleIndex) {
        window.charScaleIndex = index;
        const settings = charGridSettings[index];
        textSize(settings.charHeight);
        textLeading(settings.charHeight);
        charScaleSlider.html(generateAsciiSlider(index));
        if (window.charScaleValueDisplay) {
          window.charScaleValueDisplay.html(`${window.charScaleValues[index]}`);
        }
      }
    }
  });
  charScaleSlider.mouseReleased(() => { isDraggingCharScale = false; });

  // --- Color controls for ASCII text and background ---
  const colorControls = createDiv();
  colorControls.parent(uiPanel);
  colorControls.style('display', 'flex');
  colorControls.style('flex-direction', 'column');
  colorControls.style('align-items', 'center');
  colorControls.style('gap', '10px');

  // Text Color Picker Group
  const textColorGroup = createDiv();
  textColorGroup.parent(colorControls);
  textColorGroup.style('display', 'flex');
  textColorGroup.style('align-items', 'center');
  textColorGroup.style('gap', '10px');

  const textColorLabel = createDiv('Text Color');
  textColorLabel.parent(textColorGroup);
  styleAsciiLabel(textColorLabel, '16px');

  const textColorPicker = createColorPicker('#ffffff');
  textColorPicker.parent(textColorGroup);
  textColorPicker.style('width', '60px');
  textColorPicker.style('height', '40px');
  window.textColorPicker = textColorPicker;

  // Background Color Picker Group
  const bgColorGroup = createDiv();
  bgColorGroup.parent(colorControls);
  bgColorGroup.style('display', 'flex');
  bgColorGroup.style('align-items', 'center');
  bgColorGroup.style('gap', '10px');

  const bgColorLabel = createDiv('Background');
  bgColorLabel.parent(bgColorGroup);
  styleAsciiLabel(bgColorLabel, '16px');

  const bgColorPicker = createColorPicker('#000000');
  bgColorPicker.parent(bgColorGroup);
  bgColorPicker.style('width', '60px');
  bgColorPicker.style('height', '40px');
  window.bgColorPicker = bgColorPicker;

  document.body.style.backgroundColor = '#000';
  document.body.style.margin = '0';
  document.body.style.overflow = 'auto';

  flashOverlay = createDiv('');
  flashOverlay.parent(p5Canvas);
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

  // Export format selection checkboxes
  const formatGroup = createDiv();
  formatGroup.style('display', 'flex');
  formatGroup.style('flex-direction', 'column');
  formatGroup.style('align-items', 'center');
  formatGroup.style('gap', '4px');
  formatGroup.style('margin-top', '0px');

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

  // 3s Timer checkbox
  const timerCheckbox = createAsciiCheckbox('3s Timer', false);
  timerCheckbox.parent(formatGroup);
  window.timerCheckbox = timerCheckbox;

  // Make these accessible globally for saveAsciiImage
  window.exportTxt = exportTxt;
  window.exportJpg = exportJpg;
  window.exportPng = exportPng;

  formatGroup.parent(uiPanel);

  // Mode toggle dual-button layout
  const modeToggleWrapper = createDiv();
  modeToggleWrapper.parent(uiPanel);
  modeToggleWrapper.style('display', 'flex');
  modeToggleWrapper.style('justify-content', 'center');
  modeToggleWrapper.style('gap', '10px');
  modeToggleWrapper.style('margin-top', '10px');
  modeToggleWrapper.style('font-family', 'CozetteCrossedSevenVector, monospace');

  const photoButton = createDiv('photo mode');
  photoButton.parent(modeToggleWrapper);
  photoButton.style('cursor', 'pointer');
  photoButton.style('padding', '4px 8px');
  photoButton.style('border', '1px dashed #999');

  const movieButton = createDiv('movie mode');
  movieButton.parent(modeToggleWrapper);
  movieButton.style('cursor', 'pointer');
  movieButton.style('padding', '4px 8px');
  movieButton.style('border', '1px dashed #999');

  function updateModeButtons() {
    if (captureMode === 'photo') {
      photoButton.style('color', '#fff');
      movieButton.style('color', '#888');
    } else {
      movieButton.style('color', '#fff');
      photoButton.style('color', '#888');
    }
  }
  updateModeButtons();

  photoButton.mousePressed(() => {
    if (captureMode !== 'photo') {
      captureMode = 'photo';
      isRecording = false;
      updateCameraUI();
      updateModeButtons();
    }
  });

  movieButton.mousePressed(() => {
    if (captureMode !== 'video') {
      captureMode = 'video';
      isRecording = false;
      updateCameraUI();
      updateModeButtons();
    }
  });

  // ASCII camera button (visual + action)
  const cameraButton = createDiv('');
  cameraButton.parent(uiPanel);
  cameraButton.style('font-family', 'monospace');
  cameraButton.style('white-space', 'pre');
  cameraButton.style('color', '#fff');
  cameraButton.style('text-align', 'center');
  cameraButton.style('cursor', 'pointer');
  cameraButton.style('line-height', '1.2');
  cameraButton.style('height', 'auto');
  cameraButton.style('margin-top', '20px');
  cameraButton.mouseOver(() => {
    cameraButton.style('color', 'red');
  });
  cameraButton.mouseOut(() => {
    cameraButton.style('color', '#fff');
  });
  window.cameraButton = cameraButton;

  // Camera button handler
  cameraButton.mousePressed(() => {
    if (captureMode === 'photo') {
      if (window.timerCheckbox?.checked()) {
        startCountdownThen(captureAsciiPhoto);
      } else {
        captureAsciiPhoto();
      }
    } else {
      // --- MediaRecorder logic for video recording with audio, including mic warning if disabled ---
      const attemptRecording = () => {
        const startRecording = (stream) => {
          let recordedChunks = [];
          window.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs=vp9',
            videoBitsPerSecond: 8000000
          });

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const webmFileName = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.webm`;
            a.href = url;
            a.download = webmFileName;
            a.click();
            URL.revokeObjectURL(url);
            showDownloadMessage('Saved as .webm');
            updateCameraUI();
            if (window.recordingTimer) {
              window.recordingTimer.remove();
              window.recordingTimer = null;
            }
            if (window.recordingInterval) {
              clearInterval(window.recordingInterval);
              window.recordingInterval = null;
            }
          };

          window.recordedChunks = recordedChunks;

          isRecording = true;
          recordedChunks.length = 0;
          recBlinkInterval = setInterval(() => {
            recVisible = !recVisible;
            updateCameraUI();
            redraw();
          }, 500);
          loop();
          updateCameraUI();
          mediaRecorder.start();

          // Show recording timer
          const startTime = Date.now();
          if (!window.recordingTimer) {
            const timerDiv = createDiv('00:00');
            timerDiv.style('position', 'static');
            timerDiv.style('margin-top', '10px');
            timerDiv.style('text-align', 'center');
            timerDiv.style('color', '#fff');
            timerDiv.style('font-family', 'CozetteCrossedSevenVector, monospace');
            timerDiv.style('font-size', '18px');
            timerDiv.style('background-color', 'rgba(0, 0, 0, 0.7)');
            timerDiv.style('padding', '4px 8px');
            timerDiv.style('z-index', '999');
            uiPanel.child(timerDiv);
            window.recordingTimer = timerDiv;

            window.recordingInterval = setInterval(() => {
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
              const seconds = String(elapsed % 60).padStart(2, '0');
              timerDiv.html(`${minutes}:${seconds}`);
            }, 1000);
          }

          console.log("Recording STARTED");
        };

        navigator.mediaDevices.getUserMedia({ audio: true }).then(micStream => {
          const canvasStream = p5Canvas.elt.captureStream(30);
          const combinedTracks = [
            ...canvasStream.getVideoTracks(),
            ...micStream.getAudioTracks()
          ];
          const fullStream = new MediaStream(combinedTracks);
          startRecording(fullStream);
        }).catch(() => {
          const micWarning = createDiv('Mic is disabled. Do you wish to proceed with the recording?');
          micWarning.style('position', 'fixed');
          micWarning.style('top', '50%');
          micWarning.style('left', '50%');
          micWarning.style('transform', 'translate(-50%, -50%)');
          micWarning.style('background', '#fff');
          micWarning.style('color', '#000');
          micWarning.style('padding', '20px');
          micWarning.style('border', '3px solid black');
          micWarning.style('z-index', '2000');
          micWarning.style('font-family', 'CozetteCrossedSevenVector, monospace');
          micWarning.style('text-align', 'center');

          const buttonContainer = createDiv();
          buttonContainer.parent(micWarning);
          buttonContainer.style('margin-top', '10px');
          buttonContainer.style('display', 'flex');
          buttonContainer.style('justify-content', 'center');
          buttonContainer.style('gap', '20px');

          const yesButton = createButton('Yes');
          yesButton.parent(buttonContainer);
          yesButton.mousePressed(() => {
            micWarning.remove();
            const canvasStream = p5Canvas.elt.captureStream(30);
            const stream = new MediaStream(canvasStream.getVideoTracks());
            startRecording(stream);
          });

          const noButton = createButton('No');
          noButton.parent(buttonContainer);
          noButton.mousePressed(() => {
            micWarning.remove();
            showDownloadMessage("Recording cancelled");
          });
        });
      };

      if (!isRecording && videoReady) {
        if (window.timerCheckbox?.checked()) {
          startCountdownThen(attemptRecording);
        } else {
          attemptRecording();
        }
      } else {
        console.log("Recording STOPPING");
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(recBlinkInterval);
        updateCameraUI();
        console.log("Recording STOPPED and SAVED");
      }
    }
  });

  updateCameraUI();

  const downloadMessage = createDiv('');
  downloadMessage.parent(uiPanel);
  downloadMessage.style('color', '#000000');
  styleValueDisplay(downloadMessage);
  downloadMessage.style('opacity', '0');
  downloadMessage.style('transition', 'opacity 0.5s ease-out');
  downloadMessage.style('background-color', 'rgb(255, 0, 0)');
  downloadMessage.style('padding', '8px 16px');
  downloadMessage.style('border', '3px solid black');
  downloadMessage.style('position', 'absolute');
  downloadMessage.style('top', '50%');
  downloadMessage.style('left', '50%');
  downloadMessage.style('transform', 'translate(-50%, -50%)');
  downloadMessage.style('z-index', '1000');
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

// Helper: Show a floating toast message in the center (with stacking)
function showToast(text) {
  const individualMessage = createDiv(text);
  individualMessage.parent(document.body);
  individualMessage.style('color', '#000000');
  individualMessage.style('font-family', 'CozetteCrossedSevenVector, monospace');
  individualMessage.style('font-size', '16px');
  individualMessage.style('position', 'absolute');
  const offset = document.querySelectorAll('.download-toast').length;
  individualMessage.addClass('download-toast');
  individualMessage.style('top', `calc(50% + ${offset * 40}px)`);
  individualMessage.style('left', '50%');
  individualMessage.style('transform', 'translate(-50%, -50%)');
  individualMessage.style('z-index', '1000');
  individualMessage.style('background-color', 'rgb(255, 0, 0)');
  individualMessage.style('padding', '8px 16px');
  individualMessage.style('border', '3px solid black');
  individualMessage.style('opacity', '1');
  individualMessage.style('transition', 'opacity 0.5s ease-out');
  setTimeout(() => {
    individualMessage.style('opacity', '0');
    setTimeout(() => individualMessage.remove(), 500);
  }, 1000);
}


// ----------- CAMERA UI LOGIC -----------
function updateCameraUI() {
  let art = '';
  if (captureMode === 'photo' && !isRecording) {
    art = `_____/[_]\\__==_
[---------------]
| PC  /¯¯¯\\     |
|    |click|    |
|     \\___/     |
[===============]`;
    updateExportOptionsDisabled(false);
  } else if (!isRecording) {
    art = `______    ______   
/        \\/        \\   
|                   |   
\\===================/   
\\_________________/   
)==|                 |     /
   |    Click to     |====||
   |     record     _|====||
   |              ((©))    \\
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯   `;
    updateExportOptionsDisabled(true);
  } else {
    const blinkSymbol = recVisible ? '<span style="color:red;">   ■ rec   </span>' : '           ';
    art = `______    ______   
/        \\/        \\   
|                   |   
\\===================/   
\\_________________/   
)==|                 |     /
   |   ${blinkSymbol}   |====||
   |                _|====||
   |              ((©))    \\
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯   `;
    updateExportOptionsDisabled(true);
  }
  cameraButton.html(`<pre>${art}</pre>`);
}

function updateExportOptionsDisabled(disabled) {
  [window.exportTxt, window.exportJpg, window.exportPng].forEach(opt => {
    opt.style('opacity', disabled ? '0.2' : '1');
    opt.elt.style.pointerEvents = disabled ? 'none' : 'auto';
  });
}

// Helper function to show countdown state on camera button
function updateCameraUIWithCountdown(number) {
  let countdownArt = '';
  if (captureMode === 'photo') {
    countdownArt = `_____/[_]\\__==_
[---------------]
| PC  /¯¯¯\\     |
|    |  ${number}  |    |
|     \\___/     |
[===============]`;
  } else {
    countdownArt = `______    ______   
/        \\/        \\   
|                   |   
\\===================/   
\\_________________/   
)==|                 |     /
   |        ${number}        |====||
   |                _|====||
   |              ((©))    \\
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯   `;
  }
  cameraButton.html(`<pre>${countdownArt}</pre>`);
}


function showDownloadMessage(text) {
  if (window.downloadMessage) {
    window.downloadMessage.html(text);
    window.downloadMessage.style('opacity', '1');
    setTimeout(() => {
      window.downloadMessage.style('opacity', '0');
    }, 1000);
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

    const canvasElement = document.querySelector('canvas');
    if (window.exportJpg?.checked() || window.exportPng?.checked()) {
      html2canvas(canvasElement, { scale: 2 }).then(exportCanvas => {
        // Handle .jpg
        if (window.exportJpg?.checked()) {
          const jpgLink = document.createElement('a');
          jpgLink.download = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.jpg`;
          jpgLink.href = exportCanvas.toDataURL('image/jpeg');
          document.body.appendChild(jpgLink);
          jpgLink.click();
          document.body.removeChild(jpgLink);
          showToast('Saved as .jpg');
        }
        // Handle .png
        if (window.exportPng?.checked()) {
          const pngLink = document.createElement('a');
          pngLink.download = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.png`;
          pngLink.href = exportCanvas.toDataURL('image/png');
          document.body.appendChild(pngLink);
          pngLink.click();
          document.body.removeChild(pngLink);
          showToast('Saved as .png');
        }
        // Handle .txt after html2canvas
        const content = lastAsciiImage;
        if (window.exportTxt?.checked()) {
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const txtLink = document.createElement('a');
          txtLink.href = url;
          txtLink.download = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.txt`;
          document.body.appendChild(txtLink);
          txtLink.click();
          document.body.removeChild(txtLink);
          showToast('Saved as .txt');
        }
      });
    } else {
      // If neither .jpg nor .png is checked, still allow .txt export
      const content = lastAsciiImage;
      if (window.exportTxt?.checked()) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const txtLink = document.createElement('a');
        txtLink.href = url;
        txtLink.download = `AsciiCam-br${asciiKnobIndex - 10}-charScale${window.charScaleValues[window.charScaleIndex]}.txt`;
        document.body.appendChild(txtLink);
        txtLink.click();
        document.body.removeChild(txtLink);
        showToast('Saved as .txt');
      }
    }
  }, 150);
}

function draw() {
  if (!videoReady) return;
  // charGridSettings and destructure already defined in setup; reuse here
  background(bgColorPicker.value());
  fill(textColorPicker.value());
  // Use preset grid settings for consistent ASCII output
  // charWidth, charHeight, cols, rows are available from setup()
  // Use charGridSettings from setup/global scope, do not redeclare here
  const { 
    scale: charScale,
    charWidth,
    charHeight,
    cols,
    rows
  } = charGridSettings[window.charScaleIndex] || charGridSettings[1];
  // Update text formatting if scale changes (keep canvas size fixed)
  // textSize(charHeight);
  // textLeading(charHeight);
  video.size(cols, rows);
  video.loadPixels();

  if (video.pixels.length === 0) {
    return;
  }

  // --- Character scale logic ---
  // Removed asciiBox style manipulation

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
  // Store ASCII image globally for export
  lastAsciiImage = asciiImage;
  
  // Render ASCII image to canvas
  let yOffset = charHeight;
  const lines = asciiImage.split('\n');
  for (let line of lines) {
    text(line, 0, yOffset);
    yOffset += charHeight;
  }

  if (window.asciiSlider) window.asciiSlider.html(generateAsciiSlider(asciiKnobIndex));
  // Update brightness value display
  if (window.brightnessValueDisplay) {
    const brightnessValue = asciiKnobIndex - 10;
    const prefix = brightnessValue > 0 ? '+' : '';
    window.brightnessValueDisplay.html(`${prefix}${brightnessValue}`);
  }
  if (window.charScaleSlider) window.charScaleSlider.html(generateAsciiSlider(window.charScaleIndex));
  if (window.charScaleValueDisplay) {
    window.charScaleValueDisplay.html(`${window.charScaleValues[window.charScaleIndex]}`);
  }



// --- Global mouseDragged handler for both sliders ---
function mouseDragged() {
  if (isDraggingKnob && window.asciiSlider) {
    const rect = window.asciiSlider.elt.getBoundingClientRect();
    const moveX = constrain(event.clientX - rect.left, 0, rect.width);
    const knobWidth = rect.width / 20;
    const index = constrain(Math.floor(moveX / knobWidth), 0, 19);
    if (index !== asciiKnobIndex) {
      asciiKnobIndex = index;
      window.asciiSlider.html(generateAsciiSlider(asciiKnobIndex));
      if (window.brightnessValueDisplay) {
        const brightnessValue = asciiKnobIndex - 10;
        const prefix = brightnessValue > 0 ? '+' : '';
        window.brightnessValueDisplay.html(`${prefix}${brightnessValue}`);
      }
    }
  }

  if (isDraggingCharScale && window.charScaleSlider) {
    const rect = window.charScaleSlider.elt.getBoundingClientRect();
    const moveX = constrain(event.clientX - rect.left, 0, rect.width);
    const knobWidth = rect.width / 20;
    const index = constrain(Math.floor(moveX / knobWidth), 0, 19);
    if (index !== window.charScaleIndex) {
      window.charScaleIndex = index;
      const settings = charGridSettings[index];
      textSize(settings.charHeight);
      textLeading(settings.charHeight);
      window.charScaleSlider.html(generateAsciiSlider(index));
      if (window.charScaleValueDisplay) {
        window.charScaleValueDisplay.html(`${window.charScaleValues[index]}`);
      }
    }
  }
}
}