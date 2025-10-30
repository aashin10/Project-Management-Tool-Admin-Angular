# User API Integration - Quick Reference

**Date:** October 29, 2025  
**Status:** ✅ Completed

---

## Summary of Changes

### 1. Add User Modal

✅ Added `status` field to payload  
✅ Field order: `email`, `name`, `jiraId`, `type`, `status`, `createdBy`

### 2. CSV Import

✅ New endpoint: `/api/User/import-csv`  
✅ CSV parsing with validation  
✅ Column mapping: `User id` → `jiraId`, `User name` → `name`

---

## Quick Test Guide

### Test Add User

1. Open "Add User" modal
2. Fill in all fields including Status dropdown
3. Submit
4. Check Network tab → Verify status is in payload

**Expected Payload:**

```json
{
  "users": [
    {
      "email": "test@test.com",
      "name": "Test User",
      "jiraId": "JIRA-001",
      "type": "Internal",
      "status": "Active",
      "createdBy": 1
    }
  ]
}
```

---

### Test CSV Import

#### Valid CSV (All columns)

```csv
User id,User name,email,User status
JIRA-001,John Doe,john@test.com,Active
```

**Result:** ✅ Success

#### Valid CSV (Minimal)

```csv
User name,email
John Doe,john@test.com
```

**Result:** ⚠️ Warning about Jira ID, ✅ Import proceeds

#### Invalid CSV (Missing required)

```csv
User id,User status
JIRA-001,Active
```

**Result:** ❌ Error: "Must contain 'User name' and 'email' columns"

---

## Validation Rules

| Rule                       | Type       | Message       |
| -------------------------- | ---------- | ------------- |
| Missing User name or email | ❌ Error   | Blocks import |
| Missing Jira ID            | ⚠️ Warning | Allows import |
| Empty file                 | ❌ Error   | Blocks import |
| Invalid file type          | ❌ Error   | Blocks import |

---

## API Endpoints

### Add User

```
POST http://localhost:7178/api/User
Content-Type: application/json

{
  "users": [{ "email": "...", "name": "...", "status": "..." }]
}
```

### Import CSV

```
POST http://localhost:7178/api/User/import-csv
Content-Type: application/json

{
  "users": [
    { "jiraId": "...", "name": "...", "email": "...", "status": "..." }
  ]
}
```

---

## Files Modified

1. **users-api.ts**

   - Added `status` to `CreateUserDto`
   - Added `importCSV()` method

2. **userslist.ts**
   - Updated `submitNewUser()` with status
   - Implemented `submitImport()` with validation

---

## Toaster Messages

### Errors (Red)

- "The CSV must contain columns 'User name' and 'email' columns"
- "Please select a CSV file to import"
- "Failed to import users from CSV"

### Warnings (Orange)

- "The CSV doesn't contain Jira User Id, add column 'User id'..."

### Success (Green)

- "User Added Successfully"
- "Successfully imported X user(s) from filename"

### Info (Blue)

- "Importing X user(s) from filename..."

---

## Troubleshooting

**Issue:** Status not sent  
**Fix:** Check `newUser.status` is populated from dropdown

**Issue:** CSV validation not working  
**Fix:** Check headers are lowercase, verify column names

**Issue:** Import returns 404  
**Fix:** Verify backend endpoint `/api/User/import-csv` exists

**Issue:** No toasters  
**Fix:** Check ngx-toastr is imported and configured

---

## Testing Checklist

- [ ] Add user with status → Success
- [ ] Add user without status → Success (undefined)
- [ ] Import CSV with all columns → Success
- [ ] Import CSV without Jira ID → Warning + Success
- [ ] Import CSV without User name → Error blocked
- [ ] Import CSV without email → Error blocked
- [ ] Import empty CSV → Error blocked
- [ ] Import non-CSV file → Error blocked
- [ ] Case-insensitive headers work → Success
- [ ] Network tab shows correct payload → Verified

---

**Full Documentation:** USER_API_INTEGRATION_UPDATE.md  
**Implementation:** ✅ Complete  
**Testing:** Ready
