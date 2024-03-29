import React from "react";
import TextInput from "./text_box";
import ProgressBar from "./ProgressBar";
import ColorChangeButton from "./ButtonChange";
import buttonTypes from "./buttons.module.css";

const ProbsDisplay = ({
  negative_prenorm,
  positive_prenorm,
  negative_postnorm,
  positive_postnorm,
}) => {
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
            <p className="reduced-margin">{`Before: ${percentConvert(value)}%`}</p>
            <p className="reduced-margin">{`After: ${percentConvert(postdict[key])}%`}</p>
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
      <h2> Similarity Ratings</h2>
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
      <h3>Neural Network Captions</h3>
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
