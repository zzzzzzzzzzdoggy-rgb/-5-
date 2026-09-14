# Security Specification & Threat Model

## 1. Data Invariants
1. **Catalog Integrity (Products)**:
   - Anyone (guests & customers) can read the product catalog (`/products/{productId}`) to view beetles, gallery photos, and remaining stock.
   - Products can only be created, modified, or deleted by authorized administrators (`isAdmin()`).
   - Stock quantities, prices, and photo URLs must conform to valid types and bounds.

2. **Order Integrity (Orders)**:
   - Anyone can create an order with valid fields (`id`, `createdAt`, `customerName`, `customerPhone`, `customerAddress`, `items`, `totalAmount`, `status: 'pending_payment' | 'paid_verified'`).
   - Customers or admins can read their placed order if matched or if admin.
   - Order statuses can only be transitioned into valid statuses (`pending_payment`, `paid_verified`, `preparing`, `shipped`, `cancelled`).

3. **Visitor Counter Integrity (Stats)**:
   - Anyone can read the visitor count (`/stats/visitors`).
   - The visitor counter must be a valid number and cannot be initialized or reset below 200.

## 2. The "Dirty Dozen" Threat Payloads
1. **Negative Stock Injection**: Attacker attempts to write a product with `stock = -10` to trigger stock errors.
2. **Arbitrary Price Spoofing**: Attacker tries to update price of Set 2 to `0.01` without admin authentication.
3. **Payload Bloating (Denial of Wallet)**: Attacker attempts to post a product name with 100,000 characters.
4. **Order Status Hijack**: Non-admin user attempts to mark an order as `shipped` or `paid_verified` without paying.
5. **Catalog Wipeout**: Unauthenticated attacker attempts `delete` on `/products/set-1`.
6. **Negative Total Amount on Order**: Order created with `totalAmount = -500`.
7. **Malformed Phone Number Payload**: Phone string containing 5,000 characters or binary code.
8. **Privilege Escalation via Document ID**: Attacker attempts to write to an unauthorized collection or `/admins/` document.
9. **Shadow Field Injection in Product**: Injecting arbitrary extra fields into the product document schema.
10. **Orphaned Order Creation**: Creating an order without items or total amount.
11. **Order Mutation by Third Party**: Updating another user's customer address or changing the items after order creation.
12. **Root Collection Overwrite**: Attempting to write into undefined paths (`/{document=**}`).
