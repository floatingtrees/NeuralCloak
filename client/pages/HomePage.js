import { useState } from "react";

import ImageUploader from "../components/imageUpload";
import TextBoxAdderPositive from "../components/textBoxAdderPositive";
import TextBoxAdderNegative from "../components/textBoxAdderNegative";
import React from "react";
import Link from "next/link";

const HomePage = () => {
  const [message, setMessage] = useState("");
  const [positiveTextValues, setPositiveTextValues] = useState("");
  const [negativeTextValues, setNegativeTextValues] = useState("");

  const handleClick = async (e) => {
    const response = await fetch("/api/retrieve-image", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div>
      <title>Neural Cloak</title>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>
          <b> Neural Cloak: Keep your Artwork out of AI Datasets </b>
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginLeft: "20%",
          marginRight: "20%",
        }}
      >
        <p style={{ textIndent: "70px" }}>
          Upload your image, fill in the prompts, and click the Protect Art
          button to protect it. It might take a while, and please don't close
          your browser while it's loading. After the progress bar reaches 100%,
          you can download the image and use it as you please. If you're
          interested in how this works, take a look{" "}
          <Link href="/AboutUs"> here</Link>. Currently, we only support jpg,
          jpeg, and png formats.{" "}
          <b>
            {" "}
            If something on the website breaks, join the Discord and I'll fix it
          </b>
          .
        </p>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginLeft: "20%",
          marginRight: "20%",
          fontSize: "16px",
        }}
      >
        <p>
          {" "}
          Did you find a bug, want new features, or have questions? Join our
          <Link href="https://discord.gg/JZT873vsCn"> Discord</Link> to contact
          us directly
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <p style={{ fontSize: "20px" }}>
          What is your art currently captioned as?
        </p>
        <TextBoxAdderNegative onValueChange={setNegativeTextValues} />
        <p style={{ fontSize: "20px", marginTop: "5%" }}>
          What do you want neural networks to see?
        </p>
        <TextBoxAdderPositive onValueChange={setPositiveTextValues} />
      </div>
      <div></div>

      <ImageUploader
        positiveTextValues={positiveTextValues}
        negativeTextValues={negativeTextValues}
      />
    </div>
  );
};
export default HomePage;
