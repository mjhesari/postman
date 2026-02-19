import { nanoid } from 'nanoid'
import type { Collection, HttpRequest, Folder } from '@/types'

// Postman Collection v2.1 format types
interface PostmanRequest {
  method: string
  header?: Array<{ key: string; value: string; disabled?: boolean }>
  url?: string | { 
    raw?: string
    host?: string[]
    path?: string[]
    query?: Array<{ key: string; value: string; disabled?: boolean }>
    variable?: Array<{ key: string; value: string }>
  }
  body?: {
    mode: string
    raw?: string
    urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>
    formdata?: Array<{ key: string; value: string; disabled?: boolean }>
  }
  auth?: {
    type: string
    bearer?: Array<{ key: string; value: string }>
    basic?: Array<{ key: string; value: string }>
    apikey?: Array<{ key: string; value: string }>
  }
}

interface PostmanItem {
  name: string
  request?: PostmanRequest | string
  item?: PostmanItem[]
}

interface PostmanCollection {
  info: {
    name: string
    description?: string
    schema: string
  }
  item: PostmanItem[]
}

// Convert Postman collection to our format
export function importPostmanCollection(postmanJson: PostmanCollection): Collection {
  const collection: Collection = {
    id: nanoid(),
    name: postmanJson.info.name,
    description: postmanJson.info.description || '',
    folders: [],
    requests: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  function processItems(postmanItems: PostmanItem[], parentId?: string): { 
    folders: Folder[], 
    requests: HttpRequest[] 
  } {
    const folders: Folder[] = []
    const requests: HttpRequest[] = []

    for (const item of postmanItems) {
      if (item.item) {
        // It's a folder
        const folderId = nanoid()
        const nestedItems = processItems(item.item, folderId)
        
        folders.push({
          id: folderId,
          name: item.name,
          parentId,
          requests: nestedItems.requests,
        })
        
        folders.push(...nestedItems.folders)
      } else {
        // It's a request
        const request = typeof item.request === 'string' 
          ? { method: 'GET', url: item.request }
          : item.request

        if (!request) continue

        // Parse URL and query parameters
        let url = ''
        const params: HttpRequest['params'] = []
        
        if (typeof request.url === 'string') {
          url = request.url
        } else if (request.url) {
          // Use raw URL if available
          url = request.url.raw || ''
          
          // Parse query parameters from Postman format
          if (request.url.query && request.url.query.length > 0) {
            params.push(...request.url.query.map((q) => ({
              id: nanoid(),
              key: q.key,
              value: q.value,
              enabled: !q.disabled,
            })))
          }
          
          // If no raw URL, construct from parts
          if (!url && request.url.host && request.url.path) {
            const host = Array.isArray(request.url.host) 
              ? request.url.host.join('.') 
              : request.url.host
            const path = Array.isArray(request.url.path) 
              ? '/' + request.url.path.join('/') 
              : request.url.path
            url = `${host}${path}`
          }
        }

        // Parse headers
        const headers = (request.header || []).map((h) => ({
          id: nanoid(),
          key: h.key,
          value: h.value,
          enabled: !h.disabled,
        }))

        // Parse body
        let bodyType: HttpRequest['body']['type'] = 'none'
        let bodyContent: string | any[] = ''

        if (request.body) {
          if (request.body.mode === 'raw') {
            bodyType = 'raw'
            bodyContent = request.body.raw || ''
            // Try to detect JSON
            try {
              JSON.parse(bodyContent as string)
              bodyType = 'json'
            } catch {
              // Not JSON, keep as raw
            }
          } else if (request.body.mode === 'urlencoded') {
            bodyType = 'x-www-form-urlencoded'
            bodyContent = (request.body.urlencoded || [])
              .map((p) => ({
                id: nanoid(),
                key: p.key,
                value: p.value,
                enabled: !p.disabled,
                type: 'text' as const,
              }))
          } else if (request.body.mode === 'formdata') {
            bodyType = 'form-data'
            bodyContent = (request.body.formdata || [])
              .map((p) => ({
                id: nanoid(),
                key: p.key,
                value: p.value,
                enabled: !p.disabled,
                type: 'text' as const,
              }))
          }
        }

        // Parse auth
        let authType: HttpRequest['auth']['type'] = 'none'
        const credentials: Record<string, string> = {}

        if (request.auth) {
          if (request.auth.type === 'bearer' && request.auth.bearer) {
            authType = 'bearer'
            const tokenField = request.auth.bearer.find((f) => f.key === 'token')
            if (tokenField) credentials.token = tokenField.value
          } else if (request.auth.type === 'basic' && request.auth.basic) {
            authType = 'basic'
            const usernameField = request.auth.basic.find((f) => f.key === 'username')
            const passwordField = request.auth.basic.find((f) => f.key === 'password')
            if (usernameField) credentials.username = usernameField.value
            if (passwordField) credentials.password = passwordField.value
          } else if (request.auth.type === 'apikey' && request.auth.apikey) {
            authType = 'api-key'
            const keyField = request.auth.apikey.find((f) => f.key === 'key')
            const valueField = request.auth.apikey.find((f) => f.key === 'value')
            const inField = request.auth.apikey.find((f) => f.key === 'in')
            if (keyField) credentials.key = keyField.value
            if (valueField) credentials.value = valueField.value
            if (inField) credentials.addTo = inField.value
          }
        }

        requests.push({
          id: nanoid(),
          name: item.name,
          method: (request.method || 'GET') as HttpRequest['method'],
          url,
          headers,
          params,
          body: {
            type: bodyType,
            content: bodyContent,
          },
          auth: {
            type: authType,
            credentials,
          },
        })
      }
    }

    return { folders, requests }
  }

  const processed = processItems(postmanJson.item)
  collection.folders = processed.folders
  collection.requests = processed.requests
  
  return collection
}

// Convert our format to Postman collection
export function exportPostmanCollection(collection: Collection): PostmanCollection {
  const postmanItems: PostmanItem[] = []

  // Convert root-level requests
  for (const request of collection.requests) {
    postmanItems.push(convertRequestToPostman(request))
  }

  // Convert folders
  for (const folder of collection.folders) {
    if (!folder.parentId) {
      // Only process top-level folders
      postmanItems.push(convertFolderToPostman(folder, collection.folders))
    }
  }

  return {
    info: {
      name: collection.name,
      description: collection.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: postmanItems,
  }
}

function convertFolderToPostman(folder: Folder, allFolders: Folder[]): PostmanItem {
  const nestedFolders = allFolders.filter((f) => f.parentId === folder.id)
  const items: PostmanItem[] = []

  // Add requests
  for (const request of folder.requests) {
    items.push(convertRequestToPostman(request))
  }

  // Add nested folders
  for (const nestedFolder of nestedFolders) {
    items.push(convertFolderToPostman(nestedFolder, allFolders))
  }

  return {
    name: folder.name,
    item: items,
  }
}

function convertRequestToPostman(request: HttpRequest): PostmanItem {
  // Convert headers
  const headers = request.headers
    .filter((h) => h.key && h.value)
    .map((h) => ({
      key: h.key,
      value: h.value,
      disabled: !h.enabled,
    }))

  // Convert body
  let body: PostmanRequest['body'] | undefined
  if (request.body.type !== 'none') {
    if (request.body.type === 'raw' || request.body.type === 'json') {
      body = {
        mode: 'raw',
        raw: typeof request.body.content === 'string' ? request.body.content : JSON.stringify(request.body.content, null, 2),
      }
    } else if (request.body.type === 'x-www-form-urlencoded') {
      const params = Array.isArray(request.body.content)
        ? request.body.content.map((p) => ({
            key: p.key,
            value: p.value,
            disabled: !p.enabled,
          }))
        : []
      body = {
        mode: 'urlencoded',
        urlencoded: params,
      }
    } else if (request.body.type === 'form-data') {
      const params = Array.isArray(request.body.content)
        ? request.body.content.map((p) => ({
            key: p.key,
            value: p.value,
            disabled: !p.enabled,
          }))
        : []
      body = {
        mode: 'formdata',
        formdata: params,
      }
    }
  }

  // Convert auth
  let auth: PostmanRequest['auth'] | undefined
  if (request.auth.type === 'bearer') {
    auth = {
      type: 'bearer',
      bearer: [
        { key: 'token', value: request.auth.credentials.token || '' },
      ],
    }
  } else if (request.auth.type === 'basic') {
    auth = {
      type: 'basic',
      basic: [
        { key: 'username', value: request.auth.credentials.username || '' },
        { key: 'password', value: request.auth.credentials.password || '' },
      ],
    }
  } else if (request.auth.type === 'api-key') {
    auth = {
      type: 'apikey',
      apikey: [
        { key: 'key', value: request.auth.credentials.key || '' },
        { key: 'value', value: request.auth.credentials.value || '' },
        { key: 'in', value: request.auth.credentials.addTo || 'header' },
      ],
    }
  }

  // Convert query parameters if exists
  const query = request.params.length > 0
    ? request.params.map((p) => ({
        key: p.key,
        value: p.value,
        disabled: !p.enabled,
      }))
    : undefined

  const postmanRequest: PostmanRequest = {
    method: request.method,
    header: headers.length > 0 ? headers : undefined,
    url: query ? {
      raw: request.url,
      query,
    } : request.url,
    body,
    auth,
  }

  return {
    name: request.name,
    request: postmanRequest,
  }
}

// Validate Postman collection format
export function validatePostmanCollection(json: unknown): json is PostmanCollection {
  if (!json || typeof json !== 'object') return false
  
  const obj = json as Record<string, unknown>
  
  return (
    typeof obj.info === 'object' &&
    obj.info !== null &&
    'name' in obj.info &&
    Array.isArray(obj.item)
  )
}
