import { downloadDir, join } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api/tauri"
import Lottie, { type LottieRefCurrentProps } from "lottie-react"
import { useRef } from "react"
import { ToastOptions, toast } from "react-toastify"
import animationData from '@/assets/animations/trashBinAnim.json'
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ListItemProps {
  name: string
  id: string
  ids: string[]
  setDownloadOnGoing: ({is, fileName}: {is: boolean, fileName: string}) => void
  canTakeFileCallback: (canTakeFile: boolean) => void
  removeFileCallback: (id: string) => Promise<void>
}

const toastOption = {
  position: 'top-center',
  autoClose: 4000,
  draggable: false,
  theme: 'dark',
  pauseOnFocusLoss: false
} as ToastOptions<unknown>

const ListItem = ({ name, id, ids, setDownloadOnGoing, canTakeFileCallback, removeFileCallback }: ListItemProps) => {
  const animRef = useRef<LottieRefCurrentProps>(null)
  const { attributes,listeners, setNodeRef, transform, transition } = useSortable({ id })

  const styles = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  async function handleOnDownload() {
    canTakeFileCallback(false)
    toast.info('Starting download... This might take a while...', toastOption)
    setDownloadOnGoing({is: true, fileName: name})
    await invoke('download_attachment', { filePath: await join(await downloadDir(), name), ids })
    toast('Download completed!', toastOption)
    setDownloadOnGoing({is: false, fileName: ''})
    canTakeFileCallback(true)
  }

  async function handleOnRemove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation()
    removeFileCallback(id)
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={styles}
      className='w-[90%] h-[10vh] flex justify-between items-center text-center [&:not(:last-child)]:border-b-[1px] cursor-pointer
        border-[#15F5BA] text-2xl hover:bg-[#FFF1] [&:first-child]:rounded-t-xl [&:last-child]:rounded-b-xl px-5'
      onDoubleClick={handleOnDownload}
    >
      { name }
      <div
        className='relative aspect-square w-[2.4em] cursor-pointer hover:scale-125 duration-100 hue-rotate-180 invert grayscale hover:grayscale-0'
        onMouseOver={() => animRef.current?.goToAndPlay(20, true) }
        onMouseLeave={() => animRef.current?.goToAndStop(0, true) }
        onDoubleClick={handleOnRemove}
      >
        <Lottie
          lottieRef={animRef}
          className='absolute pointer-events-none'
          animationData={animationData}
          loop={true}
          autoplay={false}
        />
      </div>
    </div>
  )
}
export default ListItem
