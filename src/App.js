import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import './App.css'; // Import CSS file with styles for overlay
import { useCallback, useState } from 'react'
import React from 'react';
import Webcam from 'react-webcam';
import WebcamOverlay from './Webcam';
const surveyJson = {
  elements: [{
    name: "Item",
    title: "Enter Item name:",
    type: "text"
  }, {
    name: "Verified weight in kg",
    title: "Enter Verified weight in kg:",
    type: "text"
  }, {
    name: "Empty weight",
    title: "Enter Empty weight:",
    type: "text"
  }, {
    name: "Actual weight",
    title: "Enter Actual weight:",
    type: "text"
  }
  ]
  //				Quantity as per PO	Amount as per PO	Verified weight in kg	verification Link 	Empty weight	Empty vessel pic link	Actual weight	Number of plates	Amount as per actual	Amount to be paid	Vendor name	comment
};


function App() {
  const [photoInfo, setPhotoInfo] = useState("--");
  //survey
  const survey = new Model(surveyJson);
  const alertResults = useCallback((sender) => {
    const results = JSON.stringify(sender.data);
    alert(results);
    setPhotoInfo(() => results.toString());
  }, []);
  survey.onComplete.add(alertResults);

  return (<div style={{ width: '740px', height: 'auto' }}>
    <Survey model={survey} />
    <WebcamOverlay photoInfo={photoInfo} />
  </div >)

}
export default WebcamOverlay; 