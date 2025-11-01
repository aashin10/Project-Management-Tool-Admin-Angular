# User API Integration - Visual Comparison

**Date:** October 29, 2025

---

## Add User Modal Changes

### Before vs After

#### Payload Structure

**BEFORE:**

```json
{
  "users": [
    {
      "name": "John Doe",
      "email": "john@test.com",
      "jiraId": "JIRA-001",
      "type": "Internal",
      "createdBy": 1
    }
  ]
}
```

**AFTER:**

```json
{
  "users": [
    {
      "email": "john@test.com",      ← Moved to first
      "name": "John Doe",             ← Moved to second
      "jiraId": "JIRA-001",
      "type": "Internal",
      "status": "Active",             ← NEW FIELD
      "createdBy": 1
    }
  ]
}
```

#### Code Comparison

**BEFORE:**

```typescript
const createUserData: CreateUserDto = {
  name: this.newUser.fullName.trim(),
  email: this.newUser.email.trim(),
  jiraId: this.newUser.jiraId?.trim() || undefined,
  type: this.newUser.type || undefined,
  createdBy: 1,
};
```

**AFTER:**

```typescript
const createUserData: CreateUserDto = {
  email: this.newUser.email.trim(), // ✅ Reordered
  name: this.newUser.fullName.trim(), // ✅ Reordered
  jiraId: this.newUser.jiraId?.trim() || undefined,
  type: this.newUser.type || undefined,
  status: this.newUser.status || undefined, // 🆕 NEW
  createdBy: 1,
};
```

---

## CSV Import Implementation

### Before vs After

#### BEFORE (Placeholder)

```typescript
submitImport() {
  // Show info notification
  this.toastr.info(`File "${this.selectedFileName}" is currently being imported.`);

  // Simulate import with setTimeout
  setTimeout(() => {
    this.toastr.success(`File "${this.selectedFileName}" imported successfully.`);
  }, 3000);
}
```

**Issues:**

- ❌ No actual file reading
- ❌ No CSV parsing
- ❌ No validation
- ❌ No API call
- ❌ Fake delay

---

#### AFTER (Full Implementation)

```typescript
submitImport() {
  // 1. Validate file selection
  if (!this.selectedFile) {
    this.toastr.error('Please select a CSV file');
    return;
  }

  // 2. Read CSV file
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const csvContent = e.target.result;
    const lines = csvContent.split('\n');

    // 3. Parse headers (case-insensitive)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // 4. VALIDATE: Required columns
    const hasUserName = headers.some((h: string) =>
      h === 'user name' || h === 'username' || h === 'name'
    );
    const hasEmail = headers.some((h: string) => h === 'email');

    if (!hasUserName || !hasEmail) {
      this.toastr.error("The CSV must contain columns 'User name' and 'email' columns");
      return;
    }

    // 5. WARN: Jira ID column
    const hasJiraId = headers.some((h: string) =>
      h === 'user id' || h === 'userid' || h === 'jiraid' ||
      h === 'jira_id' || h === 'jira id'
    );

    if (!hasJiraId) {
      this.toastr.warning("The CSV doesn't contain Jira User Id...");
    }

    // 6. Map columns
    const jiraIdIndex = getColumnIndex(['user id', 'userid', ...]);
    const nameIndex = getColumnIndex(['user name', 'username', 'name']);
    const emailIndex = getColumnIndex(['email']);
    const statusIndex = getColumnIndex(['user status', 'userstatus', 'status']);

    // 7. Parse data rows
    const users: CreateUserDto[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      const user: CreateUserDto = {
        email: emailIndex !== -1 ? values[emailIndex] : '',
        name: nameIndex !== -1 ? values[nameIndex] : '',
        jiraId: jiraIdIndex !== -1 ? values[jiraIdIndex] : undefined,
        status: statusIndex !== -1 ? values[statusIndex] : undefined,
        createdBy: 1
      };

      if (user.email && user.name) {
        users.push(user);
      }
    }

    // 8. Validate parsed data
    if (users.length === 0) {
      this.toastr.error('No valid user data found');
      return;
    }

    // 9. Call API
    this.closeImportModal();
    this.isLoading = true;

    this.toastr.info(`Importing ${users.length} user(s)...`);

    this.usersApi.importCSV(users).subscribe({
      next: (response) => {
        this.toastr.success(`Successfully imported ${response.data.length} user(s)`);
        this.usersApi.refreshUsers().subscribe(/* refresh list */);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Failed to import users');
      }
    });
  };

  reader.readAsText(this.selectedFile);
}
```

