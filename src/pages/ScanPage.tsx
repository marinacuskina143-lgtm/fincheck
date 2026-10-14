import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { SubHeader } from '../components/Chrome'
import { parseFiscalQr, sameFiscal } from '../fiscal'
import { useFin } from '../store'

function stopQuiet(scanner: Html5Qrcode) {
  try {
    const state = scanner.getState()
    if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
      void scanner.stop().catch(() => undefined)
    }
  } catch {
    // Камера уже выключена.
  }
}

function sampleQr(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}`
  return `t=${stamp}&s=60.64&fn=9999078900004168&i=4812&fp=1234567890&n=1`
}

export function ScanPage() {
  const navigate = useNavigate()
  const { receipts } = useFin()
  const receiptsRef = useRef(receipts)
  const [message, setMessage] = useState('Наведите камеру на QR с кассового чека.')
  const [cameraError, setCameraError] = useState('')
  receiptsRef.current = receipts

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    let cancel = false

    const openFiscal = (raw: string) => {
      const fiscal = parseFiscalQr(raw)
      if (!fiscal) {
        setMessage('Этот код не похож на кассовый чек.')
        return false
      }
      const existing = receiptsRef.current.find((receipt) => receipt.fiscal && sameFiscal(receipt.fiscal, fiscal))
      if (existing) navigate(`/receipt/${existing.id}`, { replace: true })
      else navigate('/edit/new', { replace: true, state: { fiscal } })
      return true
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 230, height: 230 } },
        (text) => {
          if (cancel) return
          if (!openFiscal(text)) return
          cancel = true
          stopQuiet(scanner)
        },
        () => undefined,
      )
      .then(() => {
        if (cancel) stopQuiet(scanner)
      })
      .catch(() => {
        if (!cancel) setCameraError('Камера недоступна. Можно ввести чек вручную или открыть пример QR.')
      })

    return () => {
      cancel = true
      stopQuiet(scanner)
    }
  }, [navigate])

  return (
    <div className="page scan-page">
      <SubHeader title="Сканер" back="/" />
      <p className="scan-hint" role="status">
        {cameraError || message}
      </p>
      <div id="qr-reader" />
      <div className="form-block">
        <button type="button" className="btn" onClick={() => navigate('/edit/new')}>
          Добавить без QR
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            const fiscal = parseFiscalQr(sampleQr())
            if (!fiscal) return
            const existing = receipts.find((receipt) => receipt.fiscal && sameFiscal(receipt.fiscal, fiscal))
            if (existing) navigate(`/receipt/${existing.id}`, { replace: true })
            else navigate('/edit/new', { replace: true, state: { fiscal } })
          }}
        >
          Пример QR-чека
        </button>
      </div>
    </div>
  )
}
