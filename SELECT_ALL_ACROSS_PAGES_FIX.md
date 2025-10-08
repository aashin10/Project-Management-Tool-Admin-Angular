# Select All Across Pages - Bug Fix Documentation

## Problem

When clicking the "Select All" checkbox in the users list table, only the 10 users on the current page were being selected instead of all 50 users across all pages. When changing the items per page from 10 to 50, the previously selected users from other pages were not maintained.

## Root Cause

The table component was tracking selected rows using paginated indices (0-9 for each page) instead of absolute indices in the full dataset. This meant:

1. Selections were lost when navigating between pages
2. The `toggleAll()` function only selected visible rows on the current page
3. The `emitSelectionChange()` only emitted data from the current paginated view

## Solution

### Changes Made to `table.ts`

#### 1. Updated `toggleAll()` method

**Before:** Had conditional logic that only selected current page items when `selectAllAcrossPages` was false

```typescript
toggleAll() {
  if (this.selectAllAcrossPages) {
    // Select all across pages
  } else {
    // Only select current page
  }
}
```

**After:** Always selects all items across all pages

```typescript
toggleAll() {
  // Always select/deselect all items across all pages
  const allSelected = this.selectedRows.size === this.data.length;

  if (allSelected) {
    // Unselect all
    this.selectedRows.clear();
  } else {
    // Select all items across all pages
    this.selectedRows.clear();
    for (let i = 0; i < this.data.length; i++) {
      this.selectedRows.add(i);
    }
  }
  this.emitSelectionChange();
}
```

#### 2. Updated `toggleRow()` method

**Before:** Used paginated indices

```typescript
toggleRow(index: number) {
  if (this.selectedRows.has(index)) {
    this.selectedRows.delete(index);
  } else {
    this.selectedRows.add(index);
  }
}
```

**After:** Converts paginated index to absolute index

```typescript
toggleRow(index: number) {
  // Convert paginated index to absolute index in full dataset
  const absoluteIndex = (this.currentPage - 1) * this.itemsPerPage + index;

  if (this.selectedRows.has(absoluteIndex)) {
    this.selectedRows.delete(absoluteIndex);
  } else {
    this.selectedRows.add(absoluteIndex);
  }
  this.emitSelectionChange();
}
```

#### 3. Updated `isRowSelected()` method

**Before:** Checked paginated indices

```typescript
isRowSelected(index: number): boolean {
  return this.selectedRows.has(index);
}
```

**After:** Converts to absolute index before checking

```typescript
isRowSelected(index: number): boolean {
  // Convert paginated index to absolute index in full dataset
  const absoluteIndex = (this.currentPage - 1) * this.itemsPerPage + index;
  return this.selectedRows.has(absoluteIndex);
}
```

#### 4. Updated `emitSelectionChange()` method

**Before:** Emitted data from paginated view only

```typescript
emitSelectionChange() {
  const selectedData = Array.from(this.selectedRows).map(index => this.paginatedData[index]);
  this.selectionChange.emit(selectedData);
}
```

**After:** Emits data from full dataset using absolute indices

```typescript
emitSelectionChange() {
  const selectedData = Array.from(this.selectedRows).map(index => this.data[index]);
  this.selectionChange.emit(selectedData);
}
```

#### 5. Added helper methods for checkbox state

```typescript
isAllSelected(): boolean {
  return this.data.length > 0 && this.selectedRows.size === this.data.length;
}

isSomeSelected(): boolean {
  return this.selectedRows.size > 0 && this.selectedRows.size < this.data.length;
}
```

#### 6. Enhanced `ngOnChanges()` lifecycle hook

```typescript
ngOnChanges(changes: SimpleChanges): void {
  if (changes['clearSelections'] && changes['clearSelections'].currentValue === true) {
    this.selectedRows.clear();
    this.emitSelectionChange();
  }

  // When data changes, clear selections that are out of bounds
  if (changes['data'] && this.selectedRows.size > 0) {
    const validIndices = new Set<number>();
    this.selectedRows.forEach(index => {
      if (index < this.data.length) {
        validIndices.add(index);
      }
    });
    this.selectedRows = validIndices;
  }
}
```

### Changes Made to `table.html`

Updated the select all checkbox to show proper checked/indeterminate state:

```html
<input
  type="checkbox"
  class="rounded border-gray-300"
  [checked]="isAllSelected()"
  [indeterminate]="isSomeSelected()"
  (change)="toggleAll()"
/>
```

## Testing

### New Test Suite Added

Added comprehensive test suite "Select All Across Pages" with 8 new tests in `userslist.spec.ts`:

1. ✅ **should select all 50 users when select all checkbox is clicked**
2. ✅ **should maintain selection when changing pages**
3. ✅ **should show correct selection when changing items per page**
4. ✅ **should show indeterminate state when some but not all users are selected**
5. ✅ **should deselect all users when clicking select all checkbox when all are selected**
6. ✅ **should emit selection change with all selected users across pages**
7. ✅ **should select individual user on different page correctly**
8. ✅ **should handle bulk delete with users selected across multiple pages**

### Test Results

- **Userslist Component:** All 71 tests passing (63 original + 8 new)
- **Table Component:** All tests passing

## How It Works Now

### Scenario 1: Select All with 10 Items Per Page

1. User clicks "Select All" checkbox
2. All 50 users are selected (stored as indices 0-49)
3. User navigates to page 2
4. Rows on page 2 show as selected (indices 10-19 are checked against absolute indices)
5. Bulk actions panel shows "50 users selected"

### Scenario 2: Change Items Per Page After Selection

1. User clicks "Select All" with 10 items per page
2. All 50 users selected (indices 0-49 stored)
3. User changes to 50 items per page
4. All 50 users still show as selected
5. Bulk operations work on all 50 users

### Scenario 3: Individual Selections Across Pages

1. User navigates to page 3
2. User selects user at index 0 on page 3 (absolute index 20)
3. User navigates to page 1
4. Selection on page 3 is maintained
5. User can perform bulk operations on selected users from different pages

## Benefits

1. **✅ Consistent behavior:** All users across all pages can be selected
2. **✅ Persistent selections:** Selections are maintained when navigating pages
3. **✅ Correct bulk operations:** Bulk delete/suspend works on all selected users
4. **✅ Visual feedback:** Checkbox shows checked/indeterminate state correctly
5. **✅ Scalable:** Works regardless of items per page setting
6. **✅ Intuitive UX:** Users expect "Select All" to select ALL items, not just current page

## Impact

- **Users affected:** All users working with the users list page
- **Breaking changes:** None - existing functionality enhanced
- **Performance:** No significant impact - using Set for O(1) lookups
- **Accessibility:** Improved - checkbox state properly reflects selection

## Browser Testing Checklist

- [ ] Select all users with 10 items per page
- [ ] Navigate to different pages - verify selections maintained
- [ ] Change items per page to 50 - verify all still selected
- [ ] Perform bulk delete on selected users across pages
- [ ] Perform bulk suspend on selected users across pages
- [ ] Select individual users from different pages
- [ ] Verify selection count in bulk actions panel
- [ ] Test select all → deselect all behavior
- [ ] Test indeterminate state with partial selections
