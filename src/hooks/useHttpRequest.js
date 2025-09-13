import { useCallback } from 'react'
import axios from 'axios'
import { REQUEST_STATUS, METHODS_WITH_BODY } from '../utils/constants.js'
import { headersArrayToObject, extractDataByPath } from '../utils/helpers.js'

/**
 * Hook for handling HTTP requests and response processing
 */
export const useHttpRequest = () => {
  
  const executeRequest = useCallback(async (requestConfig, callbacks = {}) => {
    const { 
      onStart, 
      onSuccess, 
      onError, 
      onComplete 
    } = callbacks

    try {
      // Notify request start
      onStart?.()

      const { method, url, headers, body } = requestConfig
      
      if (!url) {
        throw new Error('URL is required')
      }

      // Build axios config
      const config = {
        method: method.toLowerCase(),
        url,
        headers: headersArrayToObject(headers),
        timeout: requestConfig.timeout || 5000
      }

      // Add body for POST/PUT/PATCH requests
      if (METHODS_WITH_BODY.includes(method.toUpperCase()) && body) {
        try {
          config.data = JSON.parse(body)
        } catch {
          config.data = body
        }
      }

      console.log('Executing request:', config)
      
      // Make the request
      const response = await axios(config)
      
      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      }

      onSuccess?.(responseData)
      return responseData

    } catch (error) {
      console.error('Request error:', error)
      
      const errorData = {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : null
      }

      onError?.(errorData)
      
      // If there's a response in the error, return it for processing
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        }
      }
      
      throw errorData
    } finally {
      onComplete?.()
    }
  }, [])

  const processResponse = useCallback((responseData, processingConfig) => {
    const { extractPath, expectedStatus, validation } = processingConfig
    
    try {
      // Extract data if path is provided
      let extractedData = responseData.data
      if (extractPath) {
        extractedData = extractDataByPath(responseData.data, extractPath)
      }

      // Validate status code
      const statusValid = !expectedStatus || responseData.status === expectedStatus

      // Run custom validation if provided
      let customValid = true
      if (validation) {
        try {
          const validationFunction = new Function(
            'data', 
            'status', 
            'headers', 
            'response',
            `return ${validation}`
          )
          customValid = validationFunction(
            extractedData, 
            responseData.status, 
            responseData.headers,
            responseData.data
          )
        } catch (error) {
          console.warn('Validation error:', error)
          customValid = false
        }
      }

      const isValid = statusValid && customValid

      return {
        extractedData,
        isValid,
        statusValid,
        customValid
      }
    } catch (error) {
      console.error('Response processing error:', error)
      return {
        extractedData: null,
        isValid: false,
        statusValid: false,
        customValid: false
      }
    }
  }, [])

  return {
    executeRequest,
    processResponse
  }
}