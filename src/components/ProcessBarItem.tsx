import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { useEffect, useState } from 'react'
import { type TargetAndTransition, motion } from 'framer-motion'

interface ProcessBarItemProps {
  eventName: string
  fileName: string
  getSizeChunks: () => number
}

const ProcessBarItem = ({ eventName, fileName, getSizeChunks }: ProcessBarItemProps) => {
  const [perc, setPerc] = useState<number>(0)

  const animationPops: TargetAndTransition = {
    width: perc.toString() + '%',
    transition: {
      duration: .3,
      ease: 'easeOut'
    }
  }

  useEffect(() => {
    let unlisten: UnlistenFn
    let isMounted = true
    let nMessages = 0;

    (async () => {
      unlisten = await listen(eventName, () => {
        if (!isMounted) return

        ++nMessages
        setPerc((nMessages / getSizeChunks()) * 100)
      })
    })()

    return () => {
      isMounted = false
      if (unlisten) unlisten()
    }
  }, [])

  return (
    <div 
      className='w-[90%] h-[12vh] flex items-center justify-around [&:not(:only-child)]:border-b-[1px]
      border-[#15F5BA] hover:bg-[#FFF1] rounded-t-xl [&:only-child]:rounded-b-xl flex-col'
    >
      <span
        className='text-3xl'
      >
        { fileName }
      </span>
      <div className='bg-[#211951] w-[95%] h-[25%] relative flex justify-center items-center text-center text-neutral-100 rounded-lg overflow-hidden'>
        <span className='z-[1]'>{ perc.toFixed(2) + '%' }</span>
        <motion.div
          // className='absolute h-full bg-[#836FFF] top-0 bottom-0 left-0'
          style={{
            position: 'absolute',
            height: '100%',
            backgroundColor: '#836FFF',
            top: 0,
            bottom: 0,
            left: 0
          }}
          initial={{ width: 0 }}
          animate={animationPops}
        />
      </div>
    </div>
  )
}
export default ProcessBarItem

// fuck
