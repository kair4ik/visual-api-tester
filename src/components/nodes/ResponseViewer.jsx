import React from 'react'
import { REQUEST_STATUS } from '../../utils/constants.js'
import { getStatusColorClass } from '../../utils/helpers.js'

const ResponseViewer = ({ state, className = '' }) => {
  const { status, response, error, extractedData, isValid } = state

  const renderLoadingState = () => (
    <div className="d-flex align-items-center mt-2">
      <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <small className="text-muted">Sending request...</small>
    </div>
  )

  const renderSuccessResponse = () => {
    const statusColor = getStatusColorClass(response.status)
    
    return (
      <div className="mt-2 d-flex flex-column h-100" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <span className={`badge bg-${statusColor} me-2`}>
              {response.status}
            </span>
            <small className="text-muted">
              {response.statusText} • {new Date().toLocaleTimeString()}
            </small>
          </div>
          
          {/* Validation Status */}
          {isValid !== undefined && (
            <span className={`badge ${isValid ? 'bg-success' : 'bg-danger'}`}>
              <i className={`bi ${isValid ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
              {isValid ? 'Valid' : 'Invalid'}
            </span>
          )}
        </div>
        
        {/* Response Data Preview */}
        <div className="mb-2 d-flex flex-column" style={{ flex: 1 }}>
          <small className="text-muted fw-bold d-block mb-1">
            <i className="bi bi-database"></i> Response Data:
          </small>
          <pre className="bg-dark text-light p-2 rounded" style={{
            fontSize: '10px',
            overflow: 'auto',
            lineHeight: '1.3',
            flex: 1
          }}>
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
        
        {/* Extracted Data Preview */}
        {extractedData !== undefined && extractedData !== response.data && (
          <div className="mb-2">
            <small className="text-muted fw-bold d-block mb-1">
              <i className="bi bi-funnel"></i> Extracted Data:
            </small>
            <pre className="bg-primary bg-opacity-10 text-dark p-2 rounded border" style={{
              fontSize: '10px',
              maxHeight: '80px',
              overflow: 'auto',
              lineHeight: '1.3'
            }}>
              {typeof extractedData === 'object' 
                ? JSON.stringify(extractedData, null, 2)
                : String(extractedData)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  const renderErrorResponse = () => (
    <div className="mt-2">
      <div className="alert alert-danger alert-sm py-2" style={{ fontSize: '11px' }}>
        <i className="bi bi-exclamation-triangle-fill me-1"></i>
        <strong>Error:</strong> {error.message}
        {error.response && (
          <div className="mt-1">
            Status: {error.response.status} {error.response.statusText}
          </div>
        )}
      </div>
    </div>
  )

  const renderIdleState = () => (
    <div className="mt-2">
      <small className="text-muted">
        <i className="bi bi-info-circle"></i> Ready to send request
      </small>
    </div>
  )

  const renderContent = () => {
    switch (status) {
      case REQUEST_STATUS.LOADING:
        return renderLoadingState()
      case REQUEST_STATUS.SUCCESS:
        return response ? renderSuccessResponse() : renderIdleState()
      case REQUEST_STATUS.ERROR:
        return error ? renderErrorResponse() : renderIdleState()
      default:
        return renderIdleState()
    }
  }

  return (
    <div className={`${className} d-flex flex-column h-100`}>
      {renderContent()}
    </div>
  )
}

export default ResponseViewer