// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './Header.jsx'
import Header from './component/Header.jsx'
import Herosection from './component/Herosection.jsx'
import Portfolio from './component/portfolio.jsx'
import About from './component/About.jsx'
import {TextInfiniteCarousel,Textcourcorl} from './component/textcourcorl.jsx'
import Portfolio2 from './component/portfolio2.jsx'
import LocalTimeWithCountry from './component/localtime.jsx'
import { SpeedInsights } from '@vercel/speed-insights/react';
import SplashCursor from './component/cursor.jsx'
import Footer from './component/footer.jsx'
import Processs from './component/porcess.jsx'




createRoot(document.getElementById('root')).render(
  <>
  <SplashCursor />
  <SpeedInsights />
  <Header/>
  <Herosection/>
  <Textcourcorl/>
  <About/>
  <TextInfiniteCarousel/>
  <Portfolio2/>
  <Portfolio/>
  <Processs/>
  <Footer/>
  </>
 
) 
