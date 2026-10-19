import { useState, useCallback, useRef, useEffect } from 'react'

// เล่นแอนิเมชันปิดก่อน แล้วค่อยเรียก onClose จริง
export default function useModalClose(onClose, duration = 320) {
  const [closing, setClosing] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const requestClose = useCallback((...args) => {
    if (closing) return
    setClosing(true)
    timer.current = setTimeout(() => onClose?.(...args), duration)
  }, [closing, onClose, duration])
  return [closing, requestClose]
}
