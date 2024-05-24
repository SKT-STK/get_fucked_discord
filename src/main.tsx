import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/styles/.css'
import '@/styles/tailwind.css'
import '@/styles/scrollbar.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import SplashScreen from '@/helpers/SplashScreen'
import InitBot from '@/helpers/InitBot'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <InitBot />
    <App />
    <ToastContainer />
    <SplashScreen />
  </React.StrictMode>
)
