import { AudioListener, Audio, AudioLoader, AudioAnalyser, Clock } from 'three';
import { Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color, MeshBasicMaterial, MeshStandardMaterial, Mesh } from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.146/examples/jsm/controls/OrbitControls.js';
import { createSculptureWithGeometry } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';

window.onresize = function () { location.reload(); }

let DATA = new Uint8Array(512);


let scene = new Scene();

let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

let container = document.getElementById("mesh_container");
console.log(container);

let renderer = new WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize(window.innerWidth / 1.2, window.innerHeight / 1.2);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(new Color(0, 0, 0), 0);
container.appendChild(renderer.domElement);


let clock = new Clock();

// AUDIO
// create an AudioListener and add it to the camera
const listener = new AudioListener();
camera.add(listener);

// create an Audio source
const sound = new Audio(listener);

// let button = document.querySelector('.button');
// button.innerHTML = "Loading Audio..."

// load a sound and set it as the Audio object's buffer
const audioLoader = new AudioLoader();
audioLoader.load('https://cdn.glitch.global/59b80ec2-4e5b-4b54-b910-f3441cac0fd6/OP1Beat.wav?v=1667175863547', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    // button.innerHTML = "Play Audio"
    // button.addEventListener('pointerdown', () => {
    //     speak("My name is Jarvis");
    //     let rand = Math.floor(Math.random() * 255);
    //     DATA[0] = rand;
    //     // sound.play();
    //     console.log(DATA[0]);
    //     // button.style.display = 'none';
    // }, false);
});


// create an AudioAnalyser, passing in the sound and desired fftSize
// get the average frequency of the sound



const analyser = new AudioAnalyser(sound, 32);


let state = {
    mouse: new Vector3(),
    currMouse: new Vector3(),
    pointerDown: 0.0,
    currPointerDown: 0.0,
    audio: 0.0,
    currAudio: 0.0,
    time: 0.0
}

window.addEventListener('pointermove', (event) => {
    state.currMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.currMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}, false);

window.addEventListener('pointerdown', (event) => state.currPointerDown = 1.0, false);
window.addEventListener('pointerup', (event) => state.currPointerDown = 0.0, false);


let geometry = new SphereGeometry(2, 45, 45);




// // // Create Shader Park Sculpture
let mesh = createSculptureWithGeometry(geometry, spCode(DATA[8]), () => ({
    time: state.time,
    pointerDown: state.pointerDown,
    audio: state.audio,
    mouse: state.mouse,
    _scale: .5
}));

scene.add(mesh);

let onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

let render = () => {

    requestAnimationFrame(render);
    state.time += clock.getDelta();
    if (true) {
        state.currAudio += Math.pow((DATA[0] / 255) * .75, 7) + clock.getDelta() * .1;
        state.audio = .2 * state.currAudio + .8 * state.audio;
    }
    renderer.render(scene, camera);
};

const socket = io("http://127.0.0.1:5000/");
socket.connect(); // connect to the socket

socket.on('connect', function () {
    console.log("connection found")
    socket.emit('my event', {
        data: 'User Connected'
    });
});

socket.on('error', function (error) {
    console.log('Received error:', error);
});

socket.on('my response', function (msg) {
    console.log("my response: ", msg)
})

socket.on('message', function (message) {
    console.log('Received message:', message);
    speak(message);
});


render();

// function showTime() {
//     var date = new Date();
//     var h = date.getHours(); // 0 - 23
//     var m = date.getMinutes(); // 0 - 59
//     var s = date.getSeconds(); // 0 - 59
//     var session = "AM";

//     if (h == 0) {
//         h = 12;
//     }

//     if (h > 12) {
//         h = h - 12;
//         session = "PM";
//     }

//     h = (h < 10) ? "0" + h : h;
//     m = (m < 10) ? "0" + m : m;
//     s = (s < 10) ? "0" + s : s;

//     var time = h + ":" + m + ":" + s + " " + session;
//     document.getElementById("MyClockDisplay").innerText = time;
//     document.getElementById("MyClockDisplay").textContent = time;

//     setTimeout(showTime, 1000);

// }

// showTime();



// function getVoice() {
//     let voices = speechSynthesis.getVoices();
//     console.log(voices);
//     if (voices.length == 0) {
//         let utterance = new SpeechSynthesisUtterance("Hi");
//         speechSynthesis.speak(utterance);
//         voices = speechSynthesis.getVoices();
//         console.log(voices);
//     }
//     console.log(voices);
//     return voices;
// }
// let voice = getVoice();

function speak(text, visualizer) {

    let speakData = new SpeechSynthesisUtterance();
    speakData.volume = 1; // From 0 to 1
    speakData.rate = 0.8; // From 0.1 to 10
    speakData.pitch = 0; // From 0 to 2
    speakData.text = text;
    speakData.lang = 'en-uk';
    let voices = speechSynthesis.getVoices();
    speakData.voice = voices[0];

    // attach event handlers to update the visualizer
    speakData.onstart = function () {

        let interval = setInterval(function () {
            if (speechSynthesis.speaking) {
                DATA[0] = Math.floor(Math.random() * (210 - 160 + 1) + 160);
                container.style.filter = "hue-rotate(90deg)";
            } else {
                DATA[0] = 0
                container.style.filter = "hue-rotate(0deg)";
                render()
                clearInterval(interval); // stop the interval when TTS is done speaking
            }
        }, 50);
    };

    speakData.onpause = function () {

    };

    speakData.onresume = function () {

    };

    speakData.onend = function () {
        DATA[0] = 0
    };

    speechSynthesis.speak(speakData);

}
export function spCode(a) {

    return `
        let audio = input();
        let pointerDown = input();
        
        
        setMaxIterations(5);
        let s = getSpace();
        let r = getRayDirection();
        
        let n1 = noise(r * 4 +vec3(0, audio, vec3(0, audio, audio))*.5 );
        let n = noise(s + vec3(0, 0, audio+time*.1) + n1);
        
        metal(n*.5+.5);
        shine(n*.5+.5);
        
        color(normal * .1 + vec3(0.1, 0.1, 1));
        boxFrame(vec3(2), abs(n) * .1 + .04 );
        mixGeo(0);
        sphere(n * .5 + .8);
    `;

}

window.onload = function () {
    console.log("Starting Up..")
}


let circular_container = document.getElementById("circ_cont");
let circular_container_clicked = false;
container.addEventListener('pointerdown', () => 
{
    if (circular_container_clicked == false) {
        console.log("CLICKED");
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0) {
                clearInterval(timer);
                circular_container.style.display = "none";
            }
            circular_container.style.opacity = opacity;
            opacity -= 0.15;
        }, 50);
        circular_container_clicked = true;
    } else {
        let opacity = 0;
        circular_container.style.display = "block";
        let timer = setInterval(() => {
            if (opacity >= 1) {
                clearInterval(timer);
            }
            circular_container.style.opacity = opacity;
            opacity += 0.15;
        }, 50);
        circular_container_clicked = false;
    }
    
})