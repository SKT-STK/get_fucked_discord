import { downloadDir, join } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/tauri'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { ToastOptions, toast } from 'react-toastify'
import animationData from '@/assets/animations/trashBinAnim.json'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ListItemProps {
  name: string
  id: string
  ids: string[]
  setDownloadOnGoing: ({is, fileName}: {is: boolean, fileName: string}) => void
  canTakeFileCallback: (canTakeFile: boolean) => void
  removeFileCallback: (id: string) => Promise<void>
  handleFileRename: (id: string, name: string) => void
}

const toastOption = {
  position: 'top-center',
  autoClose: 4000,
  draggable: false,
  theme: 'dark',
  pauseOnFocusLoss: false
} as ToastOptions<unknown>

const ListItem = ({ name, id, ids, setDownloadOnGoing, canTakeFileCallback, removeFileCallback, handleFileRename }: ListItemProps) => {
  const animRef = useRef<LottieRefCurrentProps>(null)
  const { attributes,listeners, setNodeRef, transform, transition } = useSortable({ id })
  const [showInput, setShowInput] = useState<boolean>(false)

  const styles: CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
    cursor: transform ? 'grabbing' : 'grab'
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

  function handleOnSubmit({ key, currentTarget: { value } }: React.KeyboardEvent<HTMLInputElement>) {
    if (key === 'Enter') {
      handleFileRename(id, value)
      setShowInput(false)
    }
    else if (key === 'Escape') {
      setShowInput(false)
    }
  }

  useEffect(() => {
    document.addEventListener('blank-space-clicked', () => setShowInput(false))

    return () => {
      document.removeEventListener('blank-space-clicked', () => setShowInput(false))
    }
  }, [])

  return (
    <div
      ref={showInput ? undefined : setNodeRef}
      {...(showInput ? {} : attributes)}
      {...(showInput ? {} : listeners)}
      style={styles}
      className='w-[90%] h-[10vh] flex justify-between items-center text-center [&:not(:last-child)]:border-b-[1px] relative
        border-[#15F5BA] text-2xl hover:bg-[#FFF1] [&:first-child]:rounded-t-xl [&:last-child]:rounded-b-xl px-5'
      onDoubleClick={handleOnDownload}
      onAuxClick={() => setShowInput(true)}
      onContextMenu={e => e.preventDefault()}
    >
      { showInput ? <>
        <input
          type="text"
          className='w-[calc(95%-2.4em)] bg-[#0002] rounded-md border-none outline-none'
          onKeyDown={handleOnSubmit}
          defaultValue={name}
          onBlur={() => setShowInput(false)}
        />
      </> : <>
        <span className='max-w-[calc(100%-2.4em)] overflow-hidden'>{ name }</span>
      </> }
      <div className='aspect-square w-[2.4em] right-[2.4em] absolute'>
        { (new Array(20)).fill(undefined).map((_, i) => (
          <div key={i} className='w-[5%] absolute h-full' style={{ left: `${i * 5}%`, backdropFilter: `blur(${i * 0.25}px)` }} />
        )) }
      </div>
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
