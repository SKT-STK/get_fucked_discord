import { invoke } from "@tauri-apps/api"
import { useEffect } from "react"

const InitBot = () => {
  
  useEffect(() => {
    (async () => {
      invoke('init_bot')
    })()
  }, [])

  return <></>
}
export default InitBot
