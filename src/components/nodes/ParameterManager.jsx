import React from 'react'
import { DATA_TYPES } from '../../utils/constants.js'

const ParameterManager = ({ state, actions, className = '' }) => {
  const { parameters } = state

  const handleAddParameter = (e) => {
    e.stopPropagation()
    actions.addParameter()
  }

  const handleRemoveParameter = (index, e) => {
    e.stopPropagation()
    actions.removeParameter(index)
  }

  const handleUpdateParameter = (index, field, value, e) => {
    e.stopPropagation()
    actions.updateParameter(index, field, value)
  }

if (parameters.length === 0) {
    return (
      <div className={`${className} d-flex flex-column h-100`}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted fw-bold">
            <i className="bi bi-info-circle"></i> Dynamic Parameters with Input Sockets
          </small>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={handleAddParameter}
          >
            <i className="bi bi-plus-circle"></i> Add Parameter
          </button>
        </div>
        
<div className="text-center py-4 text-muted d-flex flex-column justify-content-center align-items-center" style={{ flex: 1 }}>
          <i className="bi bi-sliders" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
          <p className="mt-2 mb-0">No parameters yet</p>
          <small>Add parameters to create input sockets</small>
        </div>
      </div>
    )
  }

return (
    <div className={`${className} d-flex flex-column h-100`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted fw-bold">
          <i className="bi bi-info-circle"></i> Dynamic Parameters with Input Sockets
        </small>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={handleAddParameter}
        >
          <i className="bi bi-plus-circle"></i> Add Parameter
        </button>
      </div>
      
<div className="border rounded" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <div className="row g-0 bg-light border-bottom p-2">
          <div className="col-1"><small className="fw-bold text-muted">✓</small></div>
          <div className="col-4"><small className="fw-bold text-muted">KEY</small></div>
          <div className="col-2"><small className="fw-bold text-muted">TYPE</small></div>
          <div className="col-4"><small className="fw-bold text-muted">VALUE</small></div>
          <div className="col-1"></div>
        </div>
        
        {/* Parameter Rows */}
        {parameters.map((param, index) => (
          <div key={param.id} className="row g-0 border-bottom p-2 align-items-center">
            {/* Enabled Checkbox */}
            <div className="col-1">
              <input 
                className="form-check-input" 
                type="checkbox" 
                checked={param.enabled}
                onChange={(e) => handleUpdateParameter(index, 'enabled', e.target.checked, e)}
              />
            </div>
            
            {/* Key Input */}
            <div className="col-4 pe-2">
              <input
                className="form-control form-control-sm border-0"
                type="text"
                placeholder="Parameter name"
                value={param.key}
                onChange={(e) => handleUpdateParameter(index, 'key', e.target.value, e)}
              />
            </div>
            
            {/* Type Select */}
            <div className="col-2 pe-2">
              <select
                className="form-select form-select-sm border-0"
                value={param.type}
                onChange={(e) => handleUpdateParameter(index, 'type', e.target.value, e)}
              >
                {Object.values(DATA_TYPES).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Value Input */}
            <div className="col-4 pe-2">
              <input
                className="form-control form-control-sm border-0"
                type="text"
                placeholder={param.hasConnection ? 'Connected' : 'Default value'}
                value={param.hasConnection ? '' : param.value}
                disabled={param.hasConnection}
                onChange={(e) => handleUpdateParameter(index, 'value', e.target.value, e)}
                style={{
                  backgroundColor: param.hasConnection ? '#e9ecef' : 'transparent'
                }}
              />
            </div>
            
            {/* Remove Button */}
            <div className="col-1">
              <button
                className="btn btn-sm text-danger"
                onClick={(e) => handleRemoveParameter(index, e)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ParameterManager