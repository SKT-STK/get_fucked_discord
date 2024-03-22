import { useEffect, useState } from "react";

export default function useScrollbarPos() {
  const [scrollbarPos, setScrollbarPos] = useState<number>(0)

  useEffect(() => {
    function updateScrollbarPos() {
      const totalHeight = document.body.scrollHeight - window.innerHeight
      const scrollY = window.scrollY

      setScrollbarPos(totalHeight ? (scrollY / totalHeight) * 100 : 0)
    }

    document.addEventListener('scroll', updateScrollbarPos)

    return () => {
      document.removeEventListener('scroll', updateScrollbarPos)
    }
  }, [])

  return scrollbarPos
}
