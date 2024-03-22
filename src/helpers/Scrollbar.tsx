import useScrollbarPos from "@/hooks/useScrollbarPos"
import { useEffect } from "react"

const Scrollbar = () => {
  const scrollbarPos = useScrollbarPos()

  useEffect(() => {
    document.documentElement.style.setProperty('--scrollbar-top-round', scrollbarPos === 0 ? '0' : '1vw')
    document.documentElement.style.setProperty('--scrollbar-bottom-round', scrollbarPos === 100 ? '0' : '1vw')
  }, [scrollbarPos])

  return <></>
}
export default Scrollbar
