import { useDroppable } from "@dnd-kit/core"
import { useEffect, useRef } from "react"
import { motion, useAnimationControls } from 'framer-motion'
import Lottie, { type LottieRefCurrentProps } from "lottie-react"
import animationData from '@/assets/animations/trashBinAnim.json'

const TrashBin = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'trashBin'
  })
  const controls = useAnimationControls()
  const animation = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    const halfDurationMs = ((animation.current?.getDuration() || 0) / 2) * 1000
    const halfFrames = (animation.current?.getDuration(true) || 0) / 2
    if (isOver) {
      controls.start({ scale: 1.3, transition: { duration: .2, ease: 'easeInOut' } });
      animation.current?.goToAndPlay(0, true)
      setTimeout(() => {
        animation.current?.goToAndStop(halfFrames, true)
      }, halfDurationMs)
    }
    else {
      controls.start({ scale: 1, transition: { duration: .2, ease: 'easeInOut' } });
      animation.current?.goToAndPlay(halfFrames + 15, true)
      setTimeout(() => {
        animation.current?.goToAndStop(0, true)
      }, halfDurationMs)
    }
  }, [isOver])

  return (
    <motion.section
      ref={setNodeRef}
      animate={controls}
      className='fixed bottom-7 left-[46vw] aspect-square rounded-full w-[8vw] bg-slate-500 opacity-50'
    >
      <Lottie
        lottieRef={animation}
        animationData={animationData}
        autoplay={false}
        loop={false}
        className='absolute inset-0 scale-75'
      />
    </motion.section>
  )
}
export default TrashBin
