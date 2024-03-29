import { useState } from "react";
import ImageUploader from "../components/imageUpload";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage from "./HomePage";
import Link from "next/link";

const AboutUs = () => {
  return (
    <div>
      <title>How we Protect Your Art</title>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "30px" }}>
          {" "}
          <b>How We Stop Web Scrapers</b>
        </p>
      </div>
      <div>
        <p
          style={{ textIndent: "70px", marginLeft: "20%", marginRight: "20%" }}
        >
          {" "}
          Most AI art datasets are created by scraping the web for images and
          their descriptions. Then, they use a neural network to measure the
          similarity between the image's description and the image itself,
          discarding any description-image pairs that don't match well. We turn
          your art into a transferrable adversarial example by making slight
          changes that fool neural networks into misclassifying your art, so it
          will be silently dropped from large datasets. In other words, we
          minimize the similarity between your art and its current caption, and
          we maximize the similarity between your art and whatever you want
          neural networks to see. If you look closely at the nose of the cloaked
          shark, you'll see tiny red specks; those are the changes we make to
          protect your art.
        </p>
        <p
          style={{ textIndent: "70px", marginLeft: "20%", marginRight: "20%" }}
        >
          {" "}
          If you want a more technical explanation of how this works, please
          join our
          <Link href="https://discord.gg/JZT873vsCn"> Discord</Link> to ask us
          directly.
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ marginLeft: "5%", margin: "20px" }}>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
            }}
          >
            Original Image
          </p>
          <img
            style={{ width: "100%", height: "auto" }}
            src={"images/sharkDemo.png"}
          />
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            Original Label: Great White Shark, AI sees: Tiger Shark,
            <b style={{ margin: "0 4px" }}>Conclusion: Close enough </b>
          </p>
        </div>
        <div style={{ marginLeft: "5%", margin: "20px" }}>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
            }}
          >
            Cloaked Image
          </p>
          <img
            style={{ width: "100%", height: "auto" }}
            src={"images/sharkDemo2.png"}
          />
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            Original Label: Great White Shark, AI sees: Potato,
            <b style={{ margin: "0 4px" }}>Result: Removed from dataset </b>
          </p>
        </div>
      </div>
      <p
        style={{
          fontSize: "12px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Shark photo by{" "}
        <a
          href="https://unsplash.com/@geerald?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          style={{ margin: "0 4px" }}
        >
          {" "}
          Gerald Schömbs{" "}
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/white-and-black-shark-underwater-8DO2XXCoB0Q?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          style={{ margin: "0 4px" }}
        >
          Unsplash
        </a>
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <p style={{ fontSize: "30px" }}>
          {" "}
          <b>FAQs</b>
        </p>
      </div>
      <div>
        <p style={{ textIndent: "70px", marginLeft: "5%", marginRight: "5%" }}>
          {" "}
          <b>What is the best way to use NeuralCloak?</b>
        </p>
        <p style={{ marginLeft: "5%", marginRight: "5%" }}>
          {" "}
          The best way to protect your art is to give a good prompt for what you
          want neural networks to see. It should be completely unrelated to both
          your current caption and your art for best results. If you want to
          minimize distortions to your art, you can use a deceptive caption that
          has a similar color scheme to your art. For example, if your image is
          a shark in the ocean, your deceptive prompt be "a field of
          Hydrangeas". The two captions are conceptually different but have
          similar colors (blue), which makes it easier to cloak your image
          without adding too many extra colors.
        </p>
        <p style={{ textIndent: "70px", marginLeft: "5%", marginRight: "5%" }}>
          {" "}
          <b>Is it possible for web scrapers to uncloak images?</b>
        </p>
        <p style={{ marginLeft: "5%", marginRight: "5%" }}>
          {" "}
          Not without spending disproportionate amounts of money or damaging
          their dataset. Adding random noise to an image won't uncloak it, so if
          they want to uncloak your art, they have to heavily blur the image.
          And since there's no good way for AI to determine if an image is
          cloaked, web scrapers would have to blur their their entire dataset,
          and at that point, uncloaking your art becomes more trouble than it's
          worth. Web scrapers have hundreds of millions of images in their
          dataset, so they don't really care if they miss a few thousand cloaked
          images.{" "}
        </p>
        <p
          style={{
            textIndent: "70px",
            marginLeft: "5%",
            marginRight: "5%",
            marginTop: "50px",
          }}
        >
          {" "}
          <b> Does NeuralCloak work against all models?</b>
        </p>
        <p style={{ marginLeft: "5%", marginRight: "5%" }}>
          {" "}
          We are currently focused on protecting artists from the most popular
          models used in web scraping, predominantly OpenAI's CLIP models. We
          are planning to add protection from more models. However, AI is
          constantly evolving, and we can't guarantee protection from any future
          or less popular models.{" "}
        </p>
        <p
          style={{
            textIndent: "70px",
            marginLeft: "5%",
            marginRight: "5%",
            marginTop: "50px",
          }}
        >
          {" "}
          <b> What do the percentages represent?</b>
        </p>
        <p style={{ marginLeft: "5%", marginRight: "5%" }}>
          {" "}
          The percentages represent the similarity between your image and the
          chosen captions. They are based on cosine similarity (which ranges
          between 0 and 1), with a few modifications to convert them into
          percentages so make them more understandable. Usually, any similarity
          under 60% is safe.{" "}
        </p>{" "}
        <p
          style={{
            textIndent: "70px",
            marginLeft: "5%",
            marginRight: "5%",
            marginTop: "50px",
          }}
        >
          <b>
            {" "}
            Will cloaking help protect me against someone who is targeting my
            art?
          </b>
        </p>
        <p style={{ marginLeft: "5%", marginRight: "5%" }}>
          {" "}
          Unfortunately, it's virtually impossible to protect against someone
          who is deliberately trying to replicate your art with AI. Cloaking may
          offer limited protection, but if someone is dedicated to uncloaking
          your art, they can use a variety of tools, such as repeated bilinear
          transformations and DiffPure, to remove protection from your image.
          Fortunately, these methods are relatively expensive, so web scrapers
          will don't use them.{" "}
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
