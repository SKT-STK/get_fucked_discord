import { type Data } from '@/App'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ListItem from '@/components/ListItem'

interface ItemListProps {
  data: Data
  setDownloadOnGoing: ({is, fileName}: {is: boolean, fileName: string}) => void
  setCanTakeFile: (canTakeFile: boolean) => void
  handleFileRemove: (id: string) => Promise<void>
  handleFileRename: (id: string, name: string) => void
}

const ItemList = ({ data, setDownloadOnGoing, setCanTakeFile, handleFileRemove, handleFileRename }: ItemListProps) => {
  return (
    <div className='flex flex-col items-center w-full'>
      <SortableContext items={data} strategy={verticalListSortingStrategy}>
        { data.map(v => (
          <ListItem key={v.id} id={v.id} name={v.fileName} ids={v.ids} setDownloadOnGoing={setDownloadOnGoing} canTakeFileCallback={setCanTakeFile} removeFileCallback={handleFileRemove} handleFileRename={handleFileRename} />
        )) }
      </SortableContext>
    </div>
  )
}
export default ItemList
