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

// Variables for audio
var audioSource = null;
var analyser = null;
var x = 0;
let audio = new Audio();
let data; //Tracks
let currentTrack, oldTrack;
var audioDuration;
var updateTrackInterval;
audio.crossOrigin = "anonymous";

form.addEventListener('submit', onFormSubmit);

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
    currentTrack = track;
    player.classList.remove('hidden')
    updateCurrentlyPlaying(track, topBarSpan, currentlyPlaying);

    audio.pause();
    audioInputRange.value = 0;
    audio.currentTime = 0;
    audio.src = track.preview;
    audio.play()
    
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

// const canvas = document.querySelector('canvas')
// const ctx = canvas.getContext('2d');
// const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// audio.src = "playing_god.mp3";
// audio.crossOrigin = "anonymous";
// audio.src = "https://cdns-preview-6.dzcdn.net/stream/c-6978750774c28c04dab4b2ec88fe3d40-3.mp3";
// audio.play()
// audioSource = audioCtx.createMediaElementSource(audio);
// analyser = audioCtx.createAnalyser();
// audioSource.connect(analyser);
// analyser.connect(audioCtx.destination);
// analyser.fftSize = 512;
// const bufferLength = analyser.frequencyBinCount;
// const dataArray = new Uint8Array(bufferLength);
// const barWidth = canvas.width / bufferLength;


// function animate() {
//     x = 0;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     analyser.getByteFrequencyData(dataArray);
//     drawVisualizer({
//         bufferLength,
//         dataArray,
//         barWidth
//     });
//     requestAnimationFrame(animate);
// }

// const drawVisualizer = ({
//     bufferLength,
//     dataArray,
//     barWidth
// }) => {
//     let barHeight;
//     for (let i = 0; i < bufferLength; i++) {
//         barHeight = dataArray[i];
//         const red = (i * barHeight) / 10;
//         const green = i * 4;
//         const blue = barHeight / 4 - 12;
//         ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
//         ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
//         x += barWidth;
//     }
// };

// animate()
