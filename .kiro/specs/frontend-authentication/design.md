# Frontend Authentication Design Document

## Overview

The Ghostypedia frontend authentication system is a Next.js-based web interface that provides user registration, login, logout, and password reset functionality. The system integrates with the existing Express.js backend API and follows modern React patterns using the App Router architecture, TypeScript for type safety, and Tailwind CSS for styling.

The authentication system will be built as a set of reusable components and hooks that manage authentication state, API communication, and form validation. The design emphasizes user experience with real-time validation, loading states, and responsive layouts that work across all device sizes.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API for authentication state
- **HTTP Client**: Fetch API with custom wrapper
- **Form Handling**: React Hook Form
- **Validation**: Zod schema validation
- **Storage**: localStorage for token persistence

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── PasswordStrengthIndicator.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── LoadingSpinner.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── auth.ts
│   │   ├── validation/
│   │   │   └── auth.schemas.ts
│   │   └── storage/
│   │       └── token.ts
│   └── types/
│       └── auth.ts
```

## Components and Interfaces

### Authentication Context

The AuthContext provides global authentication state management across the application.

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

interface User {
  id: string;
  email: string;
  username: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}
```

### API Client

The API client handles all HTTP communication with the backend.

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface LoginResponse {
  token: string;
  userId: string;
  expiresAt: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
```

### Form Components

Each authentication form is a self-contained component with validation and error handling.

```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface ResetPasswordFormProps {
  token?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

## Data Models

### Token Storage

```typescript
interface StoredToken {
  token: string;
  expiresAt: string;
  userId: string;
}
```

### Form Validation Schemas

```typescript
// Login Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Registration Schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Password Reset Request Schema
const resetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Password Reset Schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form submission API calls

*For any* authentication form (login, register, password reset) and any valid form data, submitting the form should result in a POST request to the correct Backend API endpoint with the correct payload structure.
**Validates: Requirements 1.2, 2.2, 3.1, 4.2, 4.5**

### Property 2: Successful registration redirect

*For any* successful registration response from the Backend API, the Frontend Application should redirect to the login page and display a success message.
**Validates: Requirements 1.3**

### Property 3: Validation error display

*For any* validation error response from the Backend API, the Frontend Application should display the error message in proximity to the relevant form field.
**Validates: Requirements 1.4**

### Property 4: Token storage operations

*For any* authentication token received from the Backend API, the Frontend Application should store it in browser storage with the correct expiration timestamp, and for any logout operation, the token should be completely removed from storage.
**Validates: Requirements 2.3, 3.2**

### Property 5: Password validation feedback

*For any* input in a password field, the Frontend Application should display real-time validation feedback indicating which password requirements are met and which are not met.
**Validates: Requirements 5.1**

### Property 6: Session validation API call

*For any* valid non-expired authentication token found in browser storage, the Frontend Application should send a validation request to the Backend API at /api/auth/validate.
**Validates: Requirements 6.3**

### Property 7: Form loading states

*For any* authentication form submission, the Frontend Application should disable the submit button and display a loading indicator until the API response is received.
**Validates: Requirements 7.1**

## Error Handling

### Client-Side Validation Errors

- Form validation occurs before API submission
- Validation errors are displayed inline below form fields
- Submit button remains disabled until all validation errors are resolved
- Validation uses Zod schemas for type-safe validation

### API Error Handling

The application handles the following error scenarios:

1. **Validation Errors (400)**: Display field-specific errors returned from the backend
2. **Authentication Errors (401)**: Display "Invalid credentials" message
3. **Conflict Errors (409)**: Display "Email/username already exists" message
4. **Network Errors**: Display "Network error, please try again" with retry option
5. **Server Errors (500)**: Display "Something went wrong, please try again later"
6. **Timeout Errors**: Display "Request timed out, please try again"

### Token Expiration Handling

- Check token expiration before making authenticated requests
- Automatically redirect to login page when token is expired
- Clear expired tokens from storage
- Display message: "Your session has expired, please log in again"

### Error Recovery

- All error states allow users to retry the operation
- Form data is preserved when errors occur (except passwords)
- Network errors trigger automatic retry with exponential backoff (max 3 attempts)

## Testing Strategy

### Unit Testing

The frontend authentication system will use **Vitest** as the testing framework along with **React Testing Library** for component testing.

Unit tests will cover:

1. **Component Rendering**: Verify that authentication forms render with correct fields and labels
2. **Form Validation**: Test that validation schemas correctly identify valid and invalid inputs
3. **Error Display**: Verify that error messages are displayed in the correct locations
4. **API Client**: Test that API client functions construct correct request payloads
5. **Token Storage**: Test that token storage and retrieval functions work correctly
6. **Context Behavior**: Test that AuthContext provides correct state and methods

Example unit tests:
- Login form renders with email and password fields
- Registration form displays error when email is invalid
- Token storage saves and retrieves tokens correctly
- API client includes authentication header when token is present

### Property-Based Testing

The frontend authentication system will use **fast-check** as the property-based testing library for JavaScript/TypeScript.

Each property-based test will:
- Run a minimum of 100 iterations
- Use smart generators that produce valid test data
- Be tagged with a comment referencing the design document property

Property-based tests will cover:

1. **Property 1 - Form submission API calls**: Generate random valid form data for each authentication form type and verify that the correct API endpoint is called with properly structured payloads
2. **Property 2 - Successful registration redirect**: Generate random successful registration responses and verify redirect behavior
3. **Property 3 - Validation error display**: Generate random validation error responses and verify error messages are displayed
4. **Property 4 - Token storage operations**: Generate random authentication tokens and verify storage and removal operations
5. **Property 5 - Password validation feedback**: Generate random password strings and verify that validation feedback correctly identifies which requirements are met
6. **Property 6 - Session validation API call**: Generate random valid tokens and verify that validation API calls are made
7. **Property 7 - Form loading states**: Generate random form submissions and verify loading state behavior

### Integration Testing

Integration tests will verify the complete authentication flows:

1. **Registration Flow**: Complete registration from form submission to redirect
2. **Login Flow**: Complete login from form submission to authenticated state
3. **Logout Flow**: Complete logout from button click to unauthenticated state
4. **Password Reset Flow**: Complete password reset from request to completion
5. **Session Persistence**: Verify that authentication state persists across page reloads

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### Mocking Strategy

- Mock the Backend API using MSW (Mock Service Worker) for integration tests
- Mock browser storage (localStorage) for unit tests
- Mock Next.js router for navigation tests
- Avoid mocking internal application logic to ensure tests validate real behavior

## Security Considerations

### Token Storage

- Tokens are stored in localStorage (not sessionStorage) to persist across browser sessions
- Tokens include expiration timestamps and are validated before use
- Expired tokens are automatically removed from storage
- Consider implementing httpOnly cookies for enhanced security in future iterations

### Password Handling

- Passwords are never stored in browser storage
- Password fields use `type="password"` to prevent shoulder surfing
- Password validation happens on both client and server
- Passwords are cleared from form state after submission

### HTTPS Enforcement

- All API requests must use HTTPS in production
- Development environment can use HTTP for localhost only
- API client should reject non-HTTPS requests in production builds

### XSS Prevention

- All user input is sanitized before display
- React's built-in XSS protection is leveraged
- No use of `dangerouslySetInnerHTML` in authentication components

### CSRF Protection

- Authentication tokens are included in Authorization headers (not cookies)
- This approach provides inherent CSRF protection
- Backend API validates token on every request

## Performance Considerations

### Code Splitting

- Authentication pages are code-split using Next.js dynamic imports
- Authentication components are lazy-loaded when needed
- Reduces initial bundle size for unauthenticated users

### API Request Optimization

- Implement request debouncing for real-time validation
- Cache validation results to avoid redundant API calls
- Use SWR or React Query for efficient data fetching in future iterations

### Form Performance

- Use controlled components for form inputs
- Implement debounced validation to reduce re-renders
- Optimize re-renders using React.memo where appropriate

## Accessibility

### Keyboard Navigation

- All forms are fully keyboard navigable
- Tab order follows logical flow
- Enter key submits forms
- Escape key clears form errors

### Screen Reader Support

- All form fields have associated labels
- Error messages are announced to screen readers using ARIA live regions
- Loading states are announced to screen readers
- Form validation errors are associated with fields using aria-describedby

### Visual Accessibility

- Form fields have sufficient color contrast (WCAG AA compliant)
- Error messages use both color and text to convey meaning
- Focus indicators are clearly visible
- Font sizes are readable (minimum 16px for body text)

### ARIA Attributes

```typescript
// Example ARIA implementation
<input
  type="email"
  id="email"
  aria-label="Email address"
  aria-describedby={error ? "email-error" : undefined}
  aria-invalid={error ? "true" : "false"}
  aria-required="true"
/>
{error && (
  <span id="email-error" role="alert" aria-live="polite">
    {error}
  </span>
)}
```

## Future Enhancements

### OAuth Integration

- Add social login options (Google, GitHub)
- Implement OAuth 2.0 flow
- Support multiple authentication providers

### Multi-Factor Authentication

- Add support for 2FA using TOTP
- Implement SMS-based verification
- Support hardware security keys

### Biometric Authentication

- Add support for WebAuthn
- Implement fingerprint/face recognition on supported devices
- Provide fallback to password authentication

### Session Management

- Implement "Remember me" functionality
- Add session timeout warnings
- Support multiple concurrent sessions with device management

### Enhanced Security

- Implement rate limiting on client side
- Add CAPTCHA for suspicious activity
- Implement account lockout after failed attempts
- Add security event logging