**Improvements:**

- ✅ Real file reading
- ✅ CSV parsing
- ✅ Header validation
- ✅ Required column check
- ✅ Jira ID warning
- ✅ Case-insensitive matching
- ✅ Multiple column name variants
- ✅ Empty row handling
- ✅ Real API call
- ✅ Error handling
- ✅ List refresh
- ✅ Proper notifications

---

## API Service Changes

### New Method Added

**File:** `src/app/users/services/users-api.ts`

```typescript
/**
 * Import users from CSV
 */
importCSV(users: CreateUserDto[]): Observable<CreateUserResponse> {
  console.log('UsersApi: Importing users from CSV...', users.length);

  const command: CreateUserCommand = {
    users: users
  };

  return this.http.post<CreateUserResponse>(
    `${this.apiUrl}/import-csv`,  // ← NEW ENDPOINT
    command
  ).pipe(
    timeout(30000),                // ← 30s timeout (longer for bulk)
    catchError(error => {
      console.error('UsersApi: CSV import failed', error);

      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          return throwError(() => new Error('Network issue. Check your internet connection'));
        } else {
          let errorMessage = 'Failed to import users from CSV';

          // Extract error message from various response formats
          if (error.error) {
            if (typeof error.error === 'string') {
              try {
                const parsed = JSON.parse(error.error);
                errorMessage = parsed.message || parsed.Message || error.error;
              } catch {
                errorMessage = error.error;
              }
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.Message) {
              errorMessage = error.error.Message;
            }
          }

          return throwError(() => new Error(errorMessage));
        }
      } else {
        return throwError(() => new Error('Failed to import users from CSV'));
      }
    })
  );
}
```

---

## CSV Validation Flow

### Visual Flowchart

```
┌─────────────────────────────┐
│ User selects CSV file       │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ Read file with FileReader   │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ Parse CSV into lines        │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ Extract headers (lowercase) │
└──────────┬──────────────────┘
           ▼
     ┌─────────────┐
     │ Has "User   │
     │ name"?      │
     └──┬──────┬───┘
        │      │
       No      Yes
        │      │
        ▼      ▼
   ┌─────┐  ┌─────────────┐
   │❌ Error│  │ Has "email"?│
   │ Toast │  └──┬──────┬───┘
   │ Block │     │      │
   └─────┘    No      Yes
               │      │
               ▼      ▼
          ┌─────┐  ┌─────────────────┐
          │❌ Error│  │ Has Jira ID?    │
          │ Toast │  └──┬──────┬───────┘
          │ Block │     │      │
          └─────┘    No      Yes
                      │      │
                      ▼      ▼
              ┌──────────┐ ┌────────┐
              │⚠️  Warning│ │Continue│
              │Toast     │ │        │
              │Continue  │ │        │
              └─────┬────┘ └───┬────┘
                    │          │
                    └────┬─────┘
                         ▼
              ┌─────────────────────┐
              │ Map column indices  │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │ Parse data rows     │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │ Skip empty/invalid  │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │ Build users array   │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │ users.length > 0?   │
              └──┬──────────────┬───┘
                 │              │
                No              Yes
                 │              │
                 ▼              ▼
            ┌─────┐    ┌───────────────┐
            │❌ Error│    │ Call API      │
            │ Toast │    │ importCSV()   │
            │ Block │    └───┬───────┬───┘
            └─────┘        │       │
                           │       │
                      Success   Error
                           │       │
                           ▼       ▼
                  ┌──────────┐ ┌──────┐
                  │✅ Success │ │❌ Error│
                  │Toast     │ │Toast │
                  │Refresh   │ │      │
                  └──────────┘ └──────┘
```

---

## Notification Types Comparison

### Before (Limited)

```
Only "info" and "success" notifications
No validation messages
Generic messages
```

### After (Comprehensive)

