// A simple map of musical notes to their corresponding frequencies in Hz.
const noteToFreq: { [key: string]: number } = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
};

let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let isPlaying = false;
let noteTimeout: number | undefined;

const getAudioContext = (): AudioContext => {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};


/**
 * Plays a sequence of musical notes using the Web Audio API.
 * @param melody An array of strings representing musical notes (e.g., ['C4', 'E4', 'G4']).
 */
export const playMelody = (melody: string[]): void => {
    try {
        const context = getAudioContext();
        if (context.state === 'suspended') {
            context.resume();
        }

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine'; // A soft, pleasant tone
        gainNode.gain.setValueAtTime(0, context.currentTime);

        const noteDuration = 0.2;
        const noteGap = 0.05;

        melody.forEach((note, index) => {
            const freq = noteToFreq[note.toUpperCase()];
            if (freq) {
                const startTime = context.currentTime + index * (noteDuration + noteGap);
                gainNode.gain.setValueAtTime(0.5, startTime);
                oscillator.frequency.setValueAtTime(freq, startTime);
                gainNode.gain.setValueAtTime(0, startTime + noteDuration);
            }
        });
        
        const totalDuration = melody.length * (noteDuration + noteGap);
        oscillator.start();
        oscillator.stop(context.currentTime + totalDuration);
        
    } catch (e) {
        console.error("Could not play sound:", e);
    }
};

const melodySequence = [
    { note: 'C4', duration: 1.5 }, { note: 'G4', duration: 1.5 }, { note: 'A4', duration: 1.5 },
    { note: 'E4', duration: 1.5 }, { note: 'F4', duration: 1.5 }, { note: 'C4', duration: 1.5 },
    { note: 'G4', duration: 1.5 }, { note: 'D4', duration: 1.5 },
];

let currentNoteIndex = 0;

const scheduleNextNote = () => {
    if (!isPlaying || !audioContext || !oscillator || !gainNode) return;

    const { note, duration } = melodySequence[currentNoteIndex];
    const freq = noteToFreq[note.toUpperCase()];
    const currentTime = audioContext.currentTime;

    if (freq) {
        gainNode.gain.cancelScheduledValues(currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.0, currentTime + 0.01);
        
        oscillator.frequency.setValueAtTime(freq, currentTime + 0.02);

        gainNode.gain.linearRampToValueAtTime(0.15, currentTime + 0.2); // Fade in to a low volume
        gainNode.gain.linearRampToValueAtTime(0.0, currentTime + duration - 0.2); // Fade out
    }
    
    currentNoteIndex = (currentNoteIndex + 1) % melodySequence.length;
    noteTimeout = window.setTimeout(scheduleNextNote, duration * 1000);
};

export const playBackgroundMusic = (): void => {
    if (isPlaying) return;
    try {
        const context = getAudioContext();
        if (context.state === 'suspended') {
            context.resume();
        }

        oscillator = context.createOscillator();
        gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0, context.currentTime);
        
        isPlaying = true;
        currentNoteIndex = 0;

        oscillator.start();
        scheduleNextNote();

    } catch (e) {
        console.error("Could not play music:", e);
    }
};

export const stopBackgroundMusic = (): void => {
    if (!isPlaying || !oscillator) return;
    
    clearTimeout(noteTimeout);
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
    gainNode = null;
    isPlaying = false;
};