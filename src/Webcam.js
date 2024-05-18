import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamOverlay = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [overlayText, setOverlayText] = useState({
        item: '',
        verifiedWeight: '0',
        emptyWeight: '0',
        actualWeight: '0',
        timestamp: '0',
    });

    const videoConstraints = {
        facingMode: { exact: "environment" },
        width: 720,
        height: 1280
    };

    const capture = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = webcamRef.current.video;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;

        const textLines = [
            `Item: ${overlayText.item}`,
            `Verified weight: ${overlayText.verifiedWeight} kg`,
            `Empty weight: ${overlayText.emptyWeight} kg`,
            `Actual weight: ${overlayText.actualWeight} kg`,
            `Timestamp: ${overlayText.timestamp}`,
        ];

        textLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, canvas.height / 2 + index * 30);
        });

        const imageSrc = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageSrc);

        const file = dataURLtoFile(imageSrc, 'capturedImage.jpg');
        uploadImage(file);
    };

    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };



    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('item', overlayText.item || "");
        formData.append('verifiedWeight', overlayText.verifiedWeight || "0");
        formData.append('emptyWeight', overlayText.emptyWeight || "0");
        formData.append('actualWeight', overlayText.actualWeight || "0");
        formData.append('timestamp', new Date().toLocaleString());

        try {
            const response = await axios.post(process.env.REACT_APP_BE_SERVER, formData, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Image uploaded and data saved successfully.');
        } catch (error) {
            console.error(error);
            alert('Failed to upload image and save data.');
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const newOverlayText = {
            item: formData.get('item'),
            verifiedWeight: formData.get('verifiedWeight'),
            emptyWeight: formData.get('emptyWeight'),
            actualWeight: formData.get('actualWeight'),
            timestamp: new Date().toLocaleString(),
        };
        setOverlayText(newOverlayText);
    };

    return (
        <div style={styles.container}>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={720}
                height={1280}
                videoConstraints={videoConstraints}
                style={styles.webcam}
            // forceScreenshotSourceSize={true}
            />
            <canvas ref={canvasRef} width={720} height={1280} style={styles.canvas} />
            <div style={styles.overlay}>
                <h1 style={styles.overlayText}>{`Item: ${overlayText.item}`}</h1>
                <h1 style={styles.overlayText}>{`Verified weight: ${overlayText.verifiedWeight} kg`}</h1>
                <h1 style={styles.overlayText}>{`Empty weight: ${overlayText.emptyWeight} kg`}</h1>
                <h1 style={styles.overlayText}>{`Actual weight: ${overlayText.actualWeight} kg`}</h1>
                <h1 style={styles.overlayText}>{`Timestamp: ${overlayText.timestamp}`}</h1>
            </div>
            <button onClick={capture} style={styles.captureButton}>Capture & Save</button>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label>
                        Item name:
                        <input type="text" name="item" required style={styles.input} />
                    </label>
                </div>
                <div style={styles.formGroup}>
                    <label>
                        Verified weight:
                        <input type="number" name="verifiedWeight" required style={styles.input} defaultValue={0} />
                    </label>
                </div>
                <div style={styles.formGroup}>
                    <label>
                        Empty weight:
                        <input type="number" name="emptyWeight" required style={styles.input} defaultValue={0} />
                    </label>
                </div>
                <div style={styles.formGroup}>
                    <label>
                        Actual weight:
                        <input type="number" name="actualWeight" required style={styles.input} defaultValue={0} />
                    </label>
                </div>
                <button type="submit" style={styles.submitButton}>Update Text</button>
            </form>

            {capturedImage && (
                <div style={styles.capturedImageContainer}>
                    <img src={capturedImage} alt="Captured" style={styles.capturedImage} />
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'relative',
        width: '720px',
        height: '1280px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    webcam: {
        // position: 'absolute',
        margin: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    canvas: {
        display: 'none',
    },
    overlay: {
        position: 'absolute',
        top: 200,
        left: 100,
        // width: '100%',
        // height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    overlayText: {
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        margin: 0,
    },
    captureButton: {
        // position: 'absolute',
        margin: 20,
        left: '50%',
        // transform: 'translateX(-50%)',
        padding: '10px 20px',
        fontSize: '30px',
        backgroundColor: '#ff0100',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '80%',
        height: '10%'
    },
    capturedImageContainer: {
        // position: 'absolute',
        top: 20,
        right: 20,
        border: '2px solid #fff',
    },
    capturedImage: {
        width: 'auto%',
        height: '100%',
    },
    form: {
        // position: 'absolute',
        bottom: 80,
        left: '50%',
        // transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formGroup: {
        marginBottom: '10px',
    },
    input: {
        marginLeft: '10px',
        padding: '5px',
        fontSize: '16px',
        width: '300px'
    },
    submitButton: {
        padding: '10px 20px',
        fontSize: '30px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '80%',
        height: '10%'
    },
};

export default WebcamOverlay;
