import { useState } from "react";
import ImageUploader from "../components/imageUpload";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage from "./HomePage";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <div style={{ margin: "20px" }}>
      <title>Privacy Policy</title>
      <h1
        style={{
          margin: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Privacy Policy
      </h1>
      We don't collect any information about except for the information supplied
      to us by Google or that you give us. The personal information we collect
      may include names email addresses, usernames, passwords, billing
      addresses, and debit/credit card numbers. If you don't want us to collect
      parts of your information, please join our discord and tell us.
    </div>
  );
};

export default PrivacyPolicy;
