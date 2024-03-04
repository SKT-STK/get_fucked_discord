import { invoke } from "@tauri-apps/api/tauri"
import { useRef } from "react"

const App = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <main className='bg-zinc-900 flex justify-center items-center min-h-screen w-full text-neutral-100'>
      <input type="text" ref={inputRef} />
      <button
        type="button"
        onClick={async () => invoke('send_message', { msg: inputRef.current?.value })}
      >
        send nigga
      </button>
    </main>
  )
}
export default App
