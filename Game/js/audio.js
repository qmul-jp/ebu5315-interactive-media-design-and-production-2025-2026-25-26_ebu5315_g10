/**
 * audio.js - Sound Effects System
 * Ball collision, boundary bounce, and success sounds
 * Depends on: config.js
 */

        function initAudio() {
            if(audioCtx) return;
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        function playSound(type) {
            if(!soundEnabled || !audioCtx) return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            let freq = 800, duration = 0.15;
            switch(type){
                case 'collision': freq = 600; duration = 0.1; break;
                case 'score': freq = 1200; duration = 0.2; break;
                case 'fail': freq = 300; duration = 0.2; break;
                case 'mode': freq = 500; duration = 0.08; break;
                case 'undo': freq = 400; duration = 0.1; break;
                default: freq = 800;
            }
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.start();
            osc.stop(now + duration);
        }
        