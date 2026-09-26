import { useCarbonFootprint } from 'react-carbon-footprint'

/**
 * CarbonFootprintDisplay
 * A fixed-position overlay widget that shows network carbon footprint
 * for the current browser session. Uses the react-carbon-footprint hook
 * which intercepts fetch/XHR calls to measure bytes transferred.
 */
const CarbonFootprintDisplay = () => {
  const [gCO2, bytesTransferred] = useCarbonFootprint()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(255,255,255,0.92)',
        padding: '10px 14px',
        borderRadius: '8px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '0.82rem',
        color: '#333',
        minWidth: '220px',
        border: '1px solid #d4edda',
      }}
    >
      <h3 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#2e7d32' }}>
        🌿 Network Carbon Footprint
      </h3>
      <p style={{ margin: '2px 0' }}>
        <strong>Bytes Transferred:</strong> {bytesTransferred.toFixed(0)} bytes
      </p>
      <p style={{ margin: '2px 0' }}>
        <strong>CO₂ Emissions:</strong> {gCO2.toFixed(2)} g CO₂eq
      </p>
      <p style={{ margin: '6px 0 0', fontSize: '0.75em', color: '#666' }}>
        Estimates based on network data transfer during this session
      </p>
    </div>
  )
}

export default CarbonFootprintDisplay
