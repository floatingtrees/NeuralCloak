import '../styles/global.css';
   import Link from 'next/link';


export default function App({ Component, pageProps }) {
  return <div style={{ backgroundColor: '#f0f0f0' }}>
  <Component {...pageProps} />
  <div style={{display: 'flex', justifyContent: 'space-between' }}>
    <div style={{marginLeft:'30%', margin:'20px'}}> 
      <p style={{display: 'flex',  justifyContent:'center', alignItems:'center', fontSize:'12px'}}>
      <Link href="/TermsOfService"> Terms of Service</Link>
      </p>
    </div>
    <div style={{margin:'20px'}}> <p style={{fontSize:'12px'}}>Made by AI Apprenticeships LLC </p></div> 
    <div style={{marginRight:'30%', margin:'20px'}}> 
      <p style={{display: 'flex',  justifyContent:'center', alignItems:'center', fontSize:'12px'}}>
      <Link href="/PrivacyPolicy"> Privacy Policy</Link>
      </p>
    </div>

    </div>
  </div>;
}
