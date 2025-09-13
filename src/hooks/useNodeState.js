import { useReducer, useCallback } from 'react'
import { DEFAULT_VALUES, REQUEST_STATUS, TABS } from '../utils/constants.js'
import { safeJsonParse, generateId, headersObjectToArray } from '../utils/helpers.js'

// Action types
const ACTION_TYPES = {
  SET_FIELD: 'SET_FIELD',
  SET_MULTIPLE_FIELDS: 'SET_MULTIPLE_FIELDS',
  ADD_HEADER: 'ADD_HEADER',
  REMOVE_HEADER: 'REMOVE_HEADER',
  UPDATE_HEADER: 'UPDATE_HEADER',
  ADD_PARAMETER: 'ADD_PARAMETER',
  REMOVE_PARAMETER: 'REMOVE_PARAMETER',
  UPDATE_PARAMETER: 'UPDATE_PARAMETER',
  ADD_OUTPUT_SOCKET: 'ADD_OUTPUT_SOCKET',
  REMOVE_OUTPUT_SOCKET: 'REMOVE_OUTPUT_SOCKET',
  UPDATE_OUTPUT_SOCKET: 'UPDATE_OUTPUT_SOCKET',
  SET_REQUEST_STATUS: 'SET_REQUEST_STATUS',
  SET_RESPONSE: 'SET_RESPONSE',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE',
  INIT_FROM_DATA: 'INIT_FROM_DATA'
}

// Initial state
const createInitialState = () => ({
  // Basic request fields
  method: DEFAULT_VALUES.method,
  url: DEFAULT_VALUES.url,
  body: DEFAULT_VALUES.body,
  
  // Response handling
  extractPath: DEFAULT_VALUES.extractPath,
  expectedStatus: DEFAULT_VALUES.expectedStatus,
  validation: DEFAULT_VALUES.validation,
  
  // Arrays
  headers: [{ 
    id: generateId('header'), 
    key: 'Content-Type', 
    value: 'application/json', 
    enabled: true 
  }],
  parameters: [],
  outputSockets: [],
  
  // Status and response
  status: REQUEST_STATUS.IDLE,
  response: null,
  error: null,
  extractedData: null,
  isValid: false,
  fullResponse: null,
  
  // UI state
  activeTab: TABS.PARAMS,
  isLoading: false
})

// Reducer
const nodeReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_FIELD:
      return {
        ...state,
        [action.field]: action.value
      }

    case ACTION_TYPES.SET_MULTIPLE_FIELDS:
      return {
        ...state,
        ...action.fields
      }

    case ACTION_TYPES.ADD_HEADER:
      return {
        ...state,
        headers: [...state.headers, {
          id: generateId('header'),
          key: '',
          value: '',
          enabled: true
        }]
      }

    case ACTION_TYPES.REMOVE_HEADER:
      return {
        ...state,
        headers: state.headers.filter((_, index) => index !== action.index)
      }

    case ACTION_TYPES.UPDATE_HEADER:
      return {
        ...state,
        headers: state.headers.map((header, index) =>
          index === action.index
            ? { ...header, [action.field]: action.value }
            : header
        )
      }

    case ACTION_TYPES.ADD_PARAMETER:
      return {
        ...state,
        parameters: [...state.parameters, {
          id: generateId('param'),
          key: '',
          value: '',
          type: 'string',
          enabled: true,
          hasConnection: false
        }]
      }

    case ACTION_TYPES.REMOVE_PARAMETER:
      return {
        ...state,
        parameters: state.parameters.filter((_, index) => index !== action.index)
      }

    case ACTION_TYPES.UPDATE_PARAMETER:
      return {
        ...state,
        parameters: state.parameters.map((param, index) =>
          index === action.index
            ? { ...param, [action.field]: action.value }
            : param
        )
      }

    case ACTION_TYPES.ADD_OUTPUT_SOCKET:
      return {
        ...state,
        outputSockets: [...state.outputSockets, {
          id: generateId('output'),
          name: '',
          path: '',
          type: 'string',
          enabled: true
        }]
      }

    case ACTION_TYPES.REMOVE_OUTPUT_SOCKET:
      return {
        ...state,
        outputSockets: state.outputSockets.filter((_, index) => index !== action.index)
      }

    case ACTION_TYPES.UPDATE_OUTPUT_SOCKET:
      return {
        ...state,
        outputSockets: state.outputSockets.map((socket, index) =>
          index === action.index
            ? { ...socket, [action.field]: action.value }
            : socket
        )
      }

    case ACTION_TYPES.SET_REQUEST_STATUS:
      return {
        ...state,
        status: action.status,
        isLoading: action.status === REQUEST_STATUS.LOADING
      }

    case ACTION_TYPES.SET_RESPONSE:
      return {
        ...state,
        response: action.response,
        fullResponse: action.response,
        error: null,
        status: REQUEST_STATUS.SUCCESS,
        isLoading: false
      }

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.error,
        response: null,
        status: REQUEST_STATUS.ERROR,
        isLoading: false
      }

    case ACTION_TYPES.INIT_FROM_DATA:
      const { data } = action
      const headersObj = safeJsonParse(data?.headers, {})
      const parametersArray = safeJsonParse(data?.parameters, [])
      const outputSocketsArray = safeJsonParse(data?.outputSockets, [])

      return {
        ...state,
        method: data?.method || DEFAULT_VALUES.method,
        url: data?.url || DEFAULT_VALUES.url,
        body: data?.body || DEFAULT_VALUES.body,
        extractPath: data?.extractPath || DEFAULT_VALUES.extractPath,
        expectedStatus: data?.expectedStatus || DEFAULT_VALUES.expectedStatus,
        validation: data?.validation || DEFAULT_VALUES.validation,
        headers: Object.keys(headersObj).length > 0 
          ? headersObjectToArray(headersObj)
          : state.headers,
        parameters: parametersArray,
        outputSockets: outputSocketsArray,
        status: data?.status || REQUEST_STATUS.IDLE,
        response: data?.response || null,
        error: data?.error || null,
        extractedData: data?.extractedData || null,
        isValid: data?.isValid || false,
        fullResponse: data?.fullResponse || null
      }

    case ACTION_TYPES.RESET_STATE:
      return createInitialState()

    default:
      return state
  }
}

