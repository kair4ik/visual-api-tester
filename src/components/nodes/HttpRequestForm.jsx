import React from 'react'
import { HTTP_METHODS, METHODS_WITH_BODY } from '../../utils/constants.js'
import { getMethodColorClass } from '../../utils/helpers.js'

const HttpRequestForm = ({ 
  state, 
  actions, 
  onExecuteRequest,
  className = '' 
}) => {
  const { method, url, body, isLoading } = state

  const handleMethodChange = (e) => {
    e.stopPropagation()
    const newMethod = e.target.value
    actions.setField('method', newMethod)
    // Show/hide body section based on method
    actions.setField('showBody', METHODS_WITH_BODY.includes(newMethod))
  }

  const handleUrlChange = (e) => {
    e.stopPropagation()
    actions.setField('url', e.target.value)
  }

  const handleBodyChange = (e) => {
    e.stopPropagation()
    actions.setField('body', e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onExecuteRequest?.()
  }

  const showBodySection = METHODS_WITH_BODY.includes(method)

  return (
    <div className={className}>
      {/* Method + URL Row */}
      <form onSubmit={handleSubmit}>
        <div className="row g-2 mb-3">
          <div className="col-auto">
            <select 
              className={`form-select form-select-sm fw-bold ${getMethodColorClass(method)}`}
              value={method}
              onChange={handleMethodChange}
              style={{ width: '90px' }}
              disabled={isLoading}
            >
              {Object.values(HTTP_METHODS).map(methodOption => (
                <option key={methodOption} value={methodOption}>
                  {methodOption}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col">
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Enter request URL"
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="col-auto">
            <button 
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isLoading || !url}
            >
              {isLoading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <>
                  <i className="bi bi-send-fill"></i> Send
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Body Section */}
      {showBodySection && (
        <div className="mb-3">
          <div className="mb-2">
            <div className="btn-group btn-group-sm" role="group">
              <input 
                type="radio" 
                className="btn-check" 
                name={`bodyType-${state.nodeId}`} 
                id={`raw-${state.nodeId}`} 
                defaultChecked 
              />
              <label className="btn btn-outline-secondary" htmlFor={`raw-${state.nodeId}`}>
                raw
              </label>
              <input 
                type="radio" 
                className="btn-check" 
                name={`bodyType-${state.nodeId}`} 
                id={`json-${state.nodeId}`} 
              />
              <label className="btn btn-outline-secondary" htmlFor={`json-${state.nodeId}`}>
                JSON
              </label>
            </div>
          </div>
          
          <textarea
            className="form-control font-monospace"
            placeholder='{ "key": "value" }'
            value={body}
            onChange={handleBodyChange}
            rows={6}
            style={{ fontSize: '13px' }}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  )
}

export default HttpRequestForm