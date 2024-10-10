const videoElement: HTMLVideoElement | null = document.getElementById('videoElement') as HTMLVideoElement;
const captureButton = document.getElementById('captureButton') as HTMLButtonElement;
const canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
const capturedImage = document.getElementById('capturedImage') as HTMLImageElement;
const grayscaleButton: HTMLButtonElement = document.getElementById('grayscaleBtn') as HTMLButtonElement;
const filteredImage = document.getElementById('filteredImage') as HTMLImageElement;

let stream: MediaStream | null = null;
let context: CanvasRenderingContext2D | null = null;

async function getVideoStream(): Promise<void> {
    if (!videoElement) return;
    try{
        const constraints: MediaStreamConstraints = { video: true, audio: false };
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
}

function captureImage(): void {
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
})

window.addEventListener('DOMContentLoaded', () => {
    getVideoStream().catch(err => console.error(err));
});

captureButton.addEventListener('click', captureImage);