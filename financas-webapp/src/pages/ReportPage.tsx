import { useEffect, useRef } from 'react'
import { useAppSelector } from '../app/hooks'

export default function ReportPage() {
  const token = useAppSelector((state) => state.auth.token)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.origin.startsWith('http://localhost:')) return
      if (e.data?.type === 'REPORT_READY') {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'AUTH_TOKEN', token },
          '*'
        )
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [token])

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
        Relatório Financeiro
      </h1>
      <iframe
        ref={iframeRef}
        src="http://localhost:5174"
        style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }}
        title="Relatório por categoria"
      />
    </div>
  )
}
