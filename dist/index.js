"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Variablen für Handtracking und Timer
const handTrack = __importStar(require("handtrackjs"));
let model = null;
let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let isVideo = false;
const updateNote = document.getElementById("updatenote");
const videoConstraints = {
    video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
    }
};
let timer = null;
let timeoutDuration = 3000; // 3 Sekunden
let isZooming = false; // Um festzustellen, ob die Zoom-Aktion bereits ausgeführt wird
// Funktion für Zoom-In Aktion
const zoomIn = () => {
    if (!isZooming) {
        isZooming = true;
        console.log("Zooming in...");
        // Hier den Zoom-In-Code ausführen, z.B. die Größe des Autos erhöhen
        const carImage = document.getElementById("carImage");
        let currentScale = parseFloat(carImage.style.transform.replace('scale(', '').replace(')', '')) || 1;
        currentScale += 0.1; // Vergrößere den Skalierungsfaktor um 10%
        carImage.style.transform = `scale(${currentScale})`;
        setTimeout(() => {
            isZooming = false; // Verhindern, dass die Aktion sofort wieder ausgelöst wird
        }, 1000); // Warte 1 Sekunde, bevor eine erneute Zoom-Aktion möglich ist
    }
};
// HandTrack.js Model laden
handTrack.load().then((lmodel) => {
    model = lmodel;
    updateNote.innerText = "Model Loaded!";
});
// Handtracking und Gestenerkennung
const runDetection = () => {
    model.detect(video).then((predictions) => {
        context === null || context === void 0 ? void 0 : context.clearRect(0, 0, canvas.width, canvas.height);
        // Spiegeln des Canvas
        context === null || context === void 0 ? void 0 : context.save();
        context === null || context === void 0 ? void 0 : context.scale(-1, 1);
        context === null || context === void 0 ? void 0 : context.translate(-canvas.width, 0);
        model.renderPredictions(predictions, canvas, context, video);
        context === null || context === void 0 ? void 0 : context.restore();
        // Überprüfen, ob sich die Hand in der oberen rechten Ecke befindet
        predictions.forEach((prediction) => {
            const [x, y, width, height] = prediction.bbox;
            // Überprüfen, ob die Hand in der oberen rechten Ecke ist
            if (x + width > canvas.width * 0.75 && y < canvas.height * 0.25) {
                if (!timer) {
                    timer = setTimeout(() => {
                        zoomIn(); // Zoom-In Aktion nach 3 Sekunden ausführen
                        clearTimeout(timer);
                        timer = null;
                    }, timeoutDuration);
                }
            }
            else {
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
    handTrack.startVideo(video).then((status) => {
        if (status) {
            updateNote.innerText = "Video started. Now tracking...";
            isVideo = true;
            runDetection();
        }
        else {
            updateNote.innerText = "Please enable video access in your browser.";
        }
    }).catch((error) => {
        console.error("Error accessing camera: ", error);
        updateNote.innerText = "Error accessing camera. Please check permissions.";
    });
};
// Video-Stream stoppen
const stopVideo = () => {
    handTrack.stopVideo(video);
    isVideo = false;
    updateNote.innerText = "Video stopped.";
};
// Event für Video Start/Stop
document.getElementById("toggleButton").addEventListener("click", () => {
    if (!isVideo) {
        startVideo();
    }
    else {
        stopVideo();
    }
});
