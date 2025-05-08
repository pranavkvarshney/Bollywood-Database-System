'use client';
import { useRef, useEffect, useState } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                onClose();
            }
        };

        startCamera();


        return () => {
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    stream.removeTrack(track);
                });
                setStream(null);
            }
        };
    }, []);

    const takePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            const photoUrl = canvas.toDataURL('image/jpeg');


            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    stream.removeTrack(track);
                });
                setStream(null);
            }

            onCapture(photoUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-lg w-full">
                <div className="relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                    />
                </div>
                <div className="flex justify-center mt-4 gap-2">
                    <button
                        onClick={takePhoto}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                        Take Photo
                    </button>
                    <button
                        onClick={() => {

                            if (stream) {
                                const tracks = stream.getTracks();
                                tracks.forEach(track => {
                                    track.stop();
                                    stream.removeTrack(track);
                                });
                                setStream(null);
                            }
                            onClose();
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraCapture; 