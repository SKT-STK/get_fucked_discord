
const BlankSpaceEvent = () => {
  return (
    <div
      className='w-full flex-grow'
      onClick={() => document.dispatchEvent(new CustomEvent('blank-space-clicked'))}
    />
  )
}
export default BlankSpaceEvent
