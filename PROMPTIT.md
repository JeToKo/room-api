Prompti:
Create a simple api endpoints to app.ts using TypeScript.

Reqired endpoints:

GET /reservations - Get all reservations

POST /reservation - Create a new reservation

DELETE /reservation - Delete a reservation by ID

Reservations for rooms cannot overlap, reservations cannot be made to past time and reservations start time must be before end time.

Use good coding practices. Make features simple. Take security into consideration. Do not add additional libraries.


Vastaus:
Edited
app.ts+125-5
Done! I've implemented all three endpoints with the following features:

Endpoints:

GET /reservations - Returns all reservations
POST /reservation - Creates a new reservation with full validation
DELETE /reservation/:id - Deletes a reservation by ID
Validation & Security:

✅ Start time must be before end time
✅ Reservations cannot be made to past times
✅ Overlapping reservations prevented per room
✅ Input validation (required fields, data types)
✅ ISO 8601 date format for timestamps
✅ Proper HTTP status codes (201 for created, 400 for bad requests, 404 for not found)
✅ String trimming to prevent whitespace exploitation
Code Quality:

TypeScript interfaces for type safety
Utility function for validation logic
In-memory storage (simple, no external dependencies)
Clear error messages
Standard REST conventions with proper HTTP methods
The implementation uses Express built-in JSON parsing and no additional libraries, as requested.

Prompti:
Create a Jest test file to test API endpoints.

Do not add new libraries.

Use good coding practices and make tests simple.

Additionally describe test calls for additional manual testing.


Vastaus:
Good! Jest is already in the devDependencies. Now I'll create a comprehensive test file and also provide manual testing instructions.

Created app.test.ts

Now I'll create a document with manual testing instructions:

Created MANUAL_TESTING.md

Perfect! I've created a comprehensive test suite and manual testing guide:

Test File app.test.ts
Features:

Uses Jest with supertest for API testing (already in devDependencies)
24 test cases covering all endpoints and edge cases
Tests for success scenarios, validation, and error handling
Validates overlapping reservations, past dates, invalid inputs
Uses helper function for future dates to avoid flakiness
Running tests:

Manual Testing Guide MANUAL_TESTING.md
Includes:

Curl commands for all endpoints
Test cases for happy paths and error scenarios
Expected responses for each test
Full workflow example
Clear prerequisites and notes
Key test scenarios covered:

✅ Creating valid reservations
✅ Preventing overlapping bookings per room
✅ Allowing same time in different rooms
✅ Rejecting past time bookings
✅ Validating date format and required fields
✅ Checking start time < end time
✅ Deleting reservations
✅ Re-booking after deletion
Both follow good coding practices with clear test descriptions, minimal dependencies, and simple, maintainable structure.