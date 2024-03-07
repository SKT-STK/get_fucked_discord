
interface ListDisplayProps {
  name: string
}

const ListDisplay = ({ name }: ListDisplayProps) => {
  return (
    <section
      className='w-[90%] h-[10vh] flex justify-center items-center text-center [&:not(:last-child)]:border-b-[1px] cursor-pointer
        border-[#15F5BA] text-2xl hover:bg-[#FFF1] [&:first-child]:rounded-t-xl [&:last-child]:rounded-b-xl'
      onClick={() => {}}
    >
      { name }
    </section>
  )
}
export default ListDisplay
