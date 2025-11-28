# Payment Page Test Examples

This file contains example URLs with query parameters that banks typically return for testing payment success and failure pages.

## Success Payment Examples

### Example 1: ZarinPal Gateway (Iran)
```
/payment/success?status=success&Authority=A000000000000000000000000000000000000&Status=100&RefID=123456789012345678901234567890
```

### Example 2: Turkish Bank Gateway (BKM Standard)
```
/payment/success?status=success&payment_id=123&TransactionId=ABC123XYZ&Reference=REF456&AuthCode=AUTH789&HostRefNum=HOST123&ProcReturnCode=00&RRN=987654321
```

### Example 3: Generic Gateway
```
/payment/success?status=success&payment_id=123&transaction_id=TXN-ABC-123&reference=REF-456&auth_code=AUTH-789&order_id=ORD-001&basket_id=BASKET-001&card_hash=HASH123&card_pan=1234****5678&rrn=987654321&trace_no=123456
```

### Example 4: Minimal Success
```
/payment/success?status=success&payment_id=123&transaction_id=TXN123
```

## Failure Payment Examples

### Example 1: ZarinPal Gateway (Iran) - User Cancelled
```
/payment/failure?status=failed&Authority=A000000000000000000000000000000000000&Status=-9&Message=User%20cancelled%20the%20payment
```

### Example 2: Turkish Bank Gateway - Insufficient Funds
```
/payment/failure?status=failed&payment_id=123&TransactionId=ABC123XYZ&ErrorCode=51&ErrorMessage=Insufficient%20funds&ProcReturnCode=51&HostRefNum=HOST123
```

### Example 3: Generic Gateway - Payment Failed
```
/payment/failure?status=failed&payment_id=123&transaction_id=TXN-ABC-123&error_code=PAYMENT_FAILED&error_message=Payment%20processing%20failed&order_id=ORD-001&basket_id=BASKET-001
```

### Example 4: Minimal Failure
```
/payment/failure?status=failed&error_code=ERROR123&error_message=Payment%20failed
```

### Example 5: Timeout Error
```
/payment/failure?status=timeout&payment_id=123&error_code=TIMEOUT&error_message=Payment%20request%20timed%20out&transaction_id=TXN-TIMEOUT-123
```

## Testing Instructions

1. **Success Page Testing:**
   - Navigate to: `/payment/success?status=success&payment_id=123&transaction_id=TXN123&reference=REF456`
   - The page should display all parameters and attempt to fetch payment details from backend

2. **Failure Page Testing:**
   - Navigate to: `/payment/failure?status=failed&error_code=51&error_message=Insufficient%20funds&transaction_id=TXN456`
   - The page should display error information and all URL parameters

3. **With Payment ID (Backend Fetch):**
   - Use a real payment ID from your database
   - Example: `/payment/success?payment_id=1` (where 1 is a valid payment ID)
   - The page will attempt to fetch full payment details including gateway responses

## Common Bank Gateway Parameters

### Success Parameters:
- `status` / `Status` - Payment status (success, completed, etc.)
- `transaction_id` / `TransactionId` / `TransId` / `Authority` - Gateway transaction ID
- `reference` / `Reference` / `RefNum` - Reference number
- `auth_code` / `AuthCode` - Authorization code
- `rrn` / `RRN` - Retrieval Reference Number
- `host_ref_num` / `HostRefNum` - Host reference number
- `proc_return_code` / `ProcReturnCode` - Processing return code (00 = success)
- `card_hash` / `CardHash` - Card hash (masked)
- `card_pan` / `CardPan` - Card PAN (masked)

### Failure Parameters:
- `status` / `Status` - Payment status (failed, error, etc.)
- `error_code` / `ErrorCode` / `ResCode` - Error code
- `error_message` / `ErrorMessage` / `ErrMsg` / `Message` - Error message
- `transaction_id` / `TransactionId` - Transaction ID (if available)
- `proc_return_code` / `ProcReturnCode` - Processing return code (non-zero = error)

## Notes

- All parameters are case-insensitive in the code (handles both camelCase and snake_case)
- The pages will display all URL parameters in a "Bank Gateway Parameters" section
- If `payment_id` is provided, the page will attempt to fetch full payment details from the backend
- Gateway response details from the database will be shown if available
- URL parameters are always displayed as a fallback if backend data is not available

