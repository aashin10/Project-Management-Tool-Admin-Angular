# Backend Error Message Fix Required

## Issue

When attempting to create a duplicate user (same email), the API returns a generic error message:

```
"An unexpected error occurred."
```

Instead of the specific error message:

```
"Email already exists"
```

## Evidence from Console Logs

```
UsersApi: Error status: 500
UsersApi: Error.error: Object
UsersApi: Error.error.Message: An unexpected error occurred.
```

## Root Cause

The backend API (https://localhost:7178/api/User) is catching the specific database or validation error (like duplicate email constraint violation) but returning a generic error message in the response.

## Backend Fix Needed

### Current Backend Behavior (Problematic)

```csharp
// ❌ Bad - Generic error handling
try {
    // User creation logic
    await _context.Users.AddAsync(user);
    await _context.SaveChangesAsync();
    return Ok(new { status = 200, data = user, message = "User created" });
}
catch (Exception ex) {
    // Generic error - loses specific information
    return StatusCode(500, new { Message = "An unexpected error occurred." });
}
```

### Recommended Backend Fix

```csharp
// ✅ Good - Specific error handling
try {
    // User creation logic
    await _context.Users.AddAsync(user);
    await _context.SaveChangesAsync();
    return Ok(new { status = 200, data = user, message = "User created" });
}
catch (DbUpdateException ex) {
    // Check for duplicate key/unique constraint violations
    if (ex.InnerException?.Message.Contains("UNIQUE") == true ||
        ex.InnerException?.Message.Contains("duplicate") == true) {

        // Check which field caused the duplicate
        if (ex.InnerException?.Message.Contains("email") == true) {
            return BadRequest(new { Message = "Email already exists" });
        }
        else if (ex.InnerException?.Message.Contains("jira_id") == true) {
            return BadRequest(new { Message = "Jira ID already exists" });
        }

        return BadRequest(new { Message = "Duplicate entry detected" });
    }

    // For other database errors
    return StatusCode(500, new { Message = "Database error occurred" });
}
catch (Exception ex) {
    // Log the actual error for debugging
    _logger.LogError(ex, "Error creating user");

    // Return generic error for unexpected issues
    return StatusCode(500, new { Message = "An unexpected error occurred." });
}
```

## Alternative Backend Fix (Using Validation)

```csharp
// Validate before attempting to save
var existingUser = await _context.Users
    .FirstOrDefaultAsync(u => u.Email == user.Email);

if (existingUser != null) {
    return BadRequest(new { Message = "Email already exists" });
}

var existingJiraUser = await _context.Users
    .FirstOrDefaultAsync(u => u.JiraId == user.JiraId && !string.IsNullOrEmpty(user.JiraId));

if (existingJiraUser != null) {
    return BadRequest(new { Message = "Jira ID already exists" });
}

try {
    await _context.Users.AddAsync(user);
    await _context.SaveChangesAsync();
    return Ok(new { status = 200, data = user, message = "User created" });
}
catch (Exception ex) {
    _logger.LogError(ex, "Error creating user");
    return StatusCode(500, new { Message = "An unexpected error occurred." });
}
```

## Status Codes to Use

- **200 OK**: User created successfully
- **400 Bad Request**: Validation errors (duplicate email, invalid data, etc.)
- **500 Internal Server Error**: Unexpected errors (but should be rare with proper validation)

## Frontend Status

✅ Frontend is correctly configured to extract and display the `Message` property from the API error response.

The frontend will automatically display whatever message the backend sends in:

- `error.error.Message` (Pascal case - current)
- `error.error.message` (camelCase)
- `error.error.error` (nested error property)
- Multiple other formats

## Testing Recommendations

After backend fix, test these scenarios:

1. ✅ Create user with new email - Should succeed
2. ✅ Create user with duplicate email - Should show "Email already exists"
3. ✅ Create user with duplicate Jira ID - Should show "Jira ID already exists"
4. ✅ Create user with invalid data - Should show appropriate validation message
5. ✅ Network error - Should show "Network issue. Check your internet connection"

## Related Files

- Frontend API Service: `src/app/users/services/users-api.ts`
- Frontend Component: `src/app/users/pages/userslist/userslist.ts`
- Backend Controller: (Location in your backend project)
