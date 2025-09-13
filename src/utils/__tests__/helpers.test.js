import { getAvailableFields, getTypeColor, extractValueByPath, generateId } from '../helpers'

describe('helpers', () => {
  describe('getAvailableFields', () => {
    test('should extract simple object fields', () => {
      const response = {
        data: {
          id: 1,
          name: 'John',
          email: 'john@example.com'
        }
      }

      const fields = getAvailableFields(response)
      
      expect(fields).toContainEqual({
        name: 'id',
        path: 'data.id',
        type: 'number',
        value: 1
      })
      
      expect(fields).toContainEqual({
        name: 'name',
        path: 'data.name',
        type: 'string',
        value: 'John'
      })
    })

    test('should extract nested object fields', () => {
      const response = {
        user: {
          profile: {
            firstName: 'John',
            address: {
              city: 'New York',
              zipCode: 10001
            }
          }
        }
      }

      const fields = getAvailableFields(response)
      
      expect(fields).toContainEqual({
        name: 'firstName',
        path: 'user.profile.firstName',
        type: 'string',
        value: 'John'
      })
      
      expect(fields).toContainEqual({
        name: 'city',
        path: 'user.profile.address.city',
        type: 'string',
        value: 'New York'
      })
    })

    test('should extract array fields', () => {
      const response = {
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      }

      const fields = getAvailableFields(response)
      
      expect(fields).toContainEqual({
        name: 'id',
        path: 'users[0].id',
        type: 'number',
        value: 1
      })
      
      expect(fields).toContainEqual({
        name: 'name',
        path: 'users[0].name',
        type: 'string',
        value: 'John'
      })
    })

    test('should handle null response', () => {
      const fields = getAvailableFields(null)
      expect(fields).toEqual([])
    })

    test('should handle primitive response', () => {
      const fields = getAvailableFields('simple string')
      expect(fields).toEqual([{
        name: 'value',
        path: '',
        type: 'string',
        value: 'simple string'
      }])
    })
  })

  describe('getTypeColor', () => {
    test('should return correct colors for different types', () => {
      expect(getTypeColor('string')).toBe('#28a745')
      expect(getTypeColor('number')).toBe('#007bff')
      expect(getTypeColor('boolean')).toBe('#ffc107')
      expect(getTypeColor('object')).toBe('#6f42c1')
      expect(getTypeColor('array')).toBe('#fd7e14')
      expect(getTypeColor('unknown')).toBe('#6c757d')
    })

    test('should handle undefined type', () => {
      expect(getTypeColor(undefined)).toBe('#6c757d')
    })

    test('should be case insensitive', () => {
      expect(getTypeColor('STRING')).toBe('#28a745')
      expect(getTypeColor('Number')).toBe('#007bff')
    })
  })

  describe('extractValueByPath', () => {
    const testData = {
      user: {
        id: 123,
        profile: {
          name: 'John Doe',
          settings: {
            theme: 'dark'
          }
        },
        roles: ['admin', 'user']
      }
    }

    test('should extract simple property', () => {
      const result = extractValueByPath(testData, 'user.id')
      expect(result).toBe(123)
    })

    test('should extract nested property', () => {
      const result = extractValueByPath(testData, 'user.profile.name')
      expect(result).toBe('John Doe')
    })

    test('should extract deep nested property', () => {
      const result = extractValueByPath(testData, 'user.profile.settings.theme')
      expect(result).toBe('dark')
    })

    test('should extract array element', () => {
      const result = extractValueByPath(testData, 'user.roles[0]')
      expect(result).toBe('admin')
    })

    test('should return undefined for invalid path', () => {
      const result = extractValueByPath(testData, 'user.nonexistent.property')
      expect(result).toBeUndefined()
    })

    test('should return undefined for invalid array index', () => {
      const result = extractValueByPath(testData, 'user.roles[10]')
      expect(result).toBeUndefined()
    })

    test('should handle empty path', () => {
      const result = extractValueByPath(testData, '')
      expect(result).toBe(testData)
    })

    test('should handle null data', () => {
      const result = extractValueByPath(null, 'some.path')
      expect(result).toBeUndefined()
    })
  })

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })

    test('should generate IDs with correct prefix', () => {
      const id = generateId('test')
      expect(id).toMatch(/^test_\d+$/)
    })

    test('should generate default IDs without prefix', () => {
      const id = generateId()
      expect(id).toMatch(/^\d+$/)
    })

    test('should generate multiple unique IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }
      
      // All IDs should be unique
      expect(ids.size).toBe(100)
    })
  })
})