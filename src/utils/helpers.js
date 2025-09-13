import { TYPE_COLORS, DATA_TYPES } from './constants.js'

/**
 * Safely parse JSON string
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed JSON or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString || JSON.stringify(fallback))
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

/**
 * Generate unique ID
 * @param {string} prefix - Prefix for ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Extract data by path from object
 * @param {any} data - Object to extract from
 * @param {string} path - Path string (e.g., 'data.users[0].name')
 * @returns {any} Extracted data
 */
export const extractDataByPath = (data, path) => {
  if (!path || !data) return data

  const parts = path.split('.')
  let current = data

  for (const part of parts) {
    if (part.includes('[') && part.includes(']')) {
      // Array access like "items[0]"
      const [prop, indexStr] = part.split('[')
      const index = parseInt(indexStr.replace(']', ''), 10)
      current = current?.[prop]?.[index]
    } else {
      current = current?.[part]
    }

    if (current === undefined || current === null) {
      break
    }
  }

  return current
}

/**
 * Get color for data type
 * @param {string} type - Data type
 * @returns {string} Color hex code
 */
export const getTypeColor = (type) => {
  return TYPE_COLORS[type] || TYPE_COLORS[DATA_TYPES.STRING]
}

/**
 * Convert headers array to object
 * @param {Array} headerArray - Array of header objects
 * @returns {Object} Headers object
 */
export const headersArrayToObject = (headerArray) => {
  return headerArray.reduce((obj, header) => {
    if (header.enabled && header.key && header.value) {
      obj[header.key] = header.value
    }
    return obj
  }, {})
}

/**
 * Convert headers object to array
 * @param {Object} headerObj - Headers object
 * @returns {Array} Array of header objects
 */
export const headersObjectToArray = (headerObj) => {
  return Object.entries(headerObj).map(([key, value]) => ({
    key,
    value,
    enabled: true,
    id: generateId('header')
  }))
}

/**
 * Get method color class
 * @param {string} method - HTTP method
 * @returns {string} Bootstrap color class
 */
export const getMethodColorClass = (method) => {
  const colorMap = {
    GET: 'text-success',
    POST: 'text-warning',
    PUT: 'text-info',
    DELETE: 'text-danger',
    PATCH: 'text-secondary'
  }
  return colorMap[method] || 'text-primary'
}

/**
 * Get response status color class
 * @param {number} status - HTTP status code
 * @returns {string} Bootstrap color class
 */
export const getStatusColorClass = (status) => {
  if (status < 300) return 'success'
  if (status < 400) return 'warning'
  return 'danger'
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Get available fields from response data for output sockets
 * @param {Object} responseData - Response data
 * @returns {Array} Array of field objects
 */
export const getAvailableFields = (responseData) => {
  if (!responseData) return []

  const fields = []
  
  const extractFields = (obj, prefix = '') => {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        fields.push({
          path: prefix,
          name: prefix.split('.').pop() || 'array',
          type: DATA_TYPES.ARRAY,
          value: `Array(${obj.length})`,
          selectable: true
        })
        
        // Add first few items
        obj.slice(0, 3).forEach((item, index) => {
          const itemPath = `${prefix}[${index}]`
          if (item && typeof item === 'object') {
            extractFields(item, itemPath)
          } else {
            fields.push({
              path: itemPath,
              name: `[${index}]`,
              type: typeof item,
              value: String(item).substring(0, 50),
              selectable: true
            })
          }
        })
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const fullPath = prefix ? `${prefix}.${key}` : key
          
          if (value && typeof value === 'object') {
            extractFields(value, fullPath)
          } else {
            fields.push({
              path: fullPath,
              name: key,
              type: typeof value,
              value: String(value).substring(0, 50),
              selectable: true
            })
          }
        })
      }
    }
  }

  // Add standard response fields
  if (responseData.status) {
    fields.push({
      path: 'status',
      name: 'status',
      type: DATA_TYPES.NUMBER,
      value: String(responseData.status),
      selectable: true
    })
  }

  if (responseData.statusText) {
    fields.push({
      path: 'statusText',
      name: 'statusText',
      type: DATA_TYPES.STRING,
      value: responseData.statusText,
      selectable: true
    })
  }

  if (responseData.headers) {
    Object.entries(responseData.headers).forEach(([key, value]) => {
      fields.push({
        path: `headers.${key}`,
        name: `headers.${key}`,
        type: DATA_TYPES.STRING,
        value: String(value).substring(0, 50),
        selectable: true
      })
    })
  }

  if (responseData.data) {
    extractFields(responseData.data, 'data')
  }

  return fields
}