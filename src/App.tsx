import { type UnlistenFn, listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useRef, useState } from "react"
import ProcessBarItem from "@/components/ProcessBarItem"
import { ToastOptions, toast } from "react-toastify"
import Lockdown from "@/components/Lockdown"
import DragAndDropInfo from "@/components/DragAndDropInfo"
import Scrollbar from "@/helpers/Scrollbar"
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core"
import ItemList from "@/components/ItemList"
import { v4 as uuid } from 'uuid'
import { arrayMove } from "@dnd-kit/sortable"

export type Data = {
  fileName: string,
  ids: string[],
  id: string
}[]

const toastOption = {
  position: 'top-center',
  autoClose: 4000,
  draggable: false,
  theme: 'dark',
  pauseOnFocusLoss: false
} as ToastOptions<unknown>

const App = () => {
  const [dataToGo, setDataToGo] = useState<{ fileName: string, sizeChunks: number } | undefined>()
  const [downloadOnGoing, setDownloadOnGoing] = useState<{ is: boolean, fileName: string }>({ is: false, fileName: '' })
  const [deleteOnGoing, setDeleteOnGoing] = useState<{ is: boolean, fileName: string, sizeChunks: number }>({ is: false, fileName: '', sizeChunks: 0 })
  const [data, setData] = useState<Data>([])
  const gotStarterData = useRef<boolean | null>(false)
  const [canTakeFile, setCanTakeFile] = useState<boolean>(true)

  async function handleFileRemove(id: string) {
    setCanTakeFile(false)
    const objToRemove = data[data.findIndex(({ id: uuid }) => uuid === id)]
    setData(prev => prev.filter(({ id: uuid }) => uuid !== id))
    setDeleteOnGoing({ is: true, fileName: objToRemove.fileName, sizeChunks: objToRemove.ids.length })
    toast.info('Deleting the file... This might take a while...', toastOption)
    await invoke('delete_attachments', { ids: objToRemove.ids })
    toast('Deleted the file successfully!', toastOption)
    setDeleteOnGoing({ is: false, fileName: '', sizeChunks: 0 })
    setCanTakeFile(true)
  }

  function getSizeChunksDownload() {
    let length = 0
    data.forEach(item => {
      if (item.fileName === downloadOnGoing.fileName) {
        length = item.ids.length
      }
    })
    return length
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id === over.id) return

    setData(prev => {
      const oldIdx = prev.findIndex(({ id: uuid }) => uuid === active.id)
      const newIdx = prev.findIndex(({ id: uuid }) => uuid === over!.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
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
      setData(prev => [{fileName, ids: dcMsgsIds, id: uuid()}, ...prev])
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
    <main className='bg-[#21242C] flex flex-col items-center min-h-screen w-full text-neutral-100 py-4'>
      { (data.length === 0 && canTakeFile) && <DragAndDropInfo /> }
      { dataToGo && <ProcessBarItem eventName='custom-attachment_sent' fileName={dataToGo.fileName} getSizeChunks={() => dataToGo.sizeChunks} /> }
      { downloadOnGoing.is && <ProcessBarItem eventName='custom-attachment_downloaded' fileName={downloadOnGoing.fileName} getSizeChunks={getSizeChunksDownload} /> }
      { deleteOnGoing.is && <ProcessBarItem eventName='custom-attachment_deleted' fileName={deleteOnGoing.fileName} getSizeChunks={() => deleteOnGoing.sizeChunks} /> }
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <ItemList data={data} setDownloadOnGoing={setDownloadOnGoing} setCanTakeFile={setCanTakeFile} handleFileRemove={handleFileRemove} />
      </DndContext>
    </main>
    <Scrollbar />
  </>)
}
export default App
