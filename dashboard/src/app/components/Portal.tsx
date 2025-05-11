'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode;
}

// Portal component to render content at the document root level
export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Only render in the browser, after component is mounted
  return mounted
    ? createPortal(
        children,
        document.body // Attach directly to the body element
      )
    : null
}
