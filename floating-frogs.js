// extension called 'Good Subliminal that overlays a bird and birsong, maybe a nice message'

// notes
const notes = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];

//helpers
const getHz = (N = 0) => 440 * Math.pow(2, N / 12);

// A440 is midi note 69, 0x45 hexadecimal
// So that means what?
// if start is -48, which is A at freq 27.5
// and if -48 is to the left of A440, 69
// then it is 21

const a440MidiNote = 69;
const freqs = (start, end) => {
  let black = 0,
  white = -2;
  return Array(end - start)
    .fill()
    .map((_, i) => {
      const key = (start + i) % 12;
      const midiNote = (start + i) + a440MidiNote;

      const note = notes[key < 0 ? 12 + key : key];
      const octave = Math.ceil(4 + (start + i) / 12);
      if (i === 0 && note === "C") black = -3;
      note.includes("#")
        ? ((black += 3), ["C#", "F#"].includes(note)
        && (black += 3))
        : (white += 3);

      return {
        note,
        midiNote,
        freq: getHz(start + i),
        octave: note === "B" || note === "A#"
        ? octave - 1 : octave,
        offset: note.includes("#") ? black : white,
      };
    });
};

// const keysData = freqs(-48, 40);
const keysData = freqs(-21, 27);

const getContainer = () => (document.querySelector("body"))


/* midi.js */
function enableMIDI(element) {
  const onMIDISuccess = (midiAccess) => {
  for (var input of midiAccess.inputs.values()) input.onmidimessage = getMIDIMessage;
}

const getMIDIMessage = message => {
  // eg In MIDI, note 53 is E6, with a frequency of 1318.51
  const [command, note, velocity] = message.data;

  switch (command) {
    case 144: // on
      if (velocity > 0) {
        const event = new CustomEvent("noteon", { detail: { note, velocity }});
        element.dispatchEvent(event)
      }
    break;

    case 128: // off
      const event = new CustomEvent("noteoff", { detail: { note }});
      element.dispatchEvent(event)
      break;
    }
  }

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, () => console.log("Could not access your MIDI devices."));
  }
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)
const gainNode = audioCtx.createGain()
const notemap = new Map();
gainNode.connect(audioCtx.destination);

function createOscillator(freq) {
  const oscNode = audioCtx.createOscillator()
  oscNode.type = "triangle" // sine, square, triangle, sawtooth
  oscNode.frequency.value = freq
  oscNode.connect(gainNode)
  return oscNode
}

function noteon(key) {
  if (!key.classList.contains("on")) {
    key.focus();
    gainNode.gain.value = 0.33
    const name = key.getAttribute('name');
    notemap.set(name, createOscillator(key.dataset.freq))
    notemap.get(name).start(0)

    key.classList.add("on")
    key.classList.add("keydown")
    // key.classList = ["on", "keydown"];

    // frog stuff

    // you can either have the behavior shoot frogs from 
    // any element that producrs a note
    // or always from the keyboard.
    const frogToAppend = getFrog();
    frogToAppend.classList.add(`frog-${key.dataset.note[0]}`);
    key.append(frogToAppend);
  }
}

function noteoff(key) {
  key.classList = [];
  // key.classList.remove("on")
  const name = key.getAttribute('name');
  const oscNode = notemap.get(name)
  if (oscNode) oscNode.stop(0)
  notemap.delete(name)
}

/* init */
function init() {
  const container = getContainer();
  enableMIDI(container); 
  container.addEventListener("noteon", (event) => {
    const noteElements = document.getElementsByName(`midi_${event.detail.note}`);
    noteon(noteElements[0], [{freq: noteElements[0].dataset.freq}]);
  })

  container.addEventListener("noteoff", (event) => {
    const noteElements = document.getElementsByName(`midi_${event.detail.note}`);
    noteoff(noteElements[0])
  })
}

function drawKeyboard() {
  const container = document.createElement('div');
  container.id = 'keyboard-container';

  const form = document.createElement('form');
  form.className = 'synth';
  form.id = 'midi';
  form.style = '--synth-bgc: hsl(216, 69%, 27%);--_h:216;';

  const keysContainer = document.createElement('div');
  keysContainer.classList = ['kb kb--49'];
  keysContainer.id = 'kb49';

  form.append(keysContainer);
  container.append(form);

  document.querySelector('body').appendChild(container);
}

const render = (data) => data.map(item => `
  <div data-note="${item.note}${item.octave}"
  name="midi_${item.midiNote}"
  data-midinote="${item.midiNote}"
  data-freq="${item.freq}" style="--gcs:${item.offset}" 
  type="button>"></div>`).join('\n')


drawKeyboard();
kb49.innerHTML = render(keysData);

const keys = midi.querySelectorAll('#kb49>div');
keys.forEach(key => {
  key.addEventListener('pointerdown', event => {
    noteon(event.target, [{freq: event.target.dataset.freq}]);
  })
  key.addEventListener('pointerup', event => { noteoff(event.target) })
  key.addEventListener('pointerleave', event => { noteoff(event.target) })
})

function getFrog() {
  const frog = document.createElement('div');
  frog.className = 'frog';
  const frogface = document.createElement('div');
  frogface.className = 'frogface';
  const frogEyes = document.createElement('div');
  frogEyes.className = 'frogeyes';
  const frogtongue = document.createElement('div');
  frogtongue.className = 'frogtongue';

  frogface.appendChild(frogEyes);
  frogface.appendChild(frogtongue);
  frog.appendChild(frogface);
  return frog;
}

init();

