import { AudioListener, Audio, AudioLoader, AudioAnalyser, Clock } from 'three';
import { Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color, MeshBasicMaterial, MeshStandardMaterial, Mesh } from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.146/examples/jsm/controls/OrbitControls.js';
import { createSculptureWithGeometry } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';

alert("Click the blank window 1 time to init the AudioContext.")


let first_click = true;
document.addEventListener("click",function(){
    if (first_click == true)
    {
        first_click = false;
        // creating audio context
        let ACTX = new AudioContext();
        let ANALYSER = ACTX.createAnalyser();
        ANALYSER.fftSize = 4* 512;
        ANALYSER.smoothingTimeConstant = 0.5;

        let DATA = new Uint8Array(512);


        // adding source
        let SOURCE;
        navigator.mediaDevices.getUserMedia({audio : {echoCancellation:false, 
                        noiseSuppression:false,
                        sampleRate:44100} }
        ).then(process_audio);

        // processing audio
        function process_audio(stream){
            SOURCE = ACTX.createMediaStreamSource(stream);
            SOURCE.connect(ANALYSER);
        }



        let scene = new Scene();

        let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 1.5;

        let container = document.getElementById("mesh_container");
        console.log(container);

        let renderer = new WebGLRenderer({ antialias: true, transparent: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new Color(1, 1, 1), 0);
        container.appendChild(renderer.domElement);


        let clock = new Clock();

        // AUDIO
        // create an AudioListener and add it to the camera
        const listener = new AudioListener();
        camera.add(listener);

        // create an Audio source
        const sound = new Audio(listener);

        let button = document.querySelector('.button');
        button.innerHTML = "Loading Audio..."

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new AudioLoader();
        audioLoader.load('https://cdn.glitch.global/59b80ec2-4e5b-4b54-b910-f3441cac0fd6/OP1Beat.wav?v=1667175863547', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            button.innerHTML = "Play Audio"
            button.addEventListener('pointerdown', () => {
                speak("My name is Jarvis");
                let rand = Math.floor(Math.random() * 255);
                // DATA[0] = rand;
                // sound.play();
                console.log(DATA[0]);
                // button.style.display = 'none';
            }, false);
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
        // Add Controlls
        // let controls = new OrbitControls(camera, renderer.domElement, {
        //     enableDamping: false,
        //     dampingFactor: 0,
        //     zoomSpeed: 0,
        //     rotateSpeed: 0
        // });

        let onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize);

        let render = () => {
            requestAnimationFrame(render);
            state.time += clock.getDelta();
            // controls.update();
            if (true) {
                // ANALYSER.getByteFrequencyData(DATA);
                // console.log(DATA[8]);
                state.currAudio += Math.pow((DATA[0] / 255) * .75, 7) + clock.getDelta() * .1;
                state.audio = .2 * state.currAudio + .8 * state.audio;
            }
            // state.pointerDown = .1 * state.currPointerDown + .9 * state.pointerDown;
            // state.mouse.lerp(state.currMouse, .05);
            renderer.render(scene, camera);
        };

        render();


        function getVoices() {
            let voices = speechSynthesis.getVoices();
            if (!voices.length) {
                // some time the voice will not be initialized so we can call spaek with empty string
                // this will initialize the voices 
                let utterance = new SpeechSynthesisUtterance("");
                speechSynthesis.speak(utterance);
                voices = speechSynthesis.getVoices();
            }
            return voices;
        }
        let voices = getVoices();

        function speak(text, visualizer) {
            // create a SpeechSynthesisUtterance to configure the how text to be spoken 
            let speakData = new SpeechSynthesisUtterance();
            speakData.volume = 0.5; // From 0 to 1
            speakData.rate = 0.8; // From 0.1 to 10
            speakData.pitch = 0; // From 0 to 2
            speakData.text = text;
            speakData.lang = 'en';
            speakData.voice = voices[0];

            // attach event handlers to update the visualizer
            speakData.onstart = function () {

                let interval = setInterval(function() {
                    if (speechSynthesis.speaking) {
                        // assign a random value between 180 and 255 to DATA[0]
                        DATA[0] = Math.floor(Math.random() * (255 - 190 + 1) + 190);
                    } else {
                        DATA[0] = 0
                        clearInterval(interval); // stop the interval when TTS is done speaking
                    }
                }, 10);
            };

            speakData.onpause = function () {

            };

            speakData.onresume = function () {

            };

            speakData.onend = function () {
                DATA[0] = 0
            };

            // pass the SpeechSynthesisUtterance to speechSynthesis.speak to start speaking 
            speechSynthesis.speak(speakData);
        }


        if ('speechSynthesis' in window) {


            let rate = 1, pitch = 2, volume = 1;
            let text = "";

            speak(text);

            // setTimeout(() => { // speak after 2 seconds 
            //     rate = 0.5; pitch = 1.5, volume = 0.5;
            //     text = "Spaecking with volume = 0.5 rate = 0.5 pitch = 1.5 ";
            //     speak(text);
            // }, 2000);
        } else {
            console.log(' Speech Synthesis Not Supported 😞');
        }
    }
}
);


export function spCode(a) {
    if (a<180)
    {return `
        let audio = input();
        let pointerDown = input();
        
        
        setMaxIterations(5);
        let s = getSpace();
        let r = getRayDirection();
        
        let n1 = noise(r * 4 +vec3(0, audio, vec3(0, audio, audio))*.5 );
        let n = noise(s + vec3(0, 0, audio+time*.1) + n1);
        
        metal(n*.5+.5);
        shine(n*.5+.5);
        
        color(normal * .1 + vec3(0, 0, 1));
        displace(mouse.x * 2, mouse.y * 2, 0);
        boxFrame(vec3(2), abs(n) * .1 + .04 );
        mixGeo(pointerDown);
        sphere(n * .5 + .8);
    `;
    }
    else if(a>180)
    {
        console.log("red");
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
        
        color(normal * .1 + vec3(1, 0, 0));
        displace(mouse.x * 2, mouse.y * 2, 0);
        boxFrame(vec3(2), abs(n) * .1 + .04 );
        mixGeo(pointerDown);
        sphere(n * .5 + .8);
    `;
    }
    }

