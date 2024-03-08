import { useDroppable } from "@dnd-kit/core"

const TrashBin = () => {
  const { setNodeRef } = useDroppable({
    id: 'trashBin'
  })

  return (
    <section
      ref={setNodeRef}
      className='fixed bottom-7 left-1/2 -translate-x-1/2 aspect-square rounded-full w-[5vw] bg-white'
    />
  )
}
export default TrashBin
