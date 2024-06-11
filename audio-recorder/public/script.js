const recordButton = document.getElementById('recordButton');
const statusText = document.getElementById('status');
const transcriptTextarea = document.getElementById('transcript');
const visualizer = document.createElement('div');
visualizer.id = 'visualizer';
document.body.appendChild(visualizer);

let audioContext;
let mediaRecorder;
let chunks = [];
let analyser;
let dataArray;
let canvas;
let canvasContext;

recordButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        statusText.textContent = 'Recording stopped. Processing audio...';
    } else {
        startRecording();
    }
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            const source = audioContext.createMediaStreamSource(stream);
            if (!analyser) {
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
            }
            source.connect(analyser);
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.width = visualizer.clientWidth;
                canvas.height = visualizer.clientHeight;
                visualizer.appendChild(canvas);
                canvasContext = canvas.getContext('2d');
            }
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = e => {
                const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
                chunks = [];
                const audioURL = URL.createObjectURL(blob);
                const audio = new Audio(audioURL);
                audio.play();
                processAudio(blob);
            };
            mediaRecorder.start();
            statusText.textContent = 'Recording...';
            visualize();
        })
        .catch(err => {
            console.error('Error accessing audio input:', err);
            statusText.textContent = 'Error accessing audio input.';
        });
}

function visualize() {
    if (!canvasContext) {
        return;
    }

    function draw() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            requestAnimationFrame(draw);
        }
        analyser.getByteTimeDomainData(dataArray);
        canvasContext.fillStyle = 'rgb(245, 245, 245)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'rgb(0, 0, 0)';
        canvasContext.beginPath();
        const sliceWidth = canvas.width * 1.0 / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            if (i === 0) {
                canvasContext.moveTo(x, y);
            } else {
                canvasContext.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();
    }

    draw();
}

function processAudio(blob) {
    // Implement your audio processing logic here.
    // For example, you could send the audio blob to a server for transcription.
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result.replace('data:audio/ogg; codecs=opus;base64,', '');
        // Send base64String to your server for processing
        console.log(base64String);
    };
    reader.readAsDataURL(blob);
}
