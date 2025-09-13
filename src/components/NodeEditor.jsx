import React, { useEffect, useRef, useState } from 'react'
import HttpApiComponentRefactored from './nodes/HttpApiComponentRefactored'
import '../nodeEditor.css'
import { useHttpRequest } from '../hooks/useHttpRequest.js'

// Helper to get a value from an object by a path string (e.g., '[0].id')
function getByPath(obj, path) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(k => k)
  let result = obj
  for (const key of keys) {
    if (result === null || result === undefined) return undefined
    result = result[key]
  }
  return result
}

const NodeEditor = () => {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [dragState, setDragState] = useState(null)
  const [resizeState, setResizeState] = useState(null)
  const [connectionDrag, setConnectionDrag] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [viewState, setViewState] = useState({ scale: 1, pan: { x: 0, y: 0 } })
  const [isPanning, setIsPanning] = useState(false)
  const containerRef = useRef(null)
  const { executeRequest } = useHttpRequest()

  useEffect(() => {
    // Create initial nodes for demonstration
    createInitialNodes()
  }, [])

  const createInitialNodes = () => {
    // Node 1: Get a random UUID
    const getUuidNode = {
      id: 'get-uuid',
      type: 'HttpApi',
      position: { x: 50, y: 200 },
      data: {
        method: 'GET',
        url: '/api/uuid',
        headers: JSON.stringify([]),
        body: '',
        status: 'idle',
        response: null,
        error: null,
        width: 450,
        height: 'auto',
        parameters: JSON.stringify([]),
        outputSockets: JSON.stringify([
          {
            id: 'output-uuid',
            name: 'UUID',
            path: 'uuid',
            type: 'string',
            enabled: true
          }
        ])
      }
    }

    // Node 2: Post data with UUID from previous node
    const postDataNode = {
      id: 'post-data',
      type: 'HttpApi',
      position: { x: 550, y: 200 },
      data: {
        method: 'POST',
        url: 'https://httpbin.org/anything',
        headers: JSON.stringify([
          { id: 'header-1', key: 'Content-Type', value: 'application/json', enabled: true }
        ]),
        body: JSON.stringify({ 
          message: 'Hello from Visual API Flow!',
          session_id: ''
        }),
        status: 'idle',
        response: null,
        error: null,
        width: 450,
        height: 'auto',
        parameters: JSON.stringify([
          {
            id: 'param-session-id',
            key: 'session_id',
            value: '',
            type: 'string',
            enabled: true,
            hasConnection: true
          }
        ]),
        outputSockets: JSON.stringify([
          {
            id: 'output-request-id',
            name: 'Request ID',
            path: 'headers.X-Amzn-Trace-Id',
            type: 'string',
            enabled: true
          }
        ])
      }
    }

    // Node 3: Get request info using trace ID
    const getRequestInfoNode = {
      id: 'get-request-info',
      type: 'HttpApi',
      position: { x: 1050, y: 200 },
      data: {
        method: 'GET',
        url: 'https://httpbin.org/headers',
        headers: JSON.stringify([
          { id: 'header-1', key: 'X-Trace-ID', value: '', enabled: true }
        ]),
        body: '',
        status: 'idle',
        response: null,
        error: null,
        width: 450,
        height: 'auto',
        parameters: JSON.stringify([
          {
            id: 'param-trace-id',
            key: 'X-Trace-ID',
            value: '',
            type: 'string',
            enabled: true,
            hasConnection: true
          }
        ]),
        outputSockets: JSON.stringify([])
      }
    }

    // Linear connections
    const initialConnections = [
      // Connect UUID from Node 1 to session_id in Node 2
      {
        id: 'conn-1',
        from: 'get-uuid',
        to: 'post-data',
        fromSocket: 'output-uuid',
        toSocket: 'param-session-id'
      },
      // Connect Request ID from Node 2 to trace ID header in Node 3
      {
        id: 'conn-2',
        from: 'post-data',
        to: 'get-request-info',
        fromSocket: 'output-request-id',
        toSocket: 'param-trace-id'
      }
    ]

    setNodes([getUuidNode, postDataNode, getRequestInfoNode])
    setConnections(initialConnections)
  }

  const addHttpApiNode = () => {
    const newNode = {
      id: `api-${Date.now()}`,
      type: 'HttpApi',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
        headers: JSON.stringify([]),
        body: '',
        status: 'idle',
        response: null,
        error: null,
        parameters: JSON.stringify([]),
        outputSockets: JSON.stringify([]),
        width: 450,
        height: 'auto',
      }
    }
    setNodes(prev => [...prev, newNode])
  }

  // Убрали отдельный HttpRequest - HttpApi умеет делать любые запросы

  // ResponseHandler убран - обработка ответов встроена в HttpApi/HttpRequest

  const executeFlow = async (startNodeId) => {
    console.log(`Executing flow starting from ${startNodeId}`)
    await executeNodeAndTriggerOutputs(startNodeId)
  }

  const executeNodeAndTriggerOutputs = async (nodeId) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    // Set loading state
    updateNodeData(nodeId, { status: 'loading', error: null, response: null })

    // Extract all necessary data from node
    const { method, url, headers, body, parameters, outputSockets } = node.data
    
    // Parse data structures
    const parsedParams = JSON.parse(parameters || '[]')
    const parsedHeaders = JSON.parse(headers || '[]')
    let parsedBody = {}
    
    // Initialize final values
    let finalUrl = url
    let finalBody = {}
    
    // Parse body if it exists
    if (body) {
      try {
        parsedBody = JSON.parse(body)
      } catch (e) {
        console.warn('Failed to parse body, using as string', e)
        parsedBody = body
      }
    }
    
    // Process parameters
    const enabledParams = parsedParams.filter(p => p.enabled && p.key)
    
    if (method === 'GET') {
      // For GET requests, add parameters to URL
      const urlParams = new URLSearchParams()
      enabledParams.forEach(p => {
        if (p.value !== undefined && p.value !== null && p.value !== '') {
          urlParams.append(p.key, p.value)
        }
      })
      if (urlParams.toString()) {
        finalUrl = `${url}?${urlParams.toString()}`
      }
    } else {
      // For POST/PUT/PATCH, merge parameters into body
      finalBody = { ...parsedBody }
      enabledParams.forEach(p => {
        if (p.value !== undefined && p.value !== null) {
          finalBody[p.key] = p.value
        }
      })
    }

    // Build request configuration
    const requestConfig = {
      method,
      url: finalUrl,
      headers: parsedHeaders, // Pass headers array directly - useHttpRequest will convert it
      body: method !== 'GET' ? JSON.stringify(finalBody) : undefined
    }

    try {
      // Execute the request
      const response = await executeRequest(requestConfig)
      updateNodeData(nodeId, { status: 'success', response: response, error: null })

      // Check for outgoing connections
      const outgoingConnections = connections.filter(c => c.from === nodeId)
      if (outgoingConnections.length === 0) return

      // Parse output sockets
      const parsedOutputSockets = JSON.parse(outputSockets || '[]')

      // Process each outgoing connection
      for (const conn of outgoingConnections) {
        const targetNode = nodes.find(n => n.id === conn.to)
        const sourceSocket = parsedOutputSockets.find(s => s.id === conn.fromSocket)

        if (!targetNode || !sourceSocket || !sourceSocket.enabled) continue

        // Extract value from response using the socket's path
        const valueToTransfer = getByPath(response.data, sourceSocket.path)

        if (valueToTransfer !== undefined) {
          // Update target node's parameter with the transferred value
          const targetParams = JSON.parse(targetNode.data.parameters || '[]')
          const updatedParams = targetParams.map(p =>
            p.id === conn.toSocket ? { ...p, value: valueToTransfer } : p
          )
          updateNodeData(conn.to, { parameters: JSON.stringify(updatedParams) })
          
          // Execute next node in chain after a short delay
          setTimeout(() => executeNodeAndTriggerOutputs(conn.to), 100)
        }
      }
    } catch (error) {
      console.error(`Execution failed for node ${nodeId}:`, error)
      updateNodeData(nodeId, { status: 'error', error: error, response: error.response })
    }
  }

  const updateNodeData = (nodeId, newData) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ))
  }

  // Delete connection function
  const deleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
    console.log('Connection deleted:', connectionId)
  }

  const handleNodeMouseDown = (e, nodeId) => {
    e.preventDefault()
    setSelectedNode(nodeId)
    setDragState({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      originalPosition: nodes.find(n => n.id === nodeId).position
    })
  }

  const handleMouseMove = (e) => {
    const { left, top } = containerRef.current.getBoundingClientRect()
    const canvasMouseX = (e.clientX - left) / viewState.scale - viewState.pan.x
    const canvasMouseY = (e.clientY - top) / viewState.scale - viewState.pan.y
    setMousePosition({ x: canvasMouseX, y: canvasMouseY })

    if (isPanning) {
      setViewState(prev => ({
        ...prev,
        pan: {
          x: prev.pan.x + e.movementX / prev.scale,
          y: prev.pan.y + e.movementY / prev.scale,
        }
      }))
      return
    }

    if (resizeState) {
      const deltaX = e.clientX - resizeState.startX
      const deltaY = e.clientY - resizeState.startY

      const newWidth = Math.max(300, resizeState.originalWidth + deltaX / viewState.scale)
      const newHeight = Math.max(200, resizeState.originalHeight + deltaY / viewState.scale)

      setNodes(prev => prev.map(node =>
        node.id === resizeState.nodeId
          ? {
            ...node,
            data: {
              ...node.data,
              width: newWidth,
              height: newHeight,
            }
          }
          : node
      ))
      return
    }

    if (dragState) {
      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY

      setNodes(prev => prev.map(node =>
        node.id === dragState.nodeId
          ? {
            ...node,
            position: {
              x: dragState.originalPosition.x + deltaX / viewState.scale,
              y: dragState.originalPosition.y + deltaY / viewState.scale
            }
          }
          : node
      ))
      return
    }

    if (connectionDrag) {
      setConnectionDrag(prev => ({
        ...prev,
        currentX: canvasMouseX,
        currentY: canvasMouseY
      }))
    }
  }

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false)
    }
    if (dragState) {
      setDragState(null)
    }
    if (resizeState) {
      setResizeState(null)
    }
    if (connectionDrag) {
      const targetElement = e.target
      // Only complete connection if dropping on a valid socket
      if (!targetElement.matches('.parameter-input-socket')) {
        setConnectionDrag(null) // Cancel drag if not on a socket
      }
    }
  }

  // Socket connection handlers
  const handleSocketMouseDown = (e, nodeId, socketId, socketType) => {
    e.stopPropagation()
    e.preventDefault()

    const { left, top } = containerRef.current.getBoundingClientRect()
    const canvasMouseX = (e.clientX - left) / viewState.scale - viewState.pan.x
    const canvasMouseY = (e.clientY - top) / viewState.scale - viewState.pan.y

    if (socketType === 'output') {
      const fromPos = getSocketPosition(nodeId, socketId, socketType)
      if (fromPos) {
        setConnectionDrag({
          fromNode: nodeId,
          fromSocket: socketId,
          startX: fromPos.x,
          startY: fromPos.y,
          currentX: canvasMouseX,
          currentY: canvasMouseY
        })
      }
    }
  }
  
  const handleSocketMouseUp = (e, nodeId, socketId, socketType) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (connectionDrag && socketType === 'input') {
      const toPos = getSocketPosition(nodeId, socketId, socketType)
      if (!toPos) return

      // Create new connection
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: connectionDrag.fromNode,
        to: nodeId,
        fromSocket: connectionDrag.fromSocket,
        toSocket: socketId
      }
      
      // Check if connection already exists
      const existingConnection = connections.find(conn => 
        conn.from === newConnection.from && 
        conn.to === newConnection.to &&
        conn.fromSocket === newConnection.fromSocket &&
        conn.toSocket === newConnection.toSocket
      )
      
      if (!existingConnection) {
        setConnections(prev => [...prev, newConnection])

        // Update the target node's parameter to mark it as connected
        setNodes(prevNodes => prevNodes.map(node => {
          if (node.id === nodeId) { // This is the `to` node
            try {
              const parameters = JSON.parse(node.data.parameters || '[]')
              const updatedParameters = parameters.map(p => 
                p.id === socketId ? { ...p, hasConnection: true } : p
              )
              return { 
                ...node, 
                data: { ...node.data, parameters: JSON.stringify(updatedParameters) } 
              }
            } catch (e) {
              console.error("Failed to update parameter connection status", e)
              return node
            }
          }
          return node
        }))
      } else {
        console.log('❌ Connection already exists:', existingConnection)
      }
    }
    
    setConnectionDrag(null)
    setIsPanning(false)
  }
  
  const handleSocketMouseEnter = (e, nodeId, socketId, socketType) => {
    if (connectionDrag && socketType === 'input') {
      // Visual feedback for valid drop target - only background color change!
      e.target.style.background = '#28a745'
    }
    // Remove all other hover effects
  }
  
  const handleSocketMouseLeave = (e) => {
    // Reset only drag feedback
    if (connectionDrag && e.target.classList.contains('parameter-input-socket')) {
      e.target.style.background = '#007bff'
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const { left, top } = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - left
    const mouseY = e.clientY - top

    const scaleAmount = -e.deltaY * 0.001
    const newScale = Math.min(Math.max(0.2, viewState.scale + scaleAmount), 2)

    const mouseWorldX = (mouseX - viewState.pan.x * viewState.scale) / viewState.scale
    const mouseWorldY = (mouseY - viewState.pan.y * viewState.scale) / viewState.scale

    const newPanX = (mouseX - mouseWorldX * newScale) / newScale
    const newPanY = (mouseY - mouseWorldY * newScale) / newScale

    setViewState({
      scale: newScale,
      pan: { x: newPanX, y: newPanY },
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [viewState]) // Re-bind if viewState changes

  useEffect(() => {
    // This effect handles all global mouse movements for panning, dragging, and connecting
    if (isPanning || dragState || resizeState || connectionDrag) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isPanning, dragState, resizeState, connectionDrag])

  // Helper function to get socket position
  const getSocketPosition = (nodeId, socketId, socketType) => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return null

    const socketElementId = `socket-${socketType}-${nodeId}-${socketId}`
    const socketElement = document.getElementById(socketElementId)
    if (!socketElement) return null

    const socketRect = socketElement.getBoundingClientRect()
    
    // Position relative to the main container (which is the SVG coordinate space)
    const x = socketRect.left + socketRect.width / 2 - containerRect.left
    const y = socketRect.top + socketRect.height / 2 - containerRect.top

    return { x, y }
  }

  const renderConnection = (connection) => {
    const fromNode = nodes.find(n => n.id === connection.from)
    const toNode = nodes.find(n => n.id === connection.to)
    
    if (!fromNode || !toNode) {
      return null
    }

    // Get exact socket positions
    const fromPos = getSocketPosition(connection.from, connection.fromSocket, 'output')
    const toPos = getSocketPosition(connection.to, connection.toSocket, 'input')
    
    if (!fromPos || !toPos) {
      return null
    }

    const fromX = fromPos.x
    const fromY = fromPos.y
    const toX = toPos.x
    const toY = toPos.y

    // Calculate control points for smooth curve
    const controlOffset = Math.max(80, Math.abs(fromX - toX) / 3)
    const fromControlX = fromX + controlOffset
    const toControlX = toX - controlOffset
    
    // Calculate midpoint for delete button
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    
    
    return (
      <svg 
        key={connection.id}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* Connection path */}
        <path
          d={`M ${fromX} ${fromY} C ${fromControlX} ${fromY}, ${toControlX} ${toY}, ${toX} ${toY}`}
          stroke="#4a90e2"
          strokeWidth={3}
          fill="none"
          opacity={0.8}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3))'
          }}
        />
        
        {/* Invisible wider path for easier clicking */}
        <path
          d={`M ${fromX} ${fromY} C ${fromControlX} ${fromY}, ${toControlX} ${toY}, ${toX} ${toY}`}
          stroke="transparent"
          strokeWidth={12}
          fill="none"
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation()
            deleteConnection(connection.id)
          }}
          onMouseEnter={(e) => {
            // Highlight the connection on hover
            const visiblePath = e.target.parentElement.querySelector('path[stroke="#4a90e2"]')
            const deleteBtn = e.target.parentElement.querySelector('.connection-delete-btn')
            if (visiblePath) {
              visiblePath.setAttribute('stroke', '#ff4757')
              visiblePath.setAttribute('strokeWidth', '4')
            }
            if (deleteBtn) {
              deleteBtn.style.opacity = '1'
            }
          }}
          onMouseLeave={(e) => {
            // Reset connection appearance
            const visiblePath = e.target.parentElement.querySelector('path[stroke="#ff4757"]')
            const deleteBtn = e.target.parentElement.querySelector('.connection-delete-btn')
            if (visiblePath) {
              visiblePath.setAttribute('stroke', '#4a90e2')
              visiblePath.setAttribute('strokeWidth', '3')
            }
            if (deleteBtn) {
              deleteBtn.style.opacity = '0'
            }
          }}
        />
        
        
        {/* Delete button on hover */}
        <g className="connection-delete-btn" style={{ opacity: 0, transition: 'opacity 0.2s ease' }}>
          <circle
            cx={midX}
            cy={midY}
            r="10"
            fill="#ff4757"
            style={{ pointerEvents: 'all', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation()
              deleteConnection(connection.id)
            }}
          />
          <text
            x={midX}
            y={midY + 2}
            fontSize="14"
            fill="white"
            textAnchor="middle"
            style={{ pointerEvents: 'none', fontWeight: 'bold' }}
          >
            ×
          </text>
        </g>
      </svg>
    )
  }

  const handleNodeResizeStart = (e, nodeId) => {
    e.preventDefault()
    e.stopPropagation()

    const nodeElement = document.getElementById(`node-${nodeId}`)
    if (!nodeElement) return

    const cardElement = nodeElement.querySelector('.card')
    if (!cardElement) return

    const cardRect = cardElement.getBoundingClientRect()

    setResizeState({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      originalWidth: cardRect.width / viewState.scale,
      originalHeight: cardRect.height / viewState.scale,
    })
  }

  // Render component by type
  const renderNodeComponent = (node) => {
    const commonProps = {
      data: node.data,
      nodeId: node.id,
      onHeaderMouseDown: (e) => handleNodeMouseDown(e, node.id),
      onSocketMouseDown: handleSocketMouseDown,
      onSocketMouseUp: handleSocketMouseUp,
      onSocketMouseEnter: handleSocketMouseEnter,
      onSocketMouseLeave: handleSocketMouseLeave,
      onDataChange: (key, value) => updateNodeData(node.id, { [key]: value }),
      onResizeStart: handleNodeResizeStart,
      onExecute: () => executeFlow(node.id)
    }

    switch (node.type) {
      case 'HttpApi':
        return <HttpApiComponentRefactored {...commonProps} />
      default:
        return <div>Unknown node type: {node.type}</div>
    }
  }


  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Node editor container */}
      <div
        ref={containerRef}
        style={{
          height: '100%',
          width: '100%',
          background: '#f0f2f5',
          backgroundImage: 'radial-gradient(#d7dbe0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'default'
        }}
        onMouseDown={(e) => {
          if (e.button === 1 || e.altKey) { // Middle mouse or Alt+Click
            e.preventDefault()
            e.stopPropagation()
            setIsPanning(true)
          }
        }}
      >
        <div 
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${viewState.scale}) translate(${viewState.pan.x}px, ${viewState.pan.y}px)`,
            transformOrigin: '0 0'
          }}
        >
          {/* Render nodes */}
          {nodes.map(node => {
            return (
              <div
                key={node.id}
                id={`node-${node.id}`}
                className={`node-container ${dragState?.nodeId === node.id ? 'dragging' : ''}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  zIndex: selectedNode === node.id ? 10 : 2
                }}
              >
                {renderNodeComponent(node)}
              </div>
            )
          })}
        </div>

        {/* SVG Layer for connections */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {/* Render connections */}
          {connections.map(renderConnection)}

          {/* Render temporary connection while dragging */}
          {connectionDrag && (
            <>
              <path
                d={`M ${connectionDrag.startX} ${connectionDrag.startY} C ${connectionDrag.startX + 50} ${connectionDrag.startY}, ${connectionDrag.currentX - 50} ${connectionDrag.currentY}, ${connectionDrag.currentX} ${connectionDrag.currentY}`}
                stroke="#4a90e2"
                strokeWidth={3}
                fill="none"
                strokeDasharray="5,5"
                opacity={0.8}
              />
              <circle
                cx={connectionDrag.currentX}
                cy={connectionDrag.currentY}
                r={6}
                fill="#4a90e2"
                opacity={0.8}
              />
            </>
          )}
        </svg>
      </div>
      
      {/* Bootstrap Floating toolbar */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000
      }}>
        <div className="btn-group" role="group">
          <button
            className="btn btn-primary btn-sm"
            onClick={addHttpApiNode}
          >
            <i className="bi bi-globe"></i> Add HTTP Node
          </button>
          
          <button
            className="btn btn-warning btn-sm fw-bold"
            onClick={executeFlow}
          >
            <i className="bi bi-play-fill"></i> Execute Flow
          </button>
        </div>
      </div>
      
      {/* Bootstrap Info panel */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        zIndex: 1000
      }}>
        <div className="d-flex flex-column align-items-end gap-2">
          <div className="badge bg-dark">
            <i className="bi bi-diagram-3"></i> Nodes: {nodes.length} | 
            <i className="bi bi-arrow-left-right"></i> Connections: {connections.length}
          </div>
          
          {/* Instructions panel */}
          <div className="card" style={{ width: '300px', fontSize: '11px' }}>
            <div className="card-header py-1 px-2 bg-info text-white">
              <i className="bi bi-info-circle"></i> <strong>How to Connect Nodes</strong>
            </div>
            <div className="card-body p-2">
              <div className="mb-2">
                <strong>1. Add Parameters:</strong> Go to Params tab, add input parameters
              </div>
              <div className="mb-2">
                <strong>2. Execute Request:</strong> Click Send to get response
              </div>
              <div className="mb-2">
                <strong>3. Create Outputs:</strong> Go to Outputs tab, add output sockets
              </div>
              <div className="mb-2">
                <strong>4. Connect:</strong> Drag <span className="text-primary">blue output</span> to <span className="text-success">green input</span>
              </div>
              <div className="text-muted mt-2">
                <i className="bi bi-lightbulb"></i> Sockets appear only after adding params/outputs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NodeEditor