import { invoke } from "@tauri-apps/api"
import { useEffect } from "react"

const SplashScreen = () => {
  useEffect(() => {
    (async () => {
      invoke('show_window')
    })()
  }, [])

  return <></>
}
export default SplashScreen
