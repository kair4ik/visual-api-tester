import { renderHook, act } from '@testing-library/react'
import { useNodeState } from '../useNodeState'
import { TABS, REQUEST_STATUS } from '../../utils/constants'

// Mock constants in case they're not available
const mockTabs = TABS || {
  PARAMS: 'params',
  HEADERS: 'headers', 
  VALIDATION: 'validation',
  OUTPUTS: 'outputs',
  RESPONSE: 'response'
}

const mockRequestStatus = REQUEST_STATUS || {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

describe('useNodeState', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useNodeState())
    const [state, actions] = result.current

    expect(state.method).toBe('GET')
    expect(state.url).toBe('')
    expect(state.activeTab).toBe(mockTabs.PARAMS)
    expect(state.status).toBe(mockRequestStatus.IDLE)
    expect(state.parameters).toEqual([])
    expect(state.headers).toEqual([])
    expect(state.outputSockets).toEqual([])
  })

  test('should update single field', () => {
    const { result } = renderHook(() => useNodeState())
    
    act(() => {
      const [, actions] = result.current
      actions.setField('url', 'https://api.example.com')
    })

    const [state] = result.current
    expect(state.url).toBe('https://api.example.com')
  })

  test('should update multiple fields', () => {
    const { result } = renderHook(() => useNodeState())
    
    act(() => {
      const [, actions] = result.current
      actions.setMultipleFields({
        url: 'https://api.example.com',
        method: 'POST'
      })
    })

    const [state] = result.current
    expect(state.url).toBe('https://api.example.com')
    expect(state.method).toBe('POST')
  })

  test('should add parameter', () => {
    const { result } = renderHook(() => useNodeState())
    
    act(() => {
      const [, actions] = result.current
      actions.addParameter()
    })

    const [state] = result.current
    expect(state.parameters).toHaveLength(1)
    expect(state.parameters[0]).toMatchObject({
      key: '',
      value: '',
      type: 'string',
      enabled: true,
      hasConnection: false
    })
    expect(state.parameters[0].id).toBeDefined()
  })

  test('should remove parameter', () => {
    const { result } = renderHook(() => useNodeState())
    
    // Add two parameters
    act(() => {
      const [, actions] = result.current
      actions.addParameter()
      actions.addParameter()
    })

    // Remove the first one
    act(() => {
      const [, actions] = result.current
      actions.removeParameter(0)
    })

    const [state] = result.current
    expect(state.parameters).toHaveLength(1)
  })

  test('should update parameter', () => {
    const { result } = renderHook(() => useNodeState())
    
    // Add parameter
    act(() => {
      const [, actions] = result.current
      actions.addParameter()
    })

    // Update parameter
    act(() => {
      const [, actions] = result.current
      actions.updateParameter(0, 'key', 'username')
    })

    const [state] = result.current
    expect(state.parameters[0].key).toBe('username')
  })

  test('should add header', () => {
    const { result } = renderHook(() => useNodeState())
    
    act(() => {
      const [, actions] = result.current
      actions.addHeader()
    })

    const [state] = result.current
    expect(state.headers).toHaveLength(1)
    expect(state.headers[0]).toMatchObject({
      key: '',
      value: '',
      enabled: true
    })
  })

  test('should add output socket', () => {
    const { result } = renderHook(() => useNodeState())
    
    act(() => {
      const [, actions] = result.current
      actions.addOutputSocket()
    })

    const [state] = result.current
    expect(state.outputSockets).toHaveLength(1)
    expect(state.outputSockets[0]).toMatchObject({
      name: '',
      path: '',
      type: 'string',
      enabled: true
    })
  })

  test('should set request status', () => {
    const { result } = renderHook(() => useNodeState())
    
    act(() => {
      const [, actions] = result.current
      actions.setRequestStatus(mockRequestStatus.LOADING)
    })

    const [state] = result.current
    expect(state.status).toBe(mockRequestStatus.LOADING)
  })

  test('should set response', () => {
    const { result } = renderHook(() => useNodeState())
    const mockResponse = { data: { id: 1, name: 'Test' } }
    
    act(() => {
      const [, actions] = result.current
      actions.setResponse(mockResponse)
    })

    const [state] = result.current
    expect(state.response).toEqual(mockResponse)
    expect(state.status).toBe(mockRequestStatus.SUCCESS)
  })

  test('should set error', () => {
    const { result } = renderHook(() => useNodeState())
    const mockError = 'Network error'
    
    act(() => {
      const [, actions] = result.current
      actions.setError(mockError)
    })

    const [state] = result.current
    expect(state.error).toBe(mockError)
    expect(state.status).toBe(mockRequestStatus.ERROR)
  })

  test('should clear response', () => {
    const { result } = renderHook(() => useNodeState())
    
    // Set response first
    act(() => {
      const [, actions] = result.current
      actions.setResponse({ data: 'test' })
    })

    // Clear response
    act(() => {
      const [, actions] = result.current
      actions.clearResponse()
    })

    const [state] = result.current
    expect(state.response).toBeNull()
    expect(state.error).toBeNull()
    expect(state.extractedData).toBeNull()
    expect(state.isValid).toBeUndefined()
    expect(state.status).toBe(mockRequestStatus.IDLE)
  })
})