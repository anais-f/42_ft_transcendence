# API Layer

## Purpose

This directory contains **pure API calls** to backend services. These functions handle HTTP requests and responses, returning a standardized format.

## Pattern

All API functions follow this pattern:

```typescript
export async function someAPI(params) {
	try {
		const res = await fetch('/endpoint', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(params)
		})

		if (!res.ok) {
			const error = await res.json()
			return {
				data: null,
				error: error.message || 'Request failed',
				status: error.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: 200 }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}
```

## Return Format

All API functions return: `{ data, error, status }`

- **Success**: `{ data: {...}, error: null, status: 2xx }`
- **Error**: `{ data: null, error: "message", status: 4xx/5xx }`
- **Network error**: `{ data: null, error: "Network error", status: 0 }`

## Responsibilities

**Do:**

- Make HTTP requests
- Handle response parsing
- Return standardized format
- Handle network errors

**Don't:**

- Manage UI state
- Display notifications
- Handle business logic
- Navigate between pages

## Examples

```typescript
const { data, error, status } = await loginAPI(username, password)

if (error) {
	// Handle in event handler
	return
}

// Use data
```
