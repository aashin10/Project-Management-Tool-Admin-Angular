# User API Integration - Testing Checklist

## Pre-requisites

- [ ] Backend API is running on `https://localhost:7048`
- [ ] Backend has CORS configured for `http://localhost:4200`
- [ ] API endpoint `/api/User` is accessible
- [ ] Angular app dependencies are installed (`npm install`)

## Backend API Verification

### 1. Test API Endpoint Directly

Open browser or use curl/Postman to test:

```bash
curl https://localhost:7048/api/User
```

Expected response:

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

### 2. Verify Response Fields

- [ ] `status` field exists and is a number
- [ ] `data` field exists and is an array
- [ ] Each user object has all required fields:
  - [ ] `id` (number)
  - [ ] `userName` (string)
  - [ ] `email` (string)
  - [ ] `createdAt` (ISO date string)
  - [ ] `type` (string)
  - [ ] `status` (string)
  - [ ] `lastActivity` (ISO date string)

## Frontend Testing

### Start the Application

```bash
npm start
```

Navigate to: `http://localhost:4200/users` (or wherever the users list is)

### Test Scenarios

#### 1. Initial Load

- [ ] Loading spinner appears when page loads
- [ ] Loading spinner disappears after data loads
- [ ] User table displays with data from API
- [ ] User count is correct
- [ ] All columns display properly:
  - [ ] User name and email
  - [ ] Type badge (with correct color)
  - [ ] Status badge (with correct color)
  - [ ] Created date (formatted)
  - [ ] Last activity date (formatted)
  - [ ] Action buttons (Edit, Delete)

#### 2. Data Validation

- [ ] User names match API data
- [ ] Emails match API data
- [ ] User types are correct (Internal/External/Customer)
- [ ] User statuses are correct (Active/Inactive/Suspended)
- [ ] Dates are formatted correctly:
  - [ ] Today's date shows "Today"
  - [ ] Yesterday's date shows "Yesterday"
  - [ ] Recent dates show "X days ago"
  - [ ] Older dates show "MM/DD/YYYY"

#### 3. Search Functionality

- [ ] Search by user name works
- [ ] Search by email works
- [ ] Search by type works
- [ ] Search by status works
- [ ] Search is case-insensitive
- [ ] Empty search shows all users

#### 4. Filter Functionality

- [ ] Type filter dropdown works
- [ ] Status filter dropdown works
- [ ] Selecting "All Types" shows all users
- [ ] Selecting specific type filters correctly
- [ ] Selecting "All Status" shows all users
- [ ] Selecting specific status filters correctly
- [ ] Multiple filters work together (Type + Status)
- [ ] Filters + Search work together

#### 5. Selection and Bulk Actions

- [ ] Individual user selection works
- [ ] Select all on current page works
- [ ] Select all across all pages works
- [ ] Bulk action bar appears when users selected
- [ ] Selected user count is accurate
- [ ] Assign Projects button appears
- [ ] Suspend button appears
- [ ] Delete button appears

#### 6. Actions

- [ ] Edit action button works
- [ ] Delete action button works
- [ ] Delete confirmation modal appears
- [ ] Bulk delete confirmation modal appears

#### 7. Export Functionality

- [ ] Export button works
- [ ] CSV file downloads
- [ ] Exported data matches displayed data
- [ ] Export filename includes date
- [ ] Export with selection only exports selected users

#### 8. Error Handling

Test by stopping the backend API:

- [ ] Stop backend API
- [ ] Refresh page
- [ ] Error message appears: "Unable to connect to the server..."
- [ ] Error icon displays
- [ ] Retry button appears
- [ ] Click retry button
- [ ] Loading spinner appears again

Test with wrong URL:

- [ ] Change API URL in code to invalid endpoint
- [ ] Refresh page
- [ ] Error message appears: "API endpoint not found..."
- [ ] Retry button works

#### 9. Responsive Design

- [ ] Page works on desktop (1920x1080)
- [ ] Page works on laptop (1366x768)
- [ ] Page works on tablet (768x1024)
- [ ] Table scrolls horizontally if needed

#### 10. Performance

- [ ] Initial load completes in < 3 seconds
- [ ] Search/filter is instant (< 100ms)
- [ ] No console errors
- [ ] No console warnings (except npm version notice)

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

## Console Checks

### Expected Console Messages

- [ ] "Users loaded successfully: [number]" appears after successful load
- [ ] No error messages in console
- [ ] No 404 errors
- [ ] No CORS errors

### Common Console Errors to Watch For

❌ `CORS policy: No 'Access-Control-Allow-Origin' header`
→ Backend CORS not configured

❌ `GET https://localhost:7048/api/User net::ERR_CONNECTION_REFUSED`
→ Backend not running

❌ `GET https://localhost:7048/api/User 404 (Not Found)`
→ Wrong API endpoint

❌ `GET https://localhost:7048/api/User net::ERR_CERT_AUTHORITY_INVALID`
→ SSL certificate issue (trust dev cert)

## Network Tab Verification

Open Browser DevTools → Network tab:

- [ ] Request to `/api/User` appears
- [ ] Request method is GET
- [ ] Response status is 200
- [ ] Response content-type is `application/json`
- [ ] Response body matches expected format

## Known Issues / Limitations

1. **HTTPS Certificate Warning**: Development HTTPS certificates may cause browser warnings

   - **Fix**: Trust the certificate or use HTTP for local development

2. **CORS in Production**: The API URL is currently hardcoded for local development

   - **Fix**: Use environment variables for production deployment

3. **No Automatic Refresh**: Data only loads on component initialization

   - **Future**: Add auto-refresh or manual refresh button

4. **Client-side Pagination**: All data is loaded at once, pagination happens in browser
   - **Future**: Implement server-side pagination for large datasets

## Production Readiness Checklist

Before deploying to production:

- [ ] Change API URL to production endpoint
- [ ] Use environment variables for API URL
- [ ] Implement proper authentication/authorization
- [ ] Add request/response interceptors for auth tokens
- [ ] Implement proper error logging
- [ ] Add loading indicators for all async operations
- [ ] Implement retry logic with exponential backoff
- [ ] Add request caching to reduce API calls
- [ ] Configure CORS properly on production server
- [ ] Test with production data volumes
- [ ] Implement server-side pagination for large datasets
- [ ] Add comprehensive error handling
- [ ] Set up monitoring and alerts

## Test Results

### Test Date: ******\_\_\_******

### Tester: ******\_\_\_******

| Test Category             | Pass/Fail     | Notes |
| ------------------------- | ------------- | ----- |
| API Endpoint Verification | ☐ Pass ☐ Fail |       |
| Initial Load              | ☐ Pass ☐ Fail |       |
| Data Display              | ☐ Pass ☐ Fail |       |
| Search Functionality      | ☐ Pass ☐ Fail |       |
| Filter Functionality      | ☐ Pass ☐ Fail |       |
| Bulk Actions              | ☐ Pass ☐ Fail |       |
| Error Handling            | ☐ Pass ☐ Fail |       |
| Export Functionality      | ☐ Pass ☐ Fail |       |
| Responsive Design         | ☐ Pass ☐ Fail |       |
| Performance               | ☐ Pass ☐ Fail |       |

### Overall Status: ☐ PASS ☐ FAIL

### Issues Found:

1. ***
2. ***
3. ***

### Notes:

---

---

---
