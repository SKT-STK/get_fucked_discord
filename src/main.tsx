import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "@/styles/.css"
import '@/styles/tailwind.css'
import { invoke } from "@tauri-apps/api/tauri"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css"
import SplashScreen from "@/helpers/SplashScreen"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
    <SplashScreen />
  </React.StrictMode>
);

(async () => {
  invoke('init_bot')
})()
