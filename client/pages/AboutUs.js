   import { useState } from 'react';
   import ImageUploader from '../components/imageUpload'
   import React from 'react';
   import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

   import HomePage from './HomePage';
   import Link from 'next/link';





const AboutUs =() => {
  return (
    <div> 
    <title>How we Protect Your Art</title>
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}> 

    <p style={{ fontSize: '30px' }}> <b>How We Stop Web Scrapers</b></p> 
    </div>
    <div>
    <p style={{textIndent: '70px', marginLeft: '20%', marginRight: '20%'}}> Most AI art datasets are created by scraping the web for images and their descriptions. Then, they use a neural network to measure the similarity between the image's description and the image itself, and discard any description-image pairs that don't match well. We make slight changes to your art that fools neural networks into misclassifying your art so dataset curators will remove your art from their datasets. In other words, we minimize the similarity between your art and its current caption, and we maximize the similarity between your art and whatever you want neural networks to see. If you look closely at the nose of the cloaked shark, you'll see tiny red specks; those are the changes we make to protect your art.</p>
    <p style={{textIndent: '70px', marginLeft: '20%', marginRight: '20%'}}> If you want a more technical explanation of how this works, please join our 
     <Link href="https://discord.gg/JZT873vsCn"> Discord</Link> to contact us directly.</p>
      

    </div>
    <div style={{display: 'flex', justifyContent: 'space-between' }}>
    <div style={{marginLeft:'5%', margin:'20px'}}> 
      <p style={{display: 'flex',  justifyContent:'center', alignItems:'center', fontSize:'24px'}}>
      Original Image
      </p>
      <img style={{ width: '100%', height: 'auto' }} src={'images/shark-demo.jpg'}/> 
      <p style={{display: 'flex',  justifyContent:'center', alignItems:'center', fontSize:'16px'}}>
      Original Label: Great White Shark, AI sees: Tiger Shark, 
      <b style={{margin: '0 4px'}}>Conclusion: Close enough </b>
      </p>
    </div>
    <div style={{marginLeft:'5%', margin:'20px'}}> 
      <p style={{display: 'flex',  justifyContent:'center', alignItems:'center', fontSize:'24px'}}>
      Cloaked Image
      </p>
      <img style={{ width: '100%', height: 'auto' }} src={'images/shark-demo2.jpg'}/> 
      <p style={{display: 'flex',  justifyContent:'center', alignItems:'center', fontSize:'16px'}}>
      Original Label: Great White Shark, AI sees: Potato, 
      <b style={{margin: '0 4px'}}>Result: Removed from dataset </b>
      </p>
    </div>

    </div>
    <div style={{display: 'flex', justifyContent:'center', alignItems:'center', flexDirection: 'column'}}>
    <p style={{ fontSize: '30px'}}> <b>FAQs</b></p> 
    </div>
    <div>
    <p style={{textIndent: '70px', marginLeft: "5%", marginRight: "5%"}}>  <b>Is it possible for web scrapers to uncloak images?</b></p>
    <p style={{marginLeft: "5%", marginRight: "5%"}}>  Not without destroying their wallet or dataset. Adding random noise to their dataset usually doesn't work, so if they want to uncloak your art, they have to heavily blur the image. And since there's no good way for AI to determine if an image is cloaked, web scrapers would have to blur their their entire dataset, and at that point, uncloaking your art becomes more trouble than it's worth. </p>
    <p style={{textIndent: '70px', marginLeft: "5%", marginRight: "5%", marginTop:'50px'}}> <b> Does NeuralCloak work against all models?</b></p>
    <p style={{marginLeft: "5%", marginRight: "5%"}}> We are currently focusing on protecting artists from the most popular web scraping AIs, predominantly OpenAI's CLIP. However, AI is constantly evolving, and we can't guarantee protection from any future or less popular models. </p>
    </div>
    
    <p style={{fontSize:'12px', display: 'flex',  justifyContent:'center', alignItems:'center'}}>
    Shark photo by <a href="https://unsplash.com/@geerald?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" style={{margin: '0 4px'}}> Gerald Schömbs </a> on <a href="https://unsplash.com/photos/white-and-black-shark-underwater-8DO2XXCoB0Q?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" style={{margin: '0 4px'}}>Unsplash</a>
    </p>
  
    </div>
  );
};
         

export default AboutUs;