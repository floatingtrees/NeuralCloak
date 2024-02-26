   import { useState } from 'react';
   import ImageUploader from '../components/imageUpload'
   import TextBoxAdder from '../components/textBoxAdderPositive';
   import React from 'react';
   import Link from 'next/link';

   import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
   import AboutUs from './AboutUs'; 
   import HomePage from './HomePage';


const App =() => {

     return (
       <div>
          <HomePage/>
          
       </div>
     );
   }
export default App;
