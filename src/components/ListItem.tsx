import { useDraggable } from "@dnd-kit/core"
import { downloadDir, join } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect } from "react"
import { ToastOptions, toast } from "react-toastify"

interface ListItemProps {
  name: string
  id: number
  ids: string[]
  setDownloadOnGoing: ({is, fileName}: {is: boolean, fileName: string}) => void
  isDraggingCallback: (isDragging: boolean) => void
  canTakeFileCallback: (canTakeFile: boolean) => void
}

const toastOption = {
  position: 'top-center',
  autoClose: 4000,
  draggable: false,
  theme: 'dark'
} as ToastOptions<unknown>

const ListItem = ({ name, id, ids, setDownloadOnGoing, isDraggingCallback, canTakeFileCallback }: ListItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id.toString()
  })

  const handleOnClick = async () => {
    canTakeFileCallback(false)
    toast.info('Starting download... This might take a while...', toastOption)
    setDownloadOnGoing({is: true, fileName: name})
    await invoke('download_attachment', { filePath: await join(await downloadDir(), name), ids })
    toast('Download completed!', toastOption)
    setDownloadOnGoing({is: false, fileName: ''})
    canTakeFileCallback(true)
  }

  useEffect(() => {
    if (transform) {
      isDraggingCallback(true)
    }
    else {
      isDraggingCallback(false)
    }
  }, [!!transform])

  return (
    <section
      ref={setNodeRef}
      className='w-[90%] h-[10vh] flex justify-between items-center text-center [&:not(:last-child)]:border-b-[1px] cursor-pointer
        border-[#15F5BA] text-2xl hover:bg-[#FFF1] [&:first-child]:rounded-t-xl [&:last-child]:rounded-b-xl px-5'
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        scale: transform ? .95 : 1,
        transition: 'scale 100ms ease-in-out'
      }}
      onClick={handleOnClick}
    >
      { name }
      <div
        {...listeners}
        {...attributes}
        className='w-[3%] h-[50%] flex justify-evenly items-center flex-row flex-wrap'
        style={{
          cursor: transform ? 'grabbing' : 'grab'
        }}
      >
        { Array.from({ length: 6 }, (_, idx) => (
          <div key={idx} className='rounded-full bg-gray-400 w-[35%] h-[22%] scale-50' />
        )) }
      </div>
    </section>
  )
}
export default ListItem
