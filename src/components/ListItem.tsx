import { downloadDir, join } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api/tauri"
import { ToastOptions, toast } from "react-toastify"

interface ListDisplayProps {
  name: string
  ids: string[]
}

const toastOption = {
  position: 'top-center',
  autoClose: 4000,
  draggable: false,
  theme: 'dark'
} as ToastOptions<unknown>

const ListDisplay = ({ name, ids }: ListDisplayProps) => {
  const handleOnClick = async () => {
    toast.info('Starting download... This might take a while...', toastOption)
    await invoke('download_attachment', { filePath: await join(await downloadDir(), name), ids })
    toast('Download completed!', toastOption)
  }

  return (
    <section
      className='w-[90%] h-[10vh] flex justify-center items-center text-center [&:not(:last-child)]:border-b-[1px] cursor-pointer
        border-[#15F5BA] text-2xl hover:bg-[#FFF1] [&:first-child]:rounded-t-xl [&:last-child]:rounded-b-xl'
      onClick={handleOnClick}
    >
      { name }
    </section>
  )
}
export default ListDisplay
