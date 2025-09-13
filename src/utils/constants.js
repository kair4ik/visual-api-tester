// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
}

export const METHODS_WITH_BODY = [
  HTTP_METHODS.POST,
  HTTP_METHODS.PUT,
  HTTP_METHODS.PATCH
]

// Default values
export const DEFAULT_VALUES = {
  method: HTTP_METHODS.GET,
  url: '',
  headers: '{"Content-Type": "application/json"}',
  body: '',
  extractPath: '',
  expectedStatus: 200,
  validation: '',
  timeout: 5000
}

// Status types
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Tab names
export const TABS = {
  PARAMS: 'params',
  HEADERS: 'headers',
  BODY: 'body',
  VALIDATION: 'validation',
  OUTPUTS: 'outputs',
  RESPONSE: 'response'
}

// Socket types
export const SOCKET_TYPES = {
  INPUT: 'input',
  OUTPUT: 'output'
}

// Data types for parameters and outputs
export const DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array'
}

// Type colors for visual representation
export const TYPE_COLORS = {
  [DATA_TYPES.STRING]: '#28a745',
  [DATA_TYPES.NUMBER]: '#007bff',
  [DATA_TYPES.BOOLEAN]: '#ffc107',
  [DATA_TYPES.ARRAY]: '#6f42c1',
  [DATA_TYPES.OBJECT]: '#fd7e14'
}

// Node dimensions
export const NODE_DIMENSIONS = {
  WIDTH: 450,
  MIN_HEIGHT: 600,
  HEADER_HEIGHT: 120,
  SOCKET_SPACING: 28,
  SOCKET_OFFSET: 200
}