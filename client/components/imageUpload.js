import { useState, useRef } from "react";
import TextInput from "./text_box";
import ProgressBar from "./ProgressBar";
import ColorChangeButton from "./ButtonChange";
import buttonTypes from "./buttons.module.css";

const ImageUploader = ({ positiveTextValues, negativeTextValues }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [imageEncoding, setImageEncoding] = useState("");
  const [fileName, setFileName] = useState("");
  const [requestEpoch, setRequestEpoch] = useState(-1);
  const [processingRequest, setProcessingRequest] = useState(false);
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;

  const cancelRequestRef = useRef(false);
  const controller = new AbortController();
  const signal = controller.signal;
  //console.log(serverURL)

  const refreshText = (e) => {
    setDesiredClass(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDisplayImage(URL.createObjectURL(file));
      setSelectedImage(file);
      setFileName(file.name);
    }
  };

  const cancelProcessing = (e) => {
    e.preventDefault();
    setProcessingRequest(false); // track the cancelation with two seperate variables
    // ProcessingRequest determines which button to show, and the reference tells the
    // fetch requests to abort
    setRequestEpoch(-1);
    cancelRequestRef.current = true;
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const uploadImage = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Please select an image.");
      return;
    }
    let emptyText = true;
    for (let i = 0; i < positiveTextValues.length; ++i) {
      if (positiveTextValues[i] != "") {
        emptyText = false;
        break;
      }
    }
    if (emptyText) {
      alert("Please add a caption.");
      return;
    }
    setProcessingRequest(true);
    emptyText = true;
    for (let i = 0; i < negativeTextValues.length; ++i) {
      if (negativeTextValues[i] != "") {
        emptyText = false;
        break;
      }
    }
    if (emptyText) {
      alert("Please enter what you want AI to see.");
      return;
    }
    setRequestEpoch(0);
    const imageBase64 = await convertToBase64(selectedImage);

    try {
      const response = await fetch(serverURL + "/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageBase64,
          negative: negativeTextValues,
          positive: positiveTextValues,
        }),
      });
      //console.log(response, response.ok)
      if (response.ok) {
        setMessage("Success");
        const data = await response.json();
        const taskId = data.task_id;
        //console.log(taskId)

        const intervalId = setInterval(() => {
          fetch(serverURL + `/task_status/${taskId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            controller,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.iteration == -1) {
                // set request epoch to -1 to bypass this
                setDisplayImage(null);
                setDisplayImage(`data:image/jpeg;base64,${data.image}`);
                setRequestEpoch(-1);
                setProcessingRequest(false);
                clearInterval(intervalId);
              }

              if (data.message == "Request Timed Out") {
                alert("Request Timed Out");
                setRequestEpoch(-1);
                setProcessingRequest(false);
                clearInterval(intervalId);
              } else if (data.iteration != 0) {
                setRequestEpoch(data.iteration);
              }

              if (cancelRequestRef.current) {
                cancelRequestRef.current = false;

                controller.abort();
                setRequestEpoch(-1);
                const response = fetch(serverURL + `/cancel_task/${taskId}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ message: "terminate" }),
                });
                clearInterval(intervalId);
              }
              // Optionally, stop polling when the task is completed or failed
            })
            .catch((error) =>
              console.error("Error fetching task status:", error),
            );
        }, 2000);
      } else {
        alert("Image upload failed.");
        setRequestEpoch(-1);
        setProcessingRequest(false);
      }
    } catch (error) {
      console.error("Error uploading the image:", error);
      alert("Error uploading image.");
      setRequestEpoch(-1);
      setProcessingRequest(false);
    }

    return (
      <div>
        {/* Display the image based on the condition */}

        {/* Example button to toggle the condition */}
        <button onClick={() => setCondition(!condition)}>
          Toggle Condition
        </button>
      </div>
    );
  };
  const imageClick = () => {
    document.getElementById("fileInput").click();
  };

  return (
    <form onSubmit={uploadImage}>
      <div
        style={{
          margin: "30px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{}}>
          <input
            type="file"
            onChange={handleImageChange}
            style={{ display: "none" }}
            accept="image/png, image/jpeg, image/jpg"
          />
          <button type="button" onClick={imageClick}>
            {" "}
            Choose image{" "}
          </button>
        </div>
      </div>

      <div
        style={{
          margin: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }} // Hide the file input
          onChange={handleImageChange}
          accept="image/png, image/jpeg, image/jpg"
        />
        {displayImage != null ? (
          <img
            src={displayImage}
            alt="Condition Met"
            style={{ pointerEvents: "all" }}
            alt="Description"
            onClick={imageClick}
          />
        ) : (
          <img
            src={"images/uploadImage.png"}
            style={{ pointerEvents: "all" }}
            alt="Description"
            onClick={imageClick}
          />
        )}
      </div>
      <div
        style={{
          marginLeft: "20%",
          marginRight: "20%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {requestEpoch == -1 ? (
          <div> </div>
        ) : requestEpoch == 0 ? (
          <div>Request in Queue</div> // Assuming you want to render an empty div if requestEpoch isn't 0
        ) : (
          <ProgressBar progress={requestEpoch} /> // This will render if requestEpoch is 0
        )}
      </div>
      <div
        style={{
          margin: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {!processingRequest ? (
          <button
            type="submit"
            style={{ padding: "20px" }}
            className={buttonTypes.roundColorfulButton}
          >
            Protect Art
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelProcessing}
            style={{ padding: "20px" }}
            className={buttonTypes.cancelButton}
          >
            Cancel Request
          </button>
        )}
      </div>
      {/*<ColorChangeButton type='button'base='yellow' change='green'> hiasdfhosauidf </ColorChangeButton>*/}
    </form>
  );
};

export default ImageUploader;
