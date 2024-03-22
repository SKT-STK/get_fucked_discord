import { type UnlistenFn, listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useRef, useState } from "react"
import ProcessBarItem from "@/components/ProcessBarItem"
import ListItem from "@/components/ListItem"
import { ToastOptions, toast } from "react-toastify"
import TrashBin from "@/components/TrashBin"
import { DndContext, type DragEndEvent } from "@dnd-kit/core"
import Lockdown from "@/components/Lockdown"

type Data = {
  fileName: string,
  ids: string[]
}[]

const toastOption = {
  position: 'top-center',
  autoClose: 4000,
  draggable: false,
  theme: 'dark'
} as ToastOptions<unknown>

const App = () => {
  const [dataToGo, setDataToGo] = useState<{ fileName: string, sizeChunks: number } | undefined>()
  const [downloadOnGoing, setDownloadOnGoing] = useState<{ is: boolean, fileName: string }>({ is: false, fileName: '' })
  const [deleteOnGoing, setDeleteOnGoing] = useState<{ is: boolean, fileName: string, sizeChunks: number }>({ is: false, fileName: '', sizeChunks: 0 })
  const [data, setData] = useState<Data>([])
  const gotStarterData = useRef<boolean | null>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [canTakeFile, setCanTakeFile] = useState<boolean>(true)

  const handleDragOver = async (e: DragEndEvent) => {
    setCanTakeFile(false)
    const { active, over } = e
    if (!active.id || !over) return
    const objToRemove = data.filter((_, idx) => idx === parseInt(active.id.toString()))[0]
    setData(prev => prev.filter((_, idx) => idx !== parseInt(active.id.toString())))
    setIsDragging(false)
    setDeleteOnGoing({ is: true, fileName: objToRemove.fileName, sizeChunks: objToRemove.ids.length })
    toast.info('Deleting the file... This might take a while...', toastOption)
    await invoke('delete_attachments', { ids: objToRemove.ids })
    toast('Deleted the file successfully!', toastOption)
    setDeleteOnGoing({ is: false, fileName: '', sizeChunks: 0 })
    setCanTakeFile(true)
  }

  useEffect(() => {
    const unlisten: [UnlistenFn, UnlistenFn] = [() => {}, () => {}]
    let isMounted = true

    const getFileName = (path: string) => {
      const pathElements = path.split('\\')
      const fileNameIdx = pathElements.length - 1
      return pathElements[fileNameIdx]
    }

    const handleUserFeedback = (fileSize: number, fileName: string) => {
      const chunks = ((fileSize / (25 * 1024 * 1024)) | 0) + 1
      setDataToGo({ fileName, sizeChunks: chunks })
    }

    const handleDataSave = async (fileName: string, dcMsgsIds: string[]) => {
      setData(prev => [{fileName, ids: dcMsgsIds}, ...prev])
      setDataToGo(undefined)
      toast('Upload completed!', toastOption)
      setCanTakeFile(true)
    }

    const processFileContents = async (filePath: string) => {
      const ret = await invoke('process_file_contents', { filePath })
      const fileName = getFileName(filePath)
      handleDataSave(fileName, ret as string[])
    }

    const setupListener = async () => {
      unlisten[0] = await listen('tauri://file-drop', async e => {
        if (!isMounted) return

        setCanTakeFile(false)
        toast.info('Starting upload... This might take a while...', toastOption)
        const filePath = (e.payload as string[])[0]
        processFileContents(filePath)
        handleUserFeedback(await invoke('get_file_size', { path: filePath }), getFileName(filePath))
      })
    }

    const getStarterData = async () => {
      unlisten[1] = await listen('custom_bot-ready', async () => {
        try {
          const starterData = await invoke('get_starter_data')
          setData(JSON.parse(starterData as string) as Data)
        }
        catch (_) {
          setData([])
        }
        finally {
          gotStarterData.current = true
        }
      })
    }

    getStarterData()
    setupListener()

    return () => {
      isMounted = false
      unlisten.forEach(listener => listener())
    }
  }, [])

  useEffect(() => {
    (async () => {
      if (!gotStarterData.current) return
      invoke('write_config_file', { contents: JSON.stringify(data) })
    })()
  }, [data])

  return (<>
    <Lockdown show={!canTakeFile} />
    <main className='bg-[#21242C] flex flex-col items-center min-h-screen w-full text-neutral-100 pt-4'>
      { dataToGo && <ProcessBarItem eventName='custom-attachment_sent' fileName={dataToGo.fileName} getSizeChunks={() => dataToGo.sizeChunks} /> }
      { downloadOnGoing.is && <ProcessBarItem eventName='custom-attachment_downloaded' fileName={downloadOnGoing.fileName} getSizeChunks={() => {
        let length = 0
        data.forEach(item => {
          if (item.fileName === downloadOnGoing.fileName) {
            length = item.ids.length
          }
        })
        return length
      }} /> }
      { deleteOnGoing.is && <ProcessBarItem eventName='custom-attachment_deleted' fileName={deleteOnGoing.fileName} getSizeChunks={() => deleteOnGoing.sizeChunks} /> }
      <DndContext onDragEnd={handleDragOver}>
        { data.map((v, i) => (
          <ListItem key={i} id={i} name={v.fileName} ids={v.ids} setDownloadOnGoing={setDownloadOnGoing} isDraggingCallback={setIsDragging} canTakeFileCallback={setCanTakeFile} />
        )) }
        { isDragging && <TrashBin /> }
      </DndContext>
    </main>
  </>)
}
export default App
