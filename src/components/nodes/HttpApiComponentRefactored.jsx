import React, { useEffect } from 'react'
import { TABS, REQUEST_STATUS, NODE_DIMENSIONS } from '../../utils/constants.js'
import { getAvailableFields, getTypeColor } from '../../utils/helpers.js'
import { useNodeState } from '../../hooks/useNodeState.js'
import { useNodeSync } from '../../hooks/useNodeSync.js'

import HttpRequestForm from './HttpRequestForm.jsx'
import ResponseViewer from './ResponseViewer.jsx'
import ParameterManager from './ParameterManager.jsx'

const HttpApiComponentRefactored = ({ 
  data, 
  nodeId, 
  onHeaderMouseDown, 
  onSocketMouseDown, 
  onSocketMouseUp, 
  onSocketMouseEnter, 
  onSocketMouseLeave,
  onDataChange,
  onResizeStart,
  onExecute
}) => {
  // State management with useReducer
  const [state, actions] = useNodeState()
  
  // Sync with external data
  const { updateNodeData } = useNodeSync(state, actions, data, onDataChange)

  // Status indicators
  const getStatusIndicator = () => {
    const statusClass = {
      [REQUEST_STATUS.IDLE]: 'status-indicator',
      [REQUEST_STATUS.LOADING]: 'status-indicator status-pending',
      [REQUEST_STATUS.SUCCESS]: 'status-indicator status-success',
      [REQUEST_STATUS.ERROR]: 'status-indicator status-error'
    }[state.status]

    return <div className={statusClass}></div>
  }

  const getValidationIndicator = () => {
    if (state.isValid === true) {
      return <div className="status-indicator status-success"></div>
    }
    if (state.isValid === false) {
      return <div className="status-indicator status-error"></div>
    }
    return <div className="status-indicator"></div>
  }


  // Header management
  const handleAddHeader = (e) => {
    e.stopPropagation()
    actions.addHeader()
  }

  const handleRemoveHeader = (index, e) => {
    e.stopPropagation()
    actions.removeHeader(index)
  }

  const handleUpdateHeader = (index, field, value, e) => {
    e.stopPropagation()
    actions.updateHeader(index, field, value)
  }

  // Output socket management
  const handleAddOutputSocket = (e) => {
    e.stopPropagation()
    actions.addOutputSocket()
  }

  const handleRemoveOutputSocket = (index, e) => {
    e.stopPropagation()
    actions.removeOutputSocket(index)
  }

  const handleUpdateOutputSocket = (index, field, value, e) => {
    e.stopPropagation()
    actions.updateOutputSocket(index, field, value)
  }

  // Validation form handlers
  const handleExtractPathChange = (e) => {
    e.stopPropagation()
    actions.setField('extractPath', e.target.value)
  }

  const handleExpectedStatusChange = (e) => {
    e.stopPropagation()
    actions.setField('expectedStatus', parseInt(e.target.value) || 200)
  }

  const handleValidationChange = (e) => {
    e.stopPropagation()
    actions.setField('validation', e.target.value)
  }

  // Tab content renderers
  const renderHeadersTab = () => (
    <div className="tab-pane fade show active h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">HTTP Headers</small>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleAddHeader}>
          <i className="bi bi-plus"></i> Add Header
        </button>
      </div>
      
      <div className="border rounded" style={{ flex: 1, overflowY: 'auto' }}>
        {state.headers.length === 0 ? (
          <div className="p-3 text-center text-muted small">No headers added.</div>
        ) : (
          <>
            <div className="row g-0 bg-light border-bottom p-2">
              <div className="col-1"><small className="fw-bold text-muted">✓</small></div>
              <div className="col-5"><small className="fw-bold text-muted">KEY</small></div>
              <div className="col-5"><small className="fw-bold text-muted">VALUE</small></div>
              <div className="col-1"></div>
            </div>
            
            {state.headers.map((header, index) => (
              <div key={header.id || index} className="row g-0 border-bottom p-2 align-items-center">
                <div className="col-1">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={header.enabled}
                    onChange={(e) => handleUpdateHeader(index, 'enabled', e.target.checked, e)}
                  />
                </div>
                <div className="col-5 pe-2">
                  <input
                    className="form-control form-control-sm border-0"
                    type="text"
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => handleUpdateHeader(index, 'key', e.target.value, e)}
                  />
                </div>
                <div className="col-5 pe-2">
                  <input
                    className="form-control form-control-sm border-0"
                    type="text"
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => handleUpdateHeader(index, 'value', e.target.value, e)}
                  />
                </div>
                <div className="col-1">
                  <button
                    className="btn btn-sm text-danger"
                    onClick={(e) => handleRemoveHeader(index, e)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )

  const renderValidationTab = () => (
    <div className="tab-pane fade show active h-100">
      <div className="mb-3">
        <label className="form-label fw-bold">Extract Path</label>
        <div className="input-group input-group-sm">
          <span className="input-group-text">
            <i className="bi bi-arrow-down-circle"></i>
          </span>
          <input
            className="form-control"
            type="text"
            placeholder="e.g., data.users[0].name"
            value={state.extractPath}
            onChange={handleExtractPathChange}
          />
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6">
          <label className="form-label fw-bold">Expected Status</label>
          <input
            className="form-control form-control-sm"
            type="number"
            placeholder="200"
            value={state.expectedStatus}
            onChange={handleExpectedStatusChange}
          />
        </div>
        <div className="col-6">
          <label className="form-label fw-bold">Validation</label>
          <input
            className="form-control form-control-sm"
            type="text"
            placeholder="data.length > 0"
            value={state.validation}
            onChange={handleValidationChange}
          />
        </div>
      </div>

      {state.isValid !== undefined && (
        <div className="mt-3">
          <div className={`alert ${state.isValid ? 'alert-success' : 'alert-danger'} alert-sm py-2`} style={{ fontSize: '11px' }}>
            <i className={`bi ${state.isValid ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
            <strong>Validation {state.isValid ? 'Passed' : 'Failed'}</strong>
            {!state.isValid && (
              <div className="mt-1">Check your expected status code and validation expression.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderOutputsTab = () => {
    const availableFields = state.response ? getAvailableFields(state.response) : []
    
    return (
      <div className="tab-pane fade show active h-100 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted fw-bold">
            <i className="bi bi-arrow-right-circle"></i> Custom Output Sockets
          </small>
          <button 
            className="btn btn-outline-success btn-sm"
            onClick={handleAddOutputSocket}
            disabled={!state.response}
          >
            <i className="bi bi-plus-circle"></i> Add Output
          </button>
        </div>
        
        {!state.response && state.outputSockets.length === 0 && (
          <div className="alert alert-info alert-sm py-2" style={{ fontSize: '11px' }}>
            <i className="bi bi-info-circle me-1"></i>
            Execute a request first to see available fields for output sockets.
          </div>
        )}
        
        <div className="border rounded" style={{ flex: 1, overflowY: 'auto' }}>
          {state.outputSockets.length === 0 ? (
            <div className="p-3 text-center text-muted small">No output sockets created.</div>
          ) : (
            <>
              <div className="row g-0 bg-light border-bottom p-2">
                <div className="col-1"><small className="fw-bold text-muted">✓</small></div>
                <div className="col-3"><small className="fw-bold text-muted">NAME</small></div>
                <div className="col-7"><small className="fw-bold text-muted">FIELD PATH</small></div>
                <div className="col-1"></div>
              </div>
              
              {state.outputSockets.map((socket, index) => {
                const selectedField = availableFields.find(f => f.path === socket.path)
                
                return (
                  <div key={socket.id} className="row g-0 border-bottom p-2 align-items-center">
                    <div className="col-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={socket.enabled}
                        onChange={(e) => handleUpdateOutputSocket(index, 'enabled', e.target.checked, e)}
                      />
                    </div>
                    <div className="col-3 pe-2">
                      <input
                        className="form-control form-control-sm border-0"
                        type="text"
                        placeholder="Output name"
                        value={socket.name}
                        onChange={(e) => handleUpdateOutputSocket(index, 'name', e.target.value, e)}
                      />
                    </div>
                    <div className="col-7 pe-2">
                      <select
                        className="form-select form-select-sm border-0"
                        value={socket.path}
                        onChange={(e) => {
                          e.stopPropagation()
                          const selectedField = availableFields.find(f => f.path === e.target.value)
                          
                          const updatedSocket = {
                            ...socket,
                            path: e.target.value,
                            type: selectedField?.type || 'string'
                          }
                          
                          if (!socket.name && selectedField) {
                            updatedSocket.name = selectedField.name
                          }
                          
                          actions.updateOutputSocket(index, 'path', e.target.value)
                          if (selectedField?.type) {
                            actions.updateOutputSocket(index, 'type', selectedField.type)
                          }
                          if (!socket.name && selectedField?.name) {
                            actions.updateOutputSocket(index, 'name', selectedField.name)
                          }
                        }}
                      >
                        <option value="">Select field...</option>
                        {availableFields.map((field) => (
                          <option key={field.path} value={field.path}>
                            {field.path} ({field.type}) = {field.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-1">
                      <button
                        className="btn btn-sm text-danger"
                        onClick={(e) => handleRemoveOutputSocket(index, e)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    )
  }

  // Render input sockets
  const renderInputSockets = () => {
    if (state.parameters.length === 0) return null

    return (
      <div style={{
        position: 'absolute',
        left: '-10px',
        top: '185px',
        zIndex: 10
      }}>
        {state.parameters.map((param, index) => (
          <div 
            key={param.id}
            style={{
              marginBottom: `${NODE_DIMENSIONS.SOCKET_SPACING}px`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div 
              id={`socket-input-${nodeId}-${param.id}`}
              className="parameter-input-socket"
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: param.hasConnection ? '#28a745' : '#007bff',
                border: '3px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={`${param.key || 'Parameter'} (${param.type})`}
              onMouseDown={(e) => onSocketMouseDown && onSocketMouseDown(e, nodeId, param.id, 'input')}
              onMouseUp={(e) => onSocketMouseUp && onSocketMouseUp(e, nodeId, param.id, 'input')}
              onMouseEnter={(e) => onSocketMouseEnter && onSocketMouseEnter(e, nodeId, param.id, 'input')}
              onMouseLeave={(e) => onSocketMouseLeave && onSocketMouseLeave(e)}
            />
            <small style={{
              marginLeft: '8px',
              color: '#666',
              fontSize: '10px',
              background: 'rgba(255,255,255,0.9)',
              padding: '2px 6px',
              borderRadius: '10px',
              whiteSpace: 'nowrap'
            }}>
              {param.key || `param${index + 1}`}
            </small>
          </div>
        ))}
      </div>
    )
  }

  // Render output sockets
  const renderOutputSockets = () => {
    const enabledSockets = state.outputSockets.filter(socket => socket.enabled && socket.path)
    if (enabledSockets.length === 0) return null

    const availableFields = state.response ? getAvailableFields(state.response) : []

    return (
      <div style={{
        position: 'absolute',
        right: '-12px',
        top: '250px',
        zIndex: 10
      }}>
        {enabledSockets.map((socket, socketIndex) => {
          const selectedField = availableFields.find(f => f.path === socket.path)
          
          return (
            <div 
              key={socket.id}
              style={{
                marginBottom: `${NODE_DIMENSIONS.SOCKET_SPACING}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <small style={{
                marginRight: '8px',
                color: '#666',
                fontSize: '9px',
                background: 'rgba(255,255,255,0.95)',
                padding: '2px 6px',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {socket.name || socket.path?.split('.').pop() || 'output'}
              </small>
              <div 
                id={`socket-output-${nodeId}-${socket.id}`}
                className="custom-output-socket"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: getTypeColor(selectedField?.type || socket.type),
                  border: '3px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={`${socket.name || socket.path || 'output'} (${selectedField?.type || socket.type})`}
                onMouseDown={(e) => onSocketMouseDown && onSocketMouseDown(e, nodeId, socket.id, 'output')}
                onMouseUp={(e) => onSocketMouseUp && onSocketMouseUp(e, nodeId, socket.id, 'output')}
                onMouseEnter={(e) => onSocketMouseEnter && onSocketMouseEnter(e, nodeId, socket.id, 'output')}
                onMouseLeave={(e) => onSocketMouseLeave && onSocketMouseLeave(e)}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {renderInputSockets()}
      
      <div className="card shadow-sm" style={{ 
        width: `${data.width || NODE_DIMENSIONS.WIDTH}px`, 
        height: data.height === 'auto' ? 'auto' : `${data.height || NODE_DIMENSIONS.MIN_HEIGHT}px`,
        minHeight: `${NODE_DIMENSIONS.MIN_HEIGHT}px`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div 
          className="card-header bg-primary text-white d-flex align-items-center" 
          style={{ cursor: 'move' }}
          onMouseDown={onHeaderMouseDown}
        >
          {getStatusIndicator()}
          {getValidationIndicator()}
          <i className="bi bi-api me-2"></i>
          <strong>HTTP API</strong>
          <small className="ms-auto opacity-75">
            <i className="bi bi-arrows-move"></i>
          </small>
        </div>
        
        <div className="card-body p-3 d-flex flex-column" style={{ flexGrow: 1, overflowY: 'auto' }}>
          {/* HTTP Request Form */}
          <HttpRequestForm 
            state={state} 
            actions={actions} 
            onExecuteRequest={onExecute}
          />

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs nav-tabs-sm mb-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${state.activeTab === TABS.PARAMS ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  actions.setField('activeTab', TABS.PARAMS)
                }}
              >
                <i className="bi bi-sliders"></i> Params
                {state.parameters.length > 0 && (
                  <span className="badge bg-light text-dark ms-1">{state.parameters.length}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${state.activeTab === TABS.HEADERS ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  actions.setField('activeTab', TABS.HEADERS)
                }}
              >
                <i className="bi bi-list-ul"></i> Headers
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${state.activeTab === TABS.VALIDATION ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  actions.setField('activeTab', TABS.VALIDATION)
                }}
              >
                <i className="bi bi-shield-check"></i> Validation
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${state.activeTab === TABS.OUTPUTS ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  actions.setField('activeTab', TABS.OUTPUTS)
                }}
              >
                <i className="bi bi-arrow-right-circle"></i> Outputs
                {state.outputSockets.length > 0 && (
                  <span className="badge bg-light text-dark ms-1">{state.outputSockets.length}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${state.activeTab === TABS.RESPONSE ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  actions.setField('activeTab', TABS.RESPONSE)
                }}
              >
                <i className="bi bi-arrow-down-circle"></i> Response
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content" style={{ flexGrow: 1 }}>
            {state.activeTab === TABS.PARAMS && (
              <div className="tab-pane fade show active h-100">
                <ParameterManager state={state} actions={actions} className="h-100" />
              </div>
            )}
            
            {state.activeTab === TABS.HEADERS && renderHeadersTab()}
            
            {state.activeTab === TABS.VALIDATION && renderValidationTab()}

            {state.activeTab === TABS.OUTPUTS && renderOutputsTab()}
            
            {state.activeTab === TABS.RESPONSE && (
              <div className="tab-pane fade show active h-100">
                <ResponseViewer state={state} className="h-100" />
              </div>
            )}
          </div>
        </div>
      </div>

      {renderOutputSockets()}
      <div
        className="resize-handle"
        onMouseDown={(e) => onResizeStart(e, nodeId)}
        style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: '16px',
          height: '16px',
          cursor: 'nwse-resize',
          background: 'rgba(0, 0, 0, 0.1)',
          borderTopLeftRadius: '4px',
          zIndex: 20
        }}
        title="Resize Node"
      >
        <svg width="100%" height="100%" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10 0 L 0 10" stroke="#888" strokeWidth="1"/>
          <path d="M 10 4 L 4 10" stroke="#888" strokeWidth="1"/>
        </svg>
      </div>
    </div>
  )
}

export default HttpApiComponentRefactored