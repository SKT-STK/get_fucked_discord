import Lottie from 'lottie-react'
import animationData from '@/assets/animations/plus.json'

const DragAndDropInfo = () => {
  return (
    <div className='flex-grow flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-lexendDeca'>Drag &apos;n&apos; Drop some files</h1>
      <div className='relative w-[200px] aspect-square'>
        <Lottie
          className='absolute inset-0'
          animationData={animationData}
          autoplay
          loop
        />
      </div>
      <h1 className='text-4xl font-lexendDeca'>to upload them!</h1>
    </div>
  )
}
export default DragAndDropInfo
