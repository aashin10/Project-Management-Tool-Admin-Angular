# Users List - Filter Implementation & Export Enhancement

## Date: October 30, 2025

## Overview

Implemented working Type and Status filters in the Users List page with backend integration, and updated the export filename format to match requirements.

---

## Changes Made

### 1. Fixed Filter Functionality ✅

**Problem:**

- Type and Status dropdown filters were visible but not triggering data fetch
- `selectType()` and `selectStatus()` methods were not calling `onFilterChange()`
- Filters appeared to work but data wasn't actually being filtered

**Solution:**

- Updated `selectType()` and `selectStatus()` to call `onFilterChange()`
- This triggers `fetchUsers()` which sends filter values to backend API

**File Modified:** `src/app/users/pages/userslist/userslist.ts`

#### Before:

```typescript
selectType(value: string) {
  this.filterType = value;
  this.showTypeDropdown = false;
  this.resetPagination = true;
  this.updateSelectionsForFilteredUsers();
}

selectStatus(value: string) {
  this.filterStatus = value;
  this.showStatusDropdown = false;
  this.resetPagination = true;
  this.updateSelectionsForFilteredUsers();
}
```

#### After:

```typescript
selectType(value: string) {
  this.filterType = value;
  this.showTypeDropdown = false;
  // Trigger filter change to fetch filtered data
  this.onFilterChange();
}

selectStatus(value: string) {
  this.filterStatus = value;
  this.showStatusDropdown = false;
  // Trigger filter change to fetch filtered data
  this.onFilterChange();
}
```

---

### 2. Backend API Integration ✅

**API Endpoint:** `POST /api/User/paginated`

**Request Format:**

```json
{
  "page": 1,
  "pageSize": 10,
  "sortBy": "name",
  "sortOrder": "asc",
  "type": "Internal", // ✅ Filter by type
  "status": "Active", // ✅ Filter by status
  "searchTerm": "john" // ✅ Search term
}
```

**Implementation in `fetchUsers()` method:**

```typescript
this.retrySubscription = this.usersApi.getPaginatedUsers({
  page: this.paginationState.currentPage,
  pageSize: this.paginationState.pageSize,
  sortBy: this.paginationState.sortBy || 'name',
  sortOrder: this.paginationState.sortOrder || 'asc',
  type: this.filterType || undefined,        // ✅ Sends filter
  status: this.filterStatus || undefined,    // ✅ Sends filter
  searchTerm: this.searchQuery?.trim() || undefined
}).subscribe({...});
```

---

### 3. Filter Behavior ✅

**When User Selects a Filter:**

1. **Type Filter Selected:**

   - Dropdown closes
   - `filterType` updated
   - `onFilterChange()` called
   - Resets to page 1
   - Clears selected users
   - Fetches filtered data from API

2. **Status Filter Selected:**
   - Dropdown closes
   - `filterStatus` updated
   - `onFilterChange()` called
   - Resets to page 1
   - Clears selected users
   - Fetches filtered data from API

**Filter Options:**

**Type Filter:**

- All Types (shows all)
- Internal
- External

**Status Filter:**

- All Status (shows all)
- Active
- Inactive
- Suspended

---

### 4. Export Functionality Enhancement ✅

**Problem:**

- Export filename was `users_export_filtered_2025-10-30.csv`
- Requirement: `users_exported_[date].csv`

**Solution:**

- Updated filename format to `users_exported_YYYY-MM-DD.csv`
- Removed "filtered/selected" suffix
- Simplified format

#### Before:

```typescript
const exportType = this.selectedUsers.length > 0 ? 'selected' : 'filtered';
link.setAttribute(
  'download',
  `users_export_${exportType}_${new Date().toISOString().split('T')[0]}.csv`
);
```

**Example filename:** `users_export_filtered_2025-10-30.csv`

#### After:

```typescript
// Format: users_exported_YYYY-MM-DD.csv
const dateStr = new Date().toISOString().split('T')[0];
link.setAttribute('download', `users_exported_${dateStr}.csv`);
```

**Example filename:** `users_exported_2025-10-30.csv`

---

### 5. Export Respects Active Filters ✅

**Export API Integration:**

The export functionality already uses `getUsersForExport()` which respects active filters:

```typescript
this.usersApi.getUsersForExport({
  type: this.filterType || undefined,        // ✅ Uses active type filter
  status: this.filterStatus || undefined,    // ✅ Uses active status filter
  searchTerm: this.searchQuery?.trim() || undefined  // ✅ Uses active search
}).subscribe({...});
```

