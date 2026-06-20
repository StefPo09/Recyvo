# Authentication & Navigation Flow

## ✅ Implementation Complete

Your app now has a complete authentication flow that automatically redirects users based on their login status!

---

## How It Works

### 1. **Root Page (`/`) - Entry Point**
- **Location:** `app/page.tsx`
- **Behavior:**
  - Checks localStorage for user data
  - If user exists → redirects to `/HomePage`
  - If no user → redirects to `/StartPage`
  - Shows loading spinner while checking

### 2. **Start Page (`/StartPage`) - Welcome Page**
- **Location:** `app/StartPage/page.tsx`
- **Behavior:**
  - Double-checks if user is already logged in
  - If user exists → redirects to `/HomePage`
  - If no user → shows login/signup options
  - Displays "Meet SEB" welcome message

### 3. **Home Page (`/HomePage`) - Main App**
- **Location:** `app/HomePage/page.tsx`
- **Behavior:**
  - **Protected page** - only logged-in users can access
  - Checks if user is authenticated
  - If no user → redirects to `/StartPage`
  - Shows user info (name, points, level)
  - **NEW:** Logout button in header to clear user session

### 4. **Sign Up Page (`/SignUpPage`)**
- **Location:** `app/SignUpPage/page.tsx`
- **Behavior:**
  - User creates new account
  - Data saved to backend database
  - User data stored in localStorage
  - Redirects to HomePage

### 5. **Log In Page (`/LogInPage`)**
- **Location:** `app/LogInPage/page.tsx`
- **Behavior:**
  - User logs in with username/email + password
  - Credentials verified against backend
  - User data stored in localStorage
  - Redirects to HomePage

---

## User Flow Diagram

```
Visit Website (/)
    ↓
Check localStorage for user data
    ↓
┌───────────────────────────────────┐
│                                   │
YES (User exists)              NO (User doesn't exist)
│                                   │
↓                                   ↓
HomePage                      StartPage
(Protected)                   (Login/Signup)
│                                   │
├─ View Dashboard          ┌───────┴────────┐
├─ Scan Waste                        │
├─ View Map                    LOGIN  SIGNUP
├─ Chat with SEB                 │       │
└─ Logout Button             ┌───┴───┬─┘
                              │       │
                         [Success]   [Account exists]
                              │       │
                              └───┬───┘
                                  ↓
                            HomePage (Login)
```

---

## localStorage Usage

### Keys Stored
1. **`user`** - Full user object (JSON string)
   ```json
   {
     "id": "uuid-string",
     "username": "john_doe",
     "nume": "John Doe",
     "email": "john@example.com",
     "nr_puncte": 0
   }
   ```

2. **`userId`** - Just the user ID for quick access
   ```
   "uuid-string"
   ```

### When Data is Stored
- After successful signup
- After successful login

### When Data is Cleared
- When user clicks logout button on HomePage
- Can also be cleared manually via browser DevTools

---

## Logout Feature

### New Logout Button
- **Location:** HomePage header (top right)
- **Icon:** Sign out icon
- **Text:** "Logout" (hidden on mobile, visible on larger screens)
- **Action:**
  1. Clears `user` from localStorage
  2. Clears `userId` from localStorage
  3. Redirects to StartPage

---

## Protected Pages

The following pages now check for authentication:

✅ **HomePage** - Requires login, redirects to StartPage if not authenticated
✅ **StartPage** - Skips if user is already logged in

---

## Testing the Flow

### Scenario 1: First Time Visitor
1. Visit `http://localhost:3000`
2. Root page checks localStorage
3. No user found → redirects to StartPage
4. User sees login/signup options
5. User clicks "Create Free Account"
6. User fills signup form
7. Account created → stored in localStorage → redirects to HomePage

### Scenario 2: Returning User
1. Visit `http://localhost:3000`
2. Root page checks localStorage
3. User found → redirects directly to HomePage
4. User sees their dashboard
5. User can logout or navigate within app

### Scenario 3: Direct Access to StartPage
1. User already logged in
2. Visit `/StartPage` directly
3. StartPage checks localStorage
4. User found → redirects to HomePage
5. Cannot see StartPage while logged in

### Scenario 4: Direct Access to HomePage Without Login
1. User not logged in
2. Visit `/HomePage` directly
3. HomePage checks localStorage
4. No user found → redirects to StartPage
5. Cannot access HomePage without login

### Scenario 5: Logout
1. User on HomePage
2. Clicks logout button
3. User data cleared from localStorage
4. Redirected to StartPage
5. Can see login/signup options

---

## Key Features

✨ **Automatic Redirection**
- Smart routing based on login status
- No need to manually navigate

✨ **Session Persistence**
- Users stay logged in even after page refresh
- localStorage preserves session

✨ **Loading States**
- Shows spinner while checking authentication
- Prevents flash of wrong content

✨ **Protected Routes**
- HomePage only accessible when logged in
- Automatic redirect to StartPage if unauthorized

✨ **User Display**
- HomePage shows user's name and points
- Data pulled from localStorage

✨ **Logout Functionality**
- Easy logout button in header
- Clears all user data
- Returns to StartPage

---

## Code Locations

| File | Purpose |
|------|---------|
| `app/page.tsx` | Root entry point with auth check |
| `app/StartPage/page.tsx` | Welcome page with login/signup |
| `app/HomePage/page.tsx` | Main app dashboard (protected) |
| `app/SignUpPage/page.tsx` | User registration |
| `app/LogInPage/page.tsx` | User login |
| `lib/api.ts` | Backend API functions |

---

## Frontend Logic Summary

1. **Root Page** - Universal entry point, routes to StartPage or HomePage
2. **StartPage** - Accessible to anyone, but skips if logged in
3. **HomePage** - Protected, requires login
4. **Logout** - Clears localStorage and returns to StartPage

This creates a complete authentication flow that handles all user scenarios!

---

## What Happens When...

| Scenario | Action | Result |
|----------|--------|--------|
| User visits `/` | Check localStorage | → HomePage or StartPage |
| User visits `/StartPage` while logged in | Check localStorage | → HomePage |
| User visits `/HomePage` while logged out | Check localStorage | → StartPage |
| User clicks Logout | Clear localStorage | → StartPage |
| User signs up | Store user data | → HomePage |
| User logs in | Store user data | → HomePage |
| User refreshes page | Check localStorage | → Same page (if logged in) |
| User closes browser & reopens | Check localStorage | → Same page (if logged in) |

🎉 **Complete authentication system ready to go!**

