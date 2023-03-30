DZ.init({
    appId: '591724',
    channelUrl: ""
});

let spaceRegexp = new RegExp(/ /,"gi");
const form = document.querySelector('form');
const resultsDiv = document.getElementById('results');
const topBarSpan = document.querySelector('.currently-playing span');
const player = document.getElementById('player');
const audioDurationSpan = document.getElementById('duration');
const audioCurrentPlaytimeSpan = document.getElementById('playing-time');
const audioInputRange = document.getElementById('audio-track');
const menu = document.getElementById('menu');
const currentlyPlaying = document.querySelector('.currently-playing');
const canvas = document.getElementById('audio-frequencies');
const ctx = canvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.connect(audioCtx.destination);
analyser.fftSize = 512;

// Variables for audio
var audioSource = null;
var x = 0;
let audio = new Audio();
let data; //Tracks
let currentTrack, oldTrack;
var audioDuration;
var updateTrackInterval;
var inputSearchFocused = false;
var bufferLength, dataArray, barWidth;
audio.crossOrigin = "anonymous";

form.addEventListener('submit', onFormSubmit);

form.elements.search.addEventListener('focus', () => inputSearchFocused = true);
form.elements.search.addEventListener('blur', () => inputSearchFocused = false);

document.querySelector('#menu button').addEventListener('click', () => menu.classList.remove("active"))


function onFormSubmit(e) {
    e.preventDefault();
    const query = e.target.elements.search.value.replaceAll(spaceRegexp, "");
    if(query === "") return;

    DZ.api(`/search?q=${encodeURIComponent(query)}`, (res) => {
        data = filterByKeyValue(res.data, "type", "track");
        resultsDiv.innerHTML = "";
        data.forEach((track, i) => {
            track.next = i >= data.length ? data[0] : data[i+1];
            const result = document.createElement('div');
            result.classList.add('result');
            result.innerHTML = getResultDivTemplate(track);
            result.addEventListener('click', () => playTrack(track));
            resultsDiv.append(result);
        })
    });
}

function playTrack(track) {
    oldTrack = currentTrack;
    if(currentTrack) currentTrack.next = track;
    currentTrack = track;
    player.classList.remove('hidden')
    updateCurrentlyPlaying(track, topBarSpan, currentlyPlaying);

    audio.pause();
    audioInputRange.value = 0;
    audio.currentTime = 0;
    audio.src = track.preview;
    audio.play()
    audioSource = audioCtx.createMediaElementSource(audio);
    audioSource.connect(analyser);

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    audio.addEventListener('loadedmetadata', (e) => {
        const duration = parseInt(audio.duration);
        audioDurationSpan.textContent = `${0}:${duration}`;
        updateTrackInterval && clearInterval(updateTrackInterval);
        updateTrackInterval = setInterval(() => {
            audioInputRange.value = audio.currentTime / duration;
            audioCurrentPlaytimeSpan.textContent = `00:${audio.currentTime < 10 ? "0" : ""}${parseInt(audio.currentTime)}`
        }, 1000);
    })

    audio.addEventListener('ended', () => {
        playTrack(track.next)
    })
}

audioInputRange.addEventListener('change', () => {
    if(audio){
        audio.currentTime = audioInputRange.value * audio.duration;
        audio.play()
    }
})

function playPause(){
    if(!audio.src) return;
    if(inputSearchFocused) return;
    if(audio.paused){
        audio.play();
        currentlyPlaying.classList.add('active')
        player.classList.remove("hidden")
    }else{
        audio.pause();
        currentlyPlaying.classList.remove('active')
        player.classList.add("hidden")
    }
}

window.addEventListener('keydown', (e) => {
    if(e.code == "Space") playPause();
    else if(e.code == "Escape") menu.classList.toggle("active");
})

function animate() {
    if(audio && !audio.paused){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualizer({
            bufferLength,
            dataArray
        });
    }
    requestAnimationFrame(animate);
}

const drawVisualizer = ({
    bufferLength,
    dataArray
}) => {
    let barHeight;
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        barWidth = innerWidth / bufferLength / 2;
        ctx.fillStyle = `rgb(${barHeight/256}, ${barHeight/256}, ${barHeight/256})`;

        barHeight = (barHeight / 256) * innerHeight / 4;

        ctx.fillRect(innerWidth/2 + x, innerHeight/2 - barHeight, barWidth, 2 * barHeight);
        ctx.fillRect(innerWidth/2 - x, innerHeight/2 - barHeight, barWidth, 2 * barHeight);
        x += barWidth;
    }
};

animate()
