import { type UnlistenFn, listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect } from "react"

const App = () => {


  useEffect(() => {
    let unlisten: UnlistenFn
    (async () => {
      unlisten = await listen('tauri://file-drop', async e => {
        const filePath = (e.payload as string[])[0]
        invoke('get_file_contents', { filePath })
      })
    })()
    return () => unlisten()
  }, [])

  return (
    <main className='bg-zinc-900 flex flex-col justify-center items-center min-h-screen w-full text-neutral-100'>
      {/* <button
        type="button"
        onClick={async () => invoke('send_message', { msg: inputRef.current?.value })}
      >
        send nigga
      </button> */}
    </main>
  )
}
export default App
