"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const videoElement = document.getElementById('videoElement');
const captureButton = document.getElementById('captureButton');
const canvasElement = document.getElementById('canvasElement');
const capturedImage = document.getElementById('capturedImage');
const grayscaleButton = document.getElementById('grayscaleBtn');
const filteredImage = document.getElementById('filteredImage');
let stream = null;
let context = null;
function getVideoStream() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!videoElement)
            return;
        try {
            const constraints = { video: true, audio: false };
            const stream = yield navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
        }
        catch (error) {
            console.error('Error accessing media devices:', error);
        }
    });
}
function captureImage() {
    if (!videoElement) {
        console.error('Video element not found');
        return;
    }
    context = canvasElement.getContext('2d');
    if (context) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        const dataUrl = canvasElement.toDataURL('image/png');
        capturedImage.src = dataUrl;
    }
}
grayscaleButton.addEventListener('click', () => {
    if (!context) {
        console.error('No image to filter');
        return;
    }
    const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
    context.putImageData(imageData, 0, 0);
    const dataUrl = canvasElement.toDataURL('image/png');
    filteredImage.src = dataUrl;
});
window.addEventListener('DOMContentLoaded', () => {
    getVideoStream().catch(err => console.error(err));
});
captureButton.addEventListener('click', captureImage);

class CarSwitcher {
    constructor(imageElementId) {
        this.imageElement = document.getElementById(imageElementId);
        this.currentIndex = 0;
        this.carImages = ['src/cle.png', 'src/competition.png', 'src/m4.png'];
    }

    nextCar() {
        this.currentIndex = (this.currentIndex + 1) % this.carImages.length;
        this.updateCarImage();
    }

    previousCar() {
        this.currentIndex = (this.currentIndex - 1 + this.carImages.length) % this.carImages.length;
        this.updateCarImage();
    }

    updateCarImage() {
        this.imageElement.src = this.carImages[this.currentIndex];
    }
}
