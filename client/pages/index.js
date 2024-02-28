   import { useState } from 'react';
   import ImageUploader from '../components/imageUpload'
   import TextBoxAdder from '../components/textBoxAdderPositive';
   import React from 'react';
   import Link from 'next/link';

   import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
   import AboutUs from './AboutUs'; 
   import HomePage from './HomePage';
   import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })


const App =() => {

     return (

        <div className={inter.className}>
       <div>
          <HomePage/>
          
       </div>
       </div>
     );
   }
export default App;
