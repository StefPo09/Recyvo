# Backend-Frontend Connection Guide

## ✅ Implementation Complete

I've successfully connected your backend to the SignUpPage and LogInPage in the frontend. Here's what was done:

---

## Backend Changes (Python/FastAPI)

### 1. Added User Login Model
**File:** `backend/cameraBack/main.py`
- Added `UserLogin` Pydantic model for login requests
- Fields: `username_or_email`, `parola`

### 2. Added Login Endpoint
**Endpoint:** `POST /users/login`
- Accepts username OR email for flexible login
- Verifies password against the database
- Returns user data (id, username, nome, email, nr_puncte)
- Throws 401 error if credentials are invalid

### 3. Existing Signup Endpoint
**Endpoint:** `POST /users/`
- Already existed and works perfectly
- Fields: `username`, `nume`, `email`, `parola`
- Creates new users in the `users` table in `trash_bins.db`

---

## Frontend Changes (React/Next.js)

### 1. Updated API Functions
**File:** `frontend/lib/api.ts`
- Added `signupUser()` - calls backend signup endpoint
- Added `loginUser()` - calls backend login endpoint
- Both functions handle errors properly

### 2. Updated SignUpPage
**File:** `frontend/app/SignUpPage/page.tsx`
- Imported `signupUser` from API
- Added "Full Name" input field (required)
- Changed `handleSignUp()` to async function that calls backend
- Stores user data in localStorage after successful signup
- Shows loading spinner during signup
- Displays error messages from backend
- Navigates to HomePage on success

### 3. Updated LogInPage
**File:** `frontend/app/LogInPage/page.tsx`
- Imported `loginUser` from API
- Changed `handleSubmit()` to async function that calls backend
- Stores user data in localStorage after successful login
- Shows loading spinner during login
- Displays error messages from backend
- Navigates to HomePage on success

---

## User Flow

### Sign Up Flow
1. User fills form (Username, Full Name, Email, Password, Confirm Password)
2. Frontend validates all fields locally
3. User clicks "Create Account"
4. Frontend calls backend `/users/` endpoint
5. Backend checks for duplicate username/email
6. If success: stores user in database, returns user data
7. Frontend stores user in localStorage
8. Frontend navigates to HomePage

### Login Flow
1. User fills form (Username/Email, Password)
2. Frontend validates fields locally
3. User clicks "Log In"
4. Frontend calls backend `/users/login` endpoint
5. Backend checks credentials against database
6. If success: returns user data
7. Frontend stores user in localStorage
8. Frontend navigates to HomePage

---

## How to Test

### Start the Backend
```bash
cd backend/cameraBack
python main.py
```
The API will run on `http://localhost:8000`

### Start the Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

### Test Sign Up
1. Navigate to `http://localhost:3000/SignUpPage`
2. Fill in all fields
3. Click "Create Account"
4. Should navigate to HomePage

### Test Login
1. Navigate to `http://localhost:3000/LogInPage`
2. Use credentials from signup
3. Click "Log In"
4. Should navigate to HomePage

---

## Data Storage

### Database (Backend)
- **File:** `backend/cameraBack/trash_bins.db`
- **Table:** `users`
- **Fields:** id, username, nume, email, parola, nr_puncte, created_at

### Frontend State
- **localStorage key:** `user` - stores full user object
- **localStorage key:** `userId` - stores just the user ID for quick access
- **React state:** Local component state for form validation

---

## Error Handling

### Backend Errors
- **400:** Username/email already exists
- **401:** Invalid credentials (login failed)
- **500:** Server error

### Frontend
- Displays user-friendly error messages from backend
- Shows loading state during API calls
- Validates form before sending to backend
- Handles network errors gracefully

---

## Notes

✅ **Password Security:** Currently storing passwords in plain text. For production, consider using bcrypt or similar.

✅ **CORS:** Backend already configured to accept requests from frontend

✅ **API URL:** Frontend uses `NEXT_PUBLIC_API_URL` env variable, defaults to `http://localhost:8000`

✅ **Full Name:** Now a required field for signup (stored as "nume" in database)

---

## API Response Examples

### Sign Up Success
```json
{
  "id": "uuid-string",
  "username": "john_doe",
  "nume": "John Doe",
  "email": "john@example.com",
  "nr_puncte": 0
}
```

### Login Success
```json
{
  "id": "uuid-string",
  "username": "john_doe",
  "nume": "John Doe",
  "email": "john@example.com",
  "nr_puncte": 0
}
```

---

**Ready to go!** 🎉 Your frontend is now fully connected to your backend user system.