// Hook
export const useNodeState = (initialData = null) => {
  const [state, dispatch] = useReducer(nodeReducer, createInitialState())

  // Action creators
  const actions = {
    setField: useCallback((field, value) => {
      dispatch({ type: ACTION_TYPES.SET_FIELD, field, value })
    }, []),

    setMultipleFields: useCallback((fields) => {
      dispatch({ type: ACTION_TYPES.SET_MULTIPLE_FIELDS, fields })
    }, []),

    addHeader: useCallback(() => {
      dispatch({ type: ACTION_TYPES.ADD_HEADER })
    }, []),

    removeHeader: useCallback((index) => {
      dispatch({ type: ACTION_TYPES.REMOVE_HEADER, index })
    }, []),

    updateHeader: useCallback((index, field, value) => {
      dispatch({ type: ACTION_TYPES.UPDATE_HEADER, index, field, value })
    }, []),

    addParameter: useCallback(() => {
      dispatch({ type: ACTION_TYPES.ADD_PARAMETER })
    }, []),

    removeParameter: useCallback((index) => {
      dispatch({ type: ACTION_TYPES.REMOVE_PARAMETER, index })
    }, []),

    updateParameter: useCallback((index, field, value) => {
      dispatch({ type: ACTION_TYPES.UPDATE_PARAMETER, index, field, value })
    }, []),

    addOutputSocket: useCallback(() => {
      dispatch({ type: ACTION_TYPES.ADD_OUTPUT_SOCKET })
    }, []),

    removeOutputSocket: useCallback((index) => {
      dispatch({ type: ACTION_TYPES.REMOVE_OUTPUT_SOCKET, index })
    }, []),

    updateOutputSocket: useCallback((index, field, value) => {
      dispatch({ type: ACTION_TYPES.UPDATE_OUTPUT_SOCKET, index, field, value })
    }, []),

    setRequestStatus: useCallback((status) => {
      dispatch({ type: ACTION_TYPES.SET_REQUEST_STATUS, status })
    }, []),

    setResponse: useCallback((response) => {
      dispatch({ type: ACTION_TYPES.SET_RESPONSE, response })
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: ACTION_TYPES.SET_ERROR, error })
    }, []),

    initFromData: useCallback((data) => {
      dispatch({ type: ACTION_TYPES.INIT_FROM_DATA, data })
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: ACTION_TYPES.RESET_STATE })
    }, [])
  }

  return [state, actions]
}