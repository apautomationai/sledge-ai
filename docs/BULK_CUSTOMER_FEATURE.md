# Bulk Customer Assignment Feature

## Overview
Added a customer dropdown to the bulk change type action in the jobs detail page. This allows users to assign a customer to multiple line items at once.

## Changes Made

### 1. Updated State Management
**File:** `apps/main/components/invoice-process/invoice-details-form.tsx`

Added new state variables:
```typescript
const [bulkCustomerId, setBulkCustomerId] = useState<string | null>(null);
const [bulkCustomers, setBulkCustomers] = useState<any[]>([]);
```

### 2. Added Customer Loading Function
```typescript
const loadBulkCustomers = async () => {
  setIsLoadingBulkData(true);
  try {
    const customersData = await fetchQuickBooksCustomers();
    setBulkCustomers(customersData);
  } catch (error) {
    console.error("Error loading customers:", error);
    toast.error("Failed to load customers");
  } finally {
    setIsLoadingBulkData(false);
  }
};
```

### 3. Updated Bulk Change Handler
Modified `handleApplyBulkChange` to include customer ID:
```typescript
await Promise.all(
  Array.from(selectedLineItems).map((lineItemId) =>
    client.patch(`/api/v1/invoice/line-items/${lineItemId}`, {
      itemType: bulkItemType,
      resourceId: bulkResourceId,
      customerId: bulkCustomerId, // NEW: Apply customer to all selected items
    })
  )
);
```

### 4. Added Customer Dropdown to Dialog
Added a new customer autocomplete field in the bulk change dialog:
```tsx
<div className="space-y-2">
  <Label>Customer (Optional)</Label>
  <LineItemAutocomplete
    items={bulkCustomers}
    value={bulkCustomerId}
    onSelect={(id) => setBulkCustomerId(id)}
    placeholder="Search customers..."
    isLoading={isLoadingBulkData}
    getDisplayName={(customer: QuickBooksCustomer) =>
      customer.DisplayName || customer.CompanyName || `Customer ${customer.Id}`
    }
  />
  <p className="text-xs text-muted-foreground">
    This customer will be applied to all selected line items
  </p>
</div>
```

### 5. Updated Dialog Initialization
Modified dialog open handler to load customers:
```typescript
onOpenChange={(open) => {
  setShowChangeTypeDialog(open);
  if (open) {
    // Load customers when dialog opens
    if (bulkCustomers.length === 0) {
      loadBulkCustomers();
    }
    // ... existing code
  }
}}
```

### 6. Updated State Reset
Added customer state reset in all cleanup handlers:
```typescript
setBulkCustomerId(null);
```

## User Flow

### Before
1. Select multiple line items
2. Click "Change Type" bulk action
3. Select item type (Account/Product)
4. Select account or product
5. Apply changes

### After
1. Select multiple line items
2. Click "Change Type" bulk action
3. Select item type (Account/Product)
4. Select account or product
5. **Select customer (optional)** ← NEW
6. Apply changes
7. **Customer is applied to all selected line items** ← NEW

## UI Changes

### Bulk Change Dialog
```
┌─────────────────────────────────────┐
│ Change Item Type                    │
├─────────────────────────────────────┤
│                                     │
│ Item Type                           │
│ [Account ▼]                         │
│                                     │
│ Account                             │
│ [Search accounts...]                │
│                                     │
│ Customer (Optional)          ← NEW  │
│ [Search customers...]        ← NEW  │
│ This customer will be applied       │
│ to all selected line items   ← NEW  │
│                                     │
│         [Cancel] [Apply to Selected]│
└─────────────────────────────────────┘
```

## API Integration

### QuickBooks Service
Uses existing `fetchQuickBooksCustomers()` function from:
- `apps/main/lib/services/quickbooks.service.ts`

### Customer Type
```typescript
export interface QuickBooksCustomer {
  Id: string;
  DisplayName: string;
  FullyQualifiedName?: string;
  CompanyName?: string;
  GivenName?: string;
  FamilyName?: string;
  Active: boolean;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  Balance?: number;
}
```

### Line Item Update
Sends PATCH request to `/api/v1/invoice/line-items/{id}` with:
```json
{
  "itemType": "account" | "product",
  "resourceId": "123",
  "customerId": "456"  // NEW field
}
```

## Benefits

1. **Time Saving**: Assign customer to multiple line items at once
2. **Consistency**: Ensures all selected items have the same customer
3. **Flexibility**: Customer field is optional
4. **User-Friendly**: Uses same autocomplete component as other fields
5. **Efficient**: Loads customers only when dialog opens

## Testing Scenarios

### Test 1: Assign Customer to Multiple Items
1. Go to jobs detail page
2. Select 3 line items
3. Click "Change Type" bulk action
4. Select item type and account/product
5. Select a customer from dropdown
6. Click "Apply to Selected"
7. **Expected**: All 3 items now have the selected customer

### Test 2: Change Customer for Existing Items
1. Select line items that already have customers
2. Open bulk change dialog
3. Select a different customer
4. Apply changes
5. **Expected**: All items updated with new customer

### Test 3: Optional Customer Field
1. Select line items
2. Open bulk change dialog
3. Select item type and account/product
4. Leave customer field empty
5. Apply changes
6. **Expected**: Items updated with type/account, customer unchanged

### Test 4: Customer Loading
1. Open bulk change dialog
2. **Expected**: Customer dropdown shows loading state
3. **Expected**: Customers populate after loading
4. **Expected**: Can search/filter customers

## Error Handling

- If customer loading fails, shows toast error
- Dialog remains functional without customers
- Customer field is optional, so bulk change works without it
- Network errors are caught and displayed to user

## Future Enhancements

1. **Bulk Customer Only**: Add option to change only customer without changing type
2. **Customer Filtering**: Filter customers by active status
3. **Recent Customers**: Show recently used customers first
4. **Customer Details**: Show customer balance/email in dropdown
5. **Bulk Clear**: Option to clear customer from selected items