**Export Behavior:**

- **No filters active:** Exports all users
- **Type = Internal:** Exports only Internal users
- **Status = Active:** Exports only Active users
- **Type = Internal + Status = Active:** Exports only Active Internal users
- **Search + Filters:** Exports users matching both search and filters

---

## Complete Filter Flow

### User Interaction Flow

```
User clicks Type dropdown
    ↓
Dropdown opens with options: All Types, Internal, External
    ↓
User selects "Internal"
    ↓
selectType('Internal') called
    ↓
filterType = 'Internal'
    ↓
showTypeDropdown = false (dropdown closes)
    ↓
onFilterChange() called
    ↓
Reset to page 1
    ↓
Clear selected users
    ↓
fetchUsers() called
    ↓
API called with type='Internal'
    ↓
Backend returns only Internal users
    ↓
Table updates with filtered data
    ↓
Export will now only export Internal users
```

---

## Testing Guide

### Test Case 1: Type Filter - Internal

**Steps:**

1. Navigate to Users List page
2. Click "Type" dropdown
3. Select "Internal"

**Expected Result:**

```
✅ Dropdown closes
✅ Table shows only Internal users
✅ Pagination resets to page 1
✅ Selected users cleared
✅ API request includes type='Internal'
```

---

### Test Case 2: Status Filter - Active

**Steps:**

1. Navigate to Users List page
2. Click "Status" dropdown
3. Select "Active"

**Expected Result:**

```
✅ Dropdown closes
✅ Table shows only Active users
✅ Pagination resets to page 1
✅ Selected users cleared
✅ API request includes status='Active'
```

---

### Test Case 3: Combined Filters

**Steps:**

1. Navigate to Users List page
2. Select Type = "Internal"
3. Select Status = "Active"

**Expected Result:**

```
✅ Table shows only Active Internal users
✅ Both filters applied
✅ API request includes both:
   - type='Internal'
   - status='Active'
```

---

### Test Case 4: Filter + Search

**Steps:**

1. Navigate to Users List page
2. Select Type = "External"
3. Type "john" in search bar

**Expected Result:**

```
✅ Table shows External users with "john" in name/email
✅ Both filter and search applied
✅ API request includes both:
   - type='External'
   - searchTerm='john'
```

---

### Test Case 5: Clear Filter

**Steps:**

1. Navigate to Users List page
2. Select Type = "Internal"
3. Click "Type" dropdown again
4. Select "All Types"

**Expected Result:**

```
✅ Filter cleared
✅ Table shows all users (all types)
✅ API request with type=undefined
```

---

### Test Case 6: Export with No Filters

**Steps:**

1. Navigate to Users List page
2. Ensure no filters are active
3. Click "Export" button

**Expected Result:**

```
✅ File downloads as: users_exported_2025-10-30.csv
✅ File contains all users
✅ API called without type/status filters
```

---

### Test Case 7: Export with Type Filter

**Steps:**

1. Navigate to Users List page
2. Select Type = "Internal"
3. Click "Export" button

**Expected Result:**

```
✅ File downloads as: users_exported_2025-10-30.csv
✅ File contains ONLY Internal users
✅ API called with type='Internal'
```

---

### Test Case 8: Export with Status Filter

**Steps:**

1. Navigate to Users List page
2. Select Status = "Active"
3. Click "Export" button

**Expected Result:**

```
✅ File downloads as: users_exported_2025-10-30.csv
✅ File contains ONLY Active users
✅ API called with status='Active'
```

---

### Test Case 9: Export with Multiple Filters

**Steps:**

1. Navigate to Users List page
2. Select Type = "External"
3. Select Status = "Inactive"
4. Click "Export" button

**Expected Result:**

```
✅ File downloads as: users_exported_2025-10-30.csv
✅ File contains ONLY Inactive External users
✅ API called with:
   - type='External'
   - status='Inactive'
```

---

### Test Case 10: Export with Search + Filters

**Steps:**

1. Navigate to Users List page
2. Select Type = "Internal"
3. Search for "smith"
4. Click "Export" button

**Expected Result:**

```
✅ File downloads as: users_exported_2025-10-30.csv
✅ File contains ONLY Internal users with "smith" in name/email
✅ API called with:
   - type='Internal'
   - searchTerm='smith'
```

---

## Filter States

### No Filters Active

```typescript
filterType = '';
filterStatus = '';
```

**API Request:**

