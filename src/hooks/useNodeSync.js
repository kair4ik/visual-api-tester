import { useEffect, useCallback, useRef } from 'react'
import { headersArrayToObject } from '../utils/helpers.js'

/**
 * Hook for synchronizing node state with external data
 */
export const useNodeSync = (state, actions, data, onDataChange) => {
  const initializedRef = useRef(false)
  const lastSyncedDataRef = useRef({})
  
  // Initialize state from external data only once
  useEffect(() => {
    if (data && actions.initFromData && !initializedRef.current) {
      actions.initFromData(data)
      initializedRef.current = true
      lastSyncedDataRef.current = { ...data }
    }
  }, [])

  // Синхронизация outputSockets обратно в NodeEditor
  useEffect(() => {
    if (onDataChange && initializedRef.current) {
      const currentOutputSockets = JSON.stringify(state.outputSockets || [])
      if (lastSyncedDataRef.current.outputSockets !== currentOutputSockets) {
        console.log('🔄 Syncing outputSockets back to NodeEditor:', state.outputSockets)
        onDataChange('outputSockets', currentOutputSockets)
        lastSyncedDataRef.current.outputSockets = currentOutputSockets
      }
    }
  }, [state.outputSockets, onDataChange])

  // Синхронизация parameters обратно в NodeEditor
  useEffect(() => {
    if (onDataChange && initializedRef.current) {
      const currentParameters = JSON.stringify(state.parameters || [])
      if (lastSyncedDataRef.current.parameters !== currentParameters) {
        console.log('🔄 Syncing parameters back to NodeEditor:', state.parameters)
        onDataChange('parameters', currentParameters)
        lastSyncedDataRef.current.parameters = currentParameters
      }
    }
  }, [state.parameters, onDataChange])

  // Sync response data from external data to internal state
  useEffect(() => {
    if (data && initializedRef.current) {
      // Check if response changed externally
      if (data.response !== lastSyncedDataRef.current.response) {
        console.log('📥 Syncing response from NodeEditor to component:', data.response)
        actions.setResponse(data.response)
        lastSyncedDataRef.current.response = data.response
        // Auto-switch to Response tab when we get a response
        if (data.response) {
          actions.setField('activeTab', 'response')
        }
      }
      
      // Check if status changed externally
      if (data.status !== lastSyncedDataRef.current.status) {
        console.log('📥 Syncing status from NodeEditor to component:', data.status)
        actions.setRequestStatus(data.status)
        lastSyncedDataRef.current.status = data.status
        // Auto-switch to Response tab when status changes to loading, success, or error
        if (data.status === 'loading' || data.status === 'success' || data.status === 'error') {
          actions.setField('activeTab', 'response')
        }
      }
      
      // Check if error changed externally
      if (data.error !== lastSyncedDataRef.current.error) {
        console.log('📥 Syncing error from NodeEditor to component:', data.error)
        actions.setError(data.error)
        lastSyncedDataRef.current.error = data.error
        // Auto-switch to Response tab when we get an error
        if (data.error) {
          actions.setField('activeTab', 'response')
        }
      }
    }
  }, [data.response, data.status, data.error, actions])

  const updateNodeData = useCallback((key, value) => {
    if (onDataChange) {
      onDataChange(key, value)
    }
  }, [onDataChange])

  return {
    updateNodeData
  }
}
