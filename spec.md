# Cargivo

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Customer registration with: Company Name, GST Number, Email, Password, Address, Phone Number, Contact Name
- Customer login/logout via authorization component
- Quote Request form: Box Type (Metal/Wooden/Plastic/Custom), Length x Width x Height, Material, Quantity, Drawing/Photo upload, Delivery Location
- Admin dashboard: view all quote requests, manage quotations (enter price + GST), mark orders as confirmed/in-production/delivered
- Customer dashboard: view submitted quote requests, view received quotations, approve/reject quotes, view order status
- Order management: track order status (Pending Quote → Quote Sent → Approved → Advance Paid → In Production → Delivered → Completed)
- Invoice generation: GST invoice with Company Name, GST Number, Product Description, Quantity, Price, GST breakdown
- Role-based access: customer role and admin role

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: User profiles (customer registration fields), QuoteRequest (box specs, dimensions, material, qty, delivery, file ref), Quotation (price, GST, admin notes), Order (status tracking), Invoice data
2. Backend: Role-based access (admin vs customer), CRUD for quote requests and quotations
3. Frontend: Landing page with value proposition and CTA
4. Frontend: Registration/login pages with full customer profile fields
5. Frontend: Customer dashboard - submit quote request (with file upload), view requests + quotation status
6. Frontend: Admin dashboard - view all requests, enter quotation prices, update order status
7. Frontend: Quote approval flow for customers
8. Frontend: Invoice view/print page with GST breakdown
