import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamOverlay = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [overlayText, setOverlayText] = useState({
        foodName: '',
        part: '',
        verifiedWeight: '0',
        isEmpty: 'No',
        timestamp: '0',
    });

    const [foodNames, setFoodNames] = useState([]);
    const [part, setPart] = useState([]);
    const [isEmpty, setIsEmpty] = useState('No');
    const [selectedFood, setSelectedFood] = useState('');
    const [selectedPart, setSelectedPart] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const spreadsheetId = '1qV6VTWDRTx0Znk-a9VTg7bZP78ANcNap8mMd_QP3jxc';
                const range = 'Sheet1!A1:B100'; // Adjust range based on your data
                const apiKey = 'AIzaSyDiyid8OuSDIAiM_DeTu0eri_zwmNPP6SA';

                const response = await axios.get(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
                );

                const data = response.data.values;
                setFoodNames(() => data.map(row => row[0])); // Assuming data is in the first column
                setPart(() => data.map(row => row[1]));

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    const videoConstraints = {
        facingMode: { exact: "environment" },
        // width: 720,
        // height: 1280
    };

    const capture = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = webcamRef.current.video;

        ctx.drawImage(video, 0, 0, 720, 1280); //, canvas.width, canvas.height

        ctx.fillStyle = 'white';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;

        const textLines = [
            `foodName: ${overlayText.foodName}`,
            `Part: ${overlayText.part}`,
            `Verified Weight: ${overlayText.verifiedWeight} kg`,
            `is Empty : ${overlayText.isEmpty}`,
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
        formData.append('foodName', overlayText.foodName || "");
        formData.append('verifiedWeight', overlayText.verifiedWeight || "0");
        formData.append('isEmpty', overlayText.isEmpty);
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
            foodName: formData.get('foodName') || '',
            part: formData.get('part') || '',
            verifiedWeight: formData.get('verifiedWeight'),
            isEmpty: formData.get('isEmpty') ? 'Yes' : 'No',
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
                forceScreenshotSourceSize={true}
                screenshotQuality={1}
            />
            <canvas ref={canvasRef} width={720} height={1280} style={styles.canvas} />
            <div style={styles.overlay}>
                <h1 style={styles.overlayText}>{`FoodName: ${overlayText.foodName}`}</h1>
                <h1 style={styles.overlayText}>{`Part: ${overlayText.part}`}</h1>
                <h1 style={styles.overlayText}>{`Verified weight: ${overlayText.verifiedWeight} kg`}</h1>
                <h1 style={styles.overlayText}>{`Is Empty: ${overlayText.isEmpty}`}</h1>
                <h1 style={styles.overlayText}>{`Timestamp: ${overlayText.timestamp}`}</h1>
            </div>
            <button onClick={capture} style={styles.captureButton}>Capture & Save</button>

            <form onSubmit={handleSubmit} style={styles.form}>

                <div style={styles.formGroup}>
                    <input type="checkbox" id="isEmpty" name="isEmpty" value={isEmpty} onChange={(e) => setIsEmpty(e.target.checked ? 'Yes' : 'No')} />
                    <label for="isEmpty" style={styles.chekBoxLabel}> Is Empty</label>
                    <h1>Food name</h1>
                    <select style={styles.input}
                        value={selectedFood}
                        onChange={e => setSelectedFood(e.target.value)}
                        name='foodName'
                    >
                        <option value="" disabled>
                            Select an FoodName
                        </option>
                        {foodNames.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <h1>Part</h1>
                    <select name="part" style={styles.input}
                        value={selectedPart}
                        onChange={e => setSelectedPart(e.target.value)}>
                        <option value="" disabled>
                            Part
                        </option>
                        {part.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <h1>Verified Weight</h1>
                    <input type="number" name="verifiedWeight" required style={styles.input} defaultValue={0} step={0.001} />
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
        width: '100%',
        height: '100%',
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

    chekBoxLabel: {
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        left: '50%'
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
        // left: '50%',
        // transform: 'translateX(-50%)',
        // padding: '10px 20px',
        fontSize: '30px',
        backgroundColor: '#ff0100',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '400px',
        height: '100px'
    },
    capturedImageContainer: {
        // position: 'absolute',
        top: 20,
        right: 20,
        border: '2px solid #ff0000',
    },
    capturedImage: {
        // width: 'auto%',
        // height: '100%',
        width: '720px',
        height: '1280px',

    },
    form: {
        // position: 'absolute',
        bottom: 20,
        // left: '50%',
        // transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'left',
    },
    formGroup: {
        marginBottom: '10px',
    },
    input: {
        // marginLeft: '10px',
        padding: '5px',
        fontSize: '30px',
        width: '80%'
    },
    submitButton: {
        top: 20,
        position: 'relative',
        fontSize: '30px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '400px',
        height: '100px',
        marginBottom: 20
    },
};

export default WebcamOverlay;
