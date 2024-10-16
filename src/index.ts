// Variablen für Handtracking und Timer
import * as handTrack from 'handtrackjs';
let model: any = null;
let video = document.getElementById("video") as HTMLVideoElement;
let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let context = canvas.getContext("2d");
let isVideo = false;
const updateNote = document.getElementById("updatenote") as HTMLDivElement;
const videoConstraints = {
    video: {
        width: 640,
        height: 480,
        facingMode: "user"
    }
};

let timer: ReturnType<typeof setTimeout> | null = null;
let timeoutDuration = 3000;  // 3 Sekunden
let isZooming = false;  // Um festzustellen, ob die Zoom-Aktion bereits ausgeführt wird

// Funktion für Zoom-In Aktion
const zoomIn = () => {
    if (!isZooming) {
        isZooming = true;
        console.log("Zooming in...");
        // Hier den Zoom-In-Code ausführen, z.B. die Größe des Autos erhöhen
        const carImage = document.getElementById("carImage") as HTMLImageElement;
        let currentScale = parseFloat(carImage.style.transform.replace('scale(', '').replace(')', '')) || 1;
        currentScale += 0.1;  // Vergrößere den Skalierungsfaktor um 10%
        carImage.style.transform = `scale(${currentScale})`;
        
        setTimeout(() => {
            isZooming = false;  // Verhindern, dass die Aktion sofort wieder ausgelöst wird
        }, 1000);  // Warte 1 Sekunde, bevor eine erneute Zoom-Aktion möglich ist
    }
};


// HandTrack.js Model laden
handTrack.load().then((lmodel: any) => {
    model = lmodel;
    updateNote.innerText = "Model Loaded!";
    // Starte das Video erst, wenn das Model vollständig geladen ist
    startVideo();
}).catch((error: any) => {
    console.error("Error loading HandTrack model: ", error);
    updateNote.innerText = "Error loading model. Please try again.";
});


// Handtracking und Gestenerkennung
const runDetection = () => {
    model.detect(video).then((predictions: any) => {
        context?.clearRect(0, 0, canvas.width, canvas.height);

        // Spiegeln des Canvas
        context?.save();
        context?.scale(-1, 1);
        context?.translate(-canvas.width, 0);
        model.renderPredictions(predictions, canvas, context, video);
        context?.restore();

        // Überprüfen, ob sich die Hand in der oberen rechten Ecke befindet
        predictions.forEach((prediction: any) => {
            const [x, y, width, height] = prediction.bbox;

            // Überprüfen, ob die Hand in der oberen rechten Ecke ist
            if (x + width > canvas.width * 0.75 && y < canvas.height * 0.25) {
                if (!timer) {
                    timer = setTimeout(() => {
                        zoomIn();  // Zoom-In Aktion nach 3 Sekunden ausführen
                        clearTimeout(timer!);
                        timer = null;
                    }, timeoutDuration);
                }
            } else {
                // Timer zurücksetzen, wenn die Hand die Ecke verlässt
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
            }
        });

        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
};

// Video-Stream starten
const startVideo = () => {
    // Check if the browser supports the media devices API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(videoConstraints)
        .then((stream) => {
            video.srcObject = stream;  // Set the video stream source
            video.play();
            updateNote.innerText = "Video started. Now tracking...";
            isVideo = true;
            runDetection();  // Starte die Handerkennung
        })
        .catch((error) => {
            console.error("Error accessing camera: ", error);
            updateNote.innerText = "Error accessing camera. Please check permissions.";
        });
    } else {
        updateNote.innerText = "getUserMedia not supported on your browser.";
    }
};


// Video-Stream stoppen
const stopVideo = () => {
    handTrack.stopVideo(video);
    isVideo = false;
    updateNote.innerText = "Video stopped.";
};

// Event für Video Start/Stop
document.getElementById("toggleButton")!.addEventListener("click", () => {
    if (!isVideo) {
        startVideo();
    } else {
        stopVideo();
    }
});
