# API Integration Guide - User Management

## Overview

The Users List component now fetches user data from a REST API endpoint instead of using hardcoded data.

## Changes Made

### 1. Component Updates (`userslist.ts`)

#### Added Imports

```typescript
import { OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
```

#### Added Interfaces

```typescript
interface User {
  user: string;
  email: string;
  type: string;
  status: string;
  created: string;
  lastActivity: string;
}

interface ApiResponse {
  status: number;
  data: ApiUser[];
}

interface ApiUser {
  id: number;
  userName: string;
  email: string;
  createdAt: string;
  type: string;
  status: string;
  lastActivity: string;
}
```

#### Component Properties

```typescript
export class Userslist implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7048/api/User';

  isLoading = false;
  loadingError: string | null = null;
  users: User[] = [];
}
```

#### Key Methods

**`ngOnInit()`** - Lifecycle hook that fetches users when component initializes

```typescript
ngOnInit() {
  this.fetchUsers();
}
```

**`fetchUsers()`** - Makes HTTP GET request to fetch user data

- Shows loading spinner while fetching
- Transforms API response to match component's data structure
- Handles various error scenarios (network issues, 404, 500, etc.)
- Provides user-friendly error messages

**`formatDate(dateString: string)`** - Converts ISO date strings to human-readable format

- "Today" for current day
- "Yesterday" for previous day
- "X days ago" for recent dates
- "MM/DD/YYYY" for older dates

### 2. Template Updates (`userslist.html`)

Added three states to the table section:

#### Loading State

```html
<div *ngIf="isLoading" class="flex items-center justify-center py-12">
  <div class="text-center">
    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC]"></div>
    <p class="mt-4 text-sm text-gray-600">Loading users...</p>
  </div>
</div>
```

#### Error State

```html
<div
  *ngIf="!isLoading && loadingError"
  class="bg-red-50 border border-red-200 rounded-md p-6 text-center"
>
  <!-- Error icon and message -->
  <app-custom-button
    label="Retry"
    (click)="fetchUsers()"
    [bgClass]="'bg-[#0052CC]'"
    [hoverClass]="'hover:bg-[#0052cce6]'"
    [textColor]="'text-white'"
    [fontSize]="'text-[14px]'"
  ></app-custom-button>
</div>
```

#### Success State

```html
<div *ngIf="!isLoading && !loadingError" class="overflow-x-auto">
  <app-table ...></app-table>
</div>
```

## API Endpoint

### Endpoint

```
GET https://localhost:7048/api/User
```

### Expected Response Format

```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "userName": "Alice Johnson",
      "email": "alice.johnson@company.com",
      "createdAt": "2025-09-23T00:00:00",
      "type": "Internal",
      "status": "Active",
      "lastActivity": "2025-09-25T00:00:00"
    }
  ]
}
```

### Field Mapping

| API Field      | Component Field | Description                             |
| -------------- | --------------- | --------------------------------------- |
| `userName`     | `user`          | User's full name                        |
| `email`        | `email`         | User's email address                    |
| `type`         | `type`          | User type (Internal/External/Customer)  |
| `status`       | `status`        | User status (Active/Inactive/Suspended) |
| `createdAt`    | `created`       | Account creation date (formatted)       |
| `lastActivity` | `lastActivity`  | Last activity date (formatted)          |

## Setup Requirements

### 1. HttpClient Configuration

The `HttpClient` is already configured in `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... other providers
  ],
};
```

### 2. CORS Configuration (Backend Required)

Your backend API must allow requests from the Angular app. Add these headers:

```csharp
// In your ASP.NET Core Startup.cs or Program.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder => builder
            .WithOrigins("http://localhost:4200") // Angular dev server
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

app.UseCors("AllowAngularApp");
```

### 3. HTTPS Certificate (Development)

For localhost HTTPS development, you may need to:

**Option A: Trust the development certificate**

```bash
dotnet dev-certs https --trust
```

**Option B: Disable SSL verification (NOT for production)**
Only during development, you can modify the API URL to use HTTP instead of HTTPS if certificate issues persist.

## Testing

### 1. Start the Backend API

Ensure your API is running on `https://localhost:7048`

### 2. Start the Angular App

```bash
npm start
```

### 3. Navigate to Users Page

Go to the Users Management page and verify:

- Loading spinner appears briefly
- User data loads successfully
- Filtering and search work with API data
- Error handling works when API is unavailable

## Error Handling

The component handles these scenarios:

| Error Type    | Status Code | User Message                                                                                  |
| ------------- | ----------- | --------------------------------------------------------------------------------------------- |
| Network Error | 0           | "Unable to connect to the server. Please check if the API is running and CORS is configured." |
| Not Found     | 404         | "API endpoint not found. Please verify the API URL."                                          |
| Server Error  | 500+        | "Server error occurred. Please try again later."                                              |
| Other Errors  | Any         | "Failed to load users: [error message]"                                                       |

## Future Enhancements

1. **Add Refresh Button**: Allow manual refresh of user data
2. **Implement Caching**: Cache user data to reduce API calls
3. **Add Pagination**: Fetch users page by page from the API
4. **Real-time Updates**: Use SignalR or WebSockets for live updates
5. **Optimistic UI Updates**: Update UI immediately when creating/editing users
6. **Retry Logic**: Automatic retry with exponential backoff on failures

## Configuration

To change the API URL, modify the `apiUrl` property in the component:

```typescript
private apiUrl = 'https://your-api-domain.com/api/User';
```

For environment-specific URLs, consider creating an environment service:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7048/api',
};

// userslist.ts
import { environment } from '../../../environments/environment';

export class Userslist implements OnInit {
  private apiUrl = `${environment.apiUrl}/User`;
}
```

## Troubleshooting

### Issue: CORS Error

**Solution**: Ensure backend CORS is configured to allow your Angular app's origin.

### Issue: SSL Certificate Error

**Solution**: Trust the development certificate or use HTTP for local development.

### Issue: 404 Not Found

**Solution**: Verify the API endpoint URL and ensure the backend is running.

### Issue: Empty User List

**Solution**: Check browser console for errors and verify API response format matches expected structure.

### Issue: Data Not Updating

**Solution**: Clear browser cache or add cache-busting headers to API requests.
