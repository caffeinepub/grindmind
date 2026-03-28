# GrindMind Login System

## Current State
AuthScreen uses localStorage-only. Backend separates data by II principal.

## Requested Changes (Diff)

### Add
- Wire AuthScreen to call II login after email/name form submission
- After II login, auto-call saveUser to persist profile to backend

### Modify
- AuthScreen.tsx: trigger II login on form submit; fire onSuccess after II identity ready
- App.tsx: check II identity on splash to skip auth for returning users

### Remove
- localStorage-only auth as the sole gate

## Implementation Plan
1. Update AuthScreen.tsx to use useInternetIdentity, call login() after validation
2. Watch II identity and fire onSuccess(name) when ready
3. Update App.tsx handleSplashComplete to check II identity
