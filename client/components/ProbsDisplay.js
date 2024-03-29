import React from "react";
import TextInput from "./text_box";
import ProgressBar from "./ProgressBar";
import ColorChangeButton from "./ButtonChange";
import buttonTypes from "./buttons.module.css";

const ProbsDisplay = ({
  image,
  imageName,
  negative_prenorm,
  positive_prenorm,
  negative_postnorm,
  positive_postnorm,
}) => {
  const downloadImage = () => {
    // Convert Base64 string to a Blob
    const byteCharacters = atob(image.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    // Create a URL for the Blob and trigger the download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "protected " + imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl); // Clean up the blob URL
  };

  const percentConvert = (value) => {
    if (value >= 0.3) {
      var value = ((value - 0.3) * 1) / 21 + 0.3;
    } else if (value <= -0.3) {
      var value = ((value + 0.3) * 1) / 21 - 0.3;
    }
    return Math.ceil(value * 300 * 1000) / 1000;
  };
  const renderDictionary = (dictionary, postdict, dictName) => (
    <div>
      <ul>
        {Object.entries(dictionary).map(([key, value]) => (
          <div
            key={key}
            style={{
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
            }}
          >
            <style>
              {`
                    .reduced-margin {
                      margin-top: 5px; /* Adjust top margin as needed */
                      margin-bottom: 5px; /* Adjust bottom margin as needed */
                    }
                  `}
            </style>
            <h4 className="reduced-margin"> {key}: </h4>
            <p className="reduced-margin">{`Before: ${percentConvert(value)}% similarity`}</p>
            <p className="reduced-margin">{`After: ${percentConvert(postdict[key])}% similarity`}</p>
          </div>
        ))}
      </ul>
    </div>
  );
  return (
    <div
      style={{
        flexDirection: "column",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2> Protected Image </h2>
      <img src={image} style={{ margin: "30px" }} alt="Condition Met" />
      <button className={buttonTypes.downloadButton} onClick={downloadImage}>
        Download Protected Image
      </button>
      <h3>Current Captions</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {renderDictionary(negative_prenorm, negative_postnorm, "Art Caption")}
      </div>
      <h3>Deceptive Captions</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderDictionary(
          positive_prenorm,
          positive_postnorm,
          "Target Classification",
        )}
      </div>
    </div>
  );
};

export default ProbsDisplay;
