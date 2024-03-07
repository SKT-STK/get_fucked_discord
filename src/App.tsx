import { type UnlistenFn, listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useRef, useState } from "react"
import ProcessBarItem from "@/components/ProcessBarItem"
import ListItem from "@/components/ListItem"
import { appConfigDir, join } from "@tauri-apps/api/path"

export type Data = {
  fileName: string,
  ids: number[]
}[]

const App = () => {
  const [dataToGo, setDataToGo] = useState<{ fileName: string, sizeChunks: number } | undefined>()
  const [data, setData] = useState<Data>([])
  const gotStarterData = useRef<boolean | null>(false)

  useEffect(() => {
    let unlisten: UnlistenFn
    let isMounted = true
    let canTakeFiles = true

    const getFileName = (path: string) => {
      const pathElements = path.split('\\')
      const fileNameIdx = pathElements.length - 1
      return pathElements[fileNameIdx]
    }

    const handleUserFeedback = (fileSize: number, fileName: string) => {
      const chunks = ((fileSize / (25 * 1024 * 1024)) | 0) + 1
      setDataToGo({ fileName, sizeChunks: chunks })
    }

    const handleDataSave = async (fileName: string, dcMsgsIds: number[]) => {
      setData(prev => [{fileName, ids: dcMsgsIds}, ...prev])
      setDataToGo(undefined)
      canTakeFiles = true
    }

    const processFileContents = async (filePath: string) => {
      const ret = await invoke('process_file_contents', { filePath })
      const fileName = getFileName(filePath)
      handleDataSave(fileName, ret as number[])
    }

    const setupListener = async () => {
      unlisten = await listen('tauri://file-drop', async e => {
        if (!isMounted || !canTakeFiles) return

        canTakeFiles = false
        const filePath = (e.payload as string[])[0]
        processFileContents(filePath)
        handleUserFeedback(await invoke('get_file_size', { path: filePath }), getFileName(filePath))
      })
    }

    const getStarterData = async () => {
      const starterData = await invoke('get_starter_data', { basePath: await appConfigDir(), path: await join(await appConfigDir(), 'data.json') })
      starterData && setData(JSON.parse(starterData as string) as Data)
      gotStarterData.current = true
    }

    getStarterData()
    setupListener()

    return () => {
      isMounted = false
      if (unlisten) unlisten()
    }
  }, [])

  useEffect(() => {
    (async () => {
      if (!gotStarterData.current) return
      invoke('write_config_file', { path: await join(await appConfigDir(), 'data.json'), contents: JSON.stringify(data) })
    })()
  }, [data])

  return (
    <main className='bg-[#21242C] flex flex-col items-center min-h-screen w-full text-neutral-100 pt-4'>
      { dataToGo && <ProcessBarItem fileName={dataToGo.fileName} getSizeChunks={() => dataToGo.sizeChunks} /> }
      { data.map((v, i) => (
        <ListItem key={i} name={v.fileName} />
      )) }
    </main>
  )
}
export default App
