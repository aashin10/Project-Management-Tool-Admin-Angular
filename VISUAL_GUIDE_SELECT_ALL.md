# Visual Guide: Select All Across Pages Feature

## Before Fix (❌ Bug)

```
Page 1 (showing 10 users)
[ ] Select All
[ ] User 1
[ ] User 2
...
[ ] User 10

User clicks "Select All" ✓

Page 1 (showing 10 users)
[✓] Select All
[✓] User 1
[✓] User 2
...
[✓] User 10

User navigates to Page 2 ➡️

Page 2 (showing 10 users)
[✓] Select All
[ ] User 11  ❌ NOT SELECTED
[ ] User 12  ❌ NOT SELECTED
...
[ ] User 20  ❌ NOT SELECTED

Bulk Actions: "10 users selected" ❌ Wrong!
```

## After Fix (✅ Working)

```
Page 1 (showing 10 users)
[ ] Select All
[ ] User 1
[ ] User 2
...
[ ] User 10

User clicks "Select All" ✓

Page 1 (showing 10 users)
[✓] Select All
[✓] User 1
[✓] User 2
...
[✓] User 10

User navigates to Page 2 ➡️

Page 2 (showing 10 users)
[✓] Select All
[✓] User 11  ✅ SELECTED
[✓] User 12  ✅ SELECTED
...
[✓] User 20  ✅ SELECTED

Bulk Actions: "50 users selected" ✅ Correct!
```

## Checkbox States

### All Selected

```
[✓] Select All (checked)
```

Visual: Checkbox shows full checkmark
State: `isAllSelected() = true`, `isSomeSelected() = false`

### Some Selected (Indeterminate)

```
[▬] Select All (indeterminate)
```

Visual: Checkbox shows horizontal line/dash
State: `isAllSelected() = false`, `isSomeSelected() = true`

### None Selected

```
[ ] Select All (unchecked)
```

Visual: Empty checkbox
State: `isAllSelected() = false`, `isSomeSelected() = false`

## User Workflows

### Workflow 1: Select All and Bulk Delete

1. User opens Users page (50 users total, showing 10 per page)
2. User clicks "Select All" checkbox ✓
3. Bulk actions panel appears: "50 users selected"
4. User navigates through pages - all rows show as selected
5. User clicks "Delete" button in bulk actions
6. Confirmation modal: "You are about to delete 50 users"
7. User confirms - all 50 users deleted ✅

### Workflow 2: Change Items Per Page

1. User clicks "Select All" (10 items per page)
2. 50 users selected
3. User changes dropdown: "Items per page: 50"
4. All 50 users still show as selected ✅
5. Bulk operations work on all 50 users ✅

### Workflow 3: Mixed Page Selections

1. User on Page 1 - selects User 1 and User 2
2. User navigates to Page 3 - selects User 21 and User 22
3. User navigates to Page 5 - selects User 41
4. Bulk actions: "5 users selected"
5. User can suspend/delete these 5 users from different pages ✅

### Workflow 4: Partial Selection to Full Selection

1. User manually selects 45 users across different pages
2. Checkbox shows indeterminate state [▬]
3. User clicks "Select All"
4. Remaining 5 users are added to selection
5. Checkbox shows checked state [✓]
6. All 50 users now selected ✅

## Technical Implementation

### Index Mapping

```typescript
// Paginated Index → Absolute Index
Page 1, Row 0 → Absolute Index 0  (User 1)
Page 1, Row 9 → Absolute Index 9  (User 10)
Page 2, Row 0 → Absolute Index 10 (User 11)
Page 2, Row 9 → Absolute Index 19 (User 20)
Page 3, Row 0 → Absolute Index 20 (User 21)
...

// Formula
absoluteIndex = (currentPage - 1) * itemsPerPage + paginatedIndex

// Example: Page 3, Row 5
absoluteIndex = (3 - 1) * 10 + 5 = 25
```

### Selection Storage

```typescript
// selectedRows is a Set of absolute indices
selectedRows: Set<number> = new Set();

// When all 50 users are selected:
selectedRows = {0, 1, 2, 3, ..., 47, 48, 49}

// Checking if a row is selected:
isRowSelected(paginatedIndex) {
  const absoluteIndex = (currentPage - 1) * itemsPerPage + paginatedIndex;
  return selectedRows.has(absoluteIndex);
}
```

## Testing Scenarios

### ✅ Test Case 1: Basic Select All

- Start: Page 1, 10 items per page, 50 total users
- Action: Click "Select All"
- Expected: selectedRows.size = 50, all rows checked
- Result: PASS ✅

### ✅ Test Case 2: Maintain Selection on Navigation

- Start: All 50 users selected
- Action: Navigate to Page 2, Page 3, Page 4
- Expected: All rows show as selected on each page
- Result: PASS ✅

### ✅ Test Case 3: Items Per Page Change

- Start: All users selected with 10 per page
- Action: Change to 50 items per page
- Expected: All 50 users still selected and visible
- Result: PASS ✅

### ✅ Test Case 4: Indeterminate State

- Start: Select 5 users out of 50
- Action: Check header checkbox state
- Expected: Indeterminate state [▬]
- Result: PASS ✅

### ✅ Test Case 5: Deselect All

- Start: All 50 users selected
- Action: Click "Select All" again
- Expected: selectedRows.size = 0, no rows checked
- Result: PASS ✅

### ✅ Test Case 6: Bulk Delete Across Pages

- Start: All 50 users selected
- Action: Click bulk delete, confirm
- Expected: All 50 users removed from dataset
- Result: PASS ✅

### ✅ Test Case 7: Individual Selection Across Pages

- Start: Page 3
- Action: Select user at index 0 (absolute 20)
- Navigate: Go to Page 1
- Expected: selectedRows contains index 20
- Result: PASS ✅

### ✅ Test Case 8: Selection Persistence

- Start: Select users 1, 5, 10 on Page 1
- Navigate: Page 2, select users 15, 20
- Navigate: Back to Page 1
- Expected: Users 1, 5, 10 still selected
- Result: PASS ✅

## Performance Considerations

### Time Complexity

- `toggleAll()`: O(n) where n = total users
- `toggleRow()`: O(1) - Set add/delete is constant time
- `isRowSelected()`: O(1) - Set lookup is constant time
- `emitSelectionChange()`: O(k) where k = number of selected users

### Space Complexity

- `selectedRows`: O(k) where k = number of selected users
- Best case: O(1) when nothing selected
- Worst case: O(n) when all users selected

### Optimizations

- Using `Set<number>` for O(1) lookups instead of Array.includes() which is O(n)
- Storing indices instead of full user objects saves memory
- Only emitting selected data, not entire dataset

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Accessibility

- ✅ Keyboard navigation: Tab to checkbox, Space to toggle
- ✅ Screen reader: Announces "Select All" and state
- ✅ Visual feedback: Clear checked/unchecked/indeterminate states
- ✅ ARIA attributes: Proper checkbox roles and states