```json
{
  "page": 1,
  "pageSize": 10,
  "sortBy": "name",
  "sortOrder": "asc",
  "type": undefined,
  "status": undefined
}
```

---

### Type Filter Active

```typescript
filterType = 'Internal';
filterStatus = '';
```

**API Request:**

```json
{
  "page": 1,
  "pageSize": 10,
  "sortBy": "name",
  "sortOrder": "asc",
  "type": "Internal",
  "status": undefined
}
```

---

### Status Filter Active

```typescript
filterType = '';
filterStatus = 'Active';
```

**API Request:**

```json
{
  "page": 1,
  "pageSize": 10,
  "sortBy": "name",
  "sortOrder": "asc",
  "type": undefined,
  "status": "Active"
}
```

---

### Both Filters Active

```typescript
filterType = 'External';
filterStatus = 'Inactive';
```

**API Request:**

```json
{
  "page": 1,
  "pageSize": 10,
  "sortBy": "name",
  "sortOrder": "asc",
  "type": "External",
  "status": "Inactive"
}
```

---

## Export Filename Examples

### Export on Different Dates

**October 30, 2025:**

```
users_exported_2025-10-30.csv
```

**November 15, 2025:**

```
users_exported_2025-11-15.csv
```

**December 31, 2025:**

```
users_exported_2025-12-31.csv
```

---

## Benefits

✅ **Working Filters** - Type and Status filters now properly fetch filtered data  
✅ **Backend Integration** - Filters integrated with `/api/User/paginated` endpoint  
✅ **Smart Export** - Only exports users matching active filters  
✅ **Consistent Filename** - Simplified export filename format  
✅ **Better UX** - Pagination resets and selections clear on filter change  
✅ **Combined Filtering** - Works with search and multiple filters

---

## Technical Implementation

### Filter Change Method

```typescript
onFilterChange() {
  console.log('Filters changed - Type:', this.filterType, 'Status:', this.filterStatus);
  // Reset to page 1 when filters change
  this.paginationState.currentPage = 1;

  // Clear selected users when filters change
  this.selectedUsers = [];

  this.fetchUsers();
}
```

**What it does:**

1. Logs filter values for debugging
2. Resets pagination to page 1
3. Clears selected users (they might not exist on new page)
4. Calls `fetchUsers()` to get filtered data

---

### Fetch Users with Filters

```typescript
fetchUsers() {
  // ... loading state setup

  this.retrySubscription = this.usersApi.getPaginatedUsers({
    page: this.paginationState.currentPage,
    pageSize: this.paginationState.pageSize,
    sortBy: this.paginationState.sortBy || 'name',
    sortOrder: this.paginationState.sortOrder || 'asc',
    type: this.filterType || undefined,        // Empty string becomes undefined
    status: this.filterStatus || undefined,    // Empty string becomes undefined
    searchTerm: this.searchQuery?.trim() || undefined
  }).subscribe({...});
}
```

**Logic:**

- Empty filter values (`''`) are converted to `undefined`
- Backend treats `undefined` as "no filter"
- Only sends filter values when actually set

---

### Export with Filters

```typescript
exportToCSV() {
  // ... loading state

  this.usersApi.getUsersForExport({
    type: this.filterType || undefined,
    status: this.filterStatus || undefined,
    searchTerm: this.searchQuery?.trim() || undefined
  }).subscribe({
    next: (users) => {
      // ... CSV generation

      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `users_exported_${dateStr}.csv`);

      // ... download
    }
  });
}
```

**Logic:**

- Uses same filter values as table display
- Ensures exported data matches what user sees
- Simplified filename without type suffix

---

## Files Modified

1. ✅ `src/app/users/pages/userslist/userslist.ts`
   - Fixed `selectType()` to call `onFilterChange()`
   - Fixed `selectStatus()` to call `onFilterChange()`
   - Updated export filename format to `users_exported_[date].csv`

---

## Summary

✅ **Type filter working** - Properly filters by Internal/External  
✅ **Status filter working** - Properly filters by Active/Inactive/Suspended  
✅ **Combined filters working** - Can filter by Type AND Status simultaneously  
✅ **Export respects filters** - Only exports users matching active filters  
✅ **Filename updated** - Now uses format `users_exported_YYYY-MM-DD.csv`  
✅ **Backend integrated** - All filters sent to `/api/User/paginated` endpoint  
✅ **No compilation errors** - All changes verified

The Users List page now has fully functional Type and Status filters with proper backend integration, and the export functionality uses the correct filename format while respecting all active filters.

---

For questions or issues, contact the development team.
