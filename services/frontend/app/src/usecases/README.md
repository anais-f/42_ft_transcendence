# Usecases Layer

## Purpose

This directory contains **business logic and reusable operations**. Usecases orchestrate multiple actions, manage application state, and provide high-level operations that can be called from anywhere in the app.

## When to Create a Usecase
- ✅ Multi-step operations (API + state + cleanup)
- ✅ Called from multiple places
- ✅ Session/state management
- ❌ Simple one-off operations → keep in event handler

## Examples

### State (userStore.ts)
```typescript
export let currentUser: IPrivateUser | null = null

export function setCurrentUser(user: IPrivateUser | null) {
  currentUser = user
}
```

### Session Operations (userSession.ts)
```typescript
// Reusable operation
export async function logout() {
  const { error } = await logoutAPI()
  if (error) console.error('Logout failed:', error)

  cleanupUserSession()  // Clear websockets, state, etc.
  window.navigate('/login', true)
}

// Simple helper
export async function checkAuth(): Promise<IPrivateUser | null> {
  // Fetch /users/api/users/me
  // Return user or null
}
```

## Rules
- ✅ Orchestrate multiple actions
- ✅ Manage state
- ❌ No DOM interaction
- ❌ No event listeners