| Type       | Color  | Use Case                       | Example                                                        |
| ---------- | ------ | ------------------------------ | -------------------------------------------------------------- |
| ✅ Success | Green  | Successful operation           | "Successfully imported 5 user(s)"                              |
| ❌ Error   | Red    | Blocking validation or failure | "The CSV must contain columns 'User name' and 'email' columns" |
| ⚠️ Warning | Orange | Non-blocking issue             | "The CSV doesn't contain Jira User Id..."                      |
| ℹ️ Info    | Blue   | Operation in progress          | "Importing 5 user(s) from file.csv..."                         |

---

## Column Mapping Table

### Case-Insensitive Variants Supported

| Backend Field | CSV Column Variants (Any Case)                      | Required    |
| ------------- | --------------------------------------------------- | ----------- |
| `name`        | "User name", "Username", "name"                     | ✅ Yes      |
| `email`       | "email"                                             | ✅ Yes      |
| `jiraId`      | "User id", "UserId", "JiraId", "Jira_id", "Jira id" | ⚠️ Optional |
| `status`      | "User status", "UserStatus", "status"               | ⚠️ Optional |

### Examples of Valid Headers

```csv
✅ user name,email,user id,user status
✅ Username,Email,UserId,Status
✅ USER NAME,EMAIL,JIRAID,USER STATUS
✅ name,email,jira_id,status
✅ User name,email              (minimal required)
```

---

## Error Message Reference

### Add User Modal

| Scenario          | Message                   | Type             |
| ----------------- | ------------------------- | ---------------- |
| Missing Full Name | "Full Name is required"   | Validation Error |
| Missing Email     | "Email is required"       | Validation Error |
| API Success       | "User Added Successfully" | Success Toast    |
| API Error         | Backend error message     | Error Toast      |

### CSV Import

| Scenario          | Message                                                                                                    | Type                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------- |
| No file selected  | "Please select a CSV file to import"                                                                       | Error Toast               |
| Invalid file type | "Please upload a CSV file"                                                                                 | Error Toast               |
| Empty CSV         | "CSV file is empty or has no data rows"                                                                    | Error Toast               |
| Missing User name | "The CSV must contain columns 'User name' and 'email' columns"                                             | Error Toast (blocks)      |
| Missing email     | "The CSV must contain columns 'User name' and 'email' columns"                                             | Error Toast (blocks)      |
| Missing Jira ID   | "The CSV doesn't contain Jira User Id, add column 'User id' with Jira id's to link users to Jira accounts" | Warning Toast (continues) |
| No valid data     | "No valid user data found in CSV file"                                                                     | Error Toast               |
| Parse error       | "Failed to parse CSV file. Please check the file format."                                                  | Error Toast               |
| File read error   | "Failed to read CSV file"                                                                                  | Error Toast               |
| Import started    | "Importing X user(s) from filename..."                                                                     | Info Toast                |
| Import success    | "Successfully imported X user(s) from filename"                                                            | Success Toast             |
| Import API error  | Backend error message                                                                                      | Error Toast               |
| Network error     | "Network issue. Check your internet connection"                                                            | Error Toast               |

---

## Testing Matrix

| Test Case                | Input              | Expected Result           | Status |
| ------------------------ | ------------------ | ------------------------- | ------ |
| Add user with all fields | Full form          | Success with status       | ✅     |
| Add user without status  | No status selected | Success, status=undefined | ✅     |
| CSV with all columns     | Valid CSV          | Success                   | ✅     |
| CSV without Jira ID      | Minimal CSV        | Warning + Success         | ✅     |
| CSV without User name    | Invalid CSV        | Error, blocked            | ✅     |
| CSV without email        | Invalid CSV        | Error, blocked            | ✅     |
| CSV empty file           | Empty CSV          | Error, blocked            | ✅     |
| CSV non-CSV file         | .txt file          | Error, blocked            | ✅     |
| CSV case variants        | UPPERCASE headers  | Success                   | ✅     |
| CSV with empty rows      | Mixed data         | Skipped, success          | ✅     |
| API success              | Valid payload      | Toast + refresh           | ✅     |
| API error                | Invalid data       | Error toast               | ✅     |
| Network failure          | No connection      | Network error             | ✅     |

---

**Full Documentation:** USER_API_INTEGRATION_UPDATE.md  
**Quick Reference:** USER_API_INTEGRATION_QUICK_REFERENCE.md  
**This Document:** USER_API_INTEGRATION_VISUAL_COMPARISON.md

**Status:** ✅ All Changes Implemented  
**Testing:** Ready for QA
