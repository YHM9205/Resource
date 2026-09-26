# Auto-Code Project Progress

## Project Goal

Auto-Code helps car owners understand their vehicle before visiting a workshop. It will connect vehicle data, diagnostics, parts references, replacement guides, maintenance history, and controlled report sharing in one place.

## Roadmap From The Beginning

### Step 1: Original Express Prototype - Completed

- Created the Express server.
- Added EJS views for the home page, garage, and system pages.
- Added sample cars and diagnostic statuses.
- Added the first navigation partial.
- Confirmed the original routes worked:
  - `/`
  - `/garage`
  - `/system`

### Step 2: New Product Direction - Completed

- Changed the product direction from a workshop-only dashboard to a user protection and vehicle knowledge platform.
- Defined the main purpose: help users understand a problem and its expected repair before paying a workshop.
- Planned external parts references and replacement guides.
- Planned temporary and permanent report access.

### Step 3: New Landing Page - Completed

- Added `views/home.ejs`.
- Added `public/css/home.css`.
- Added three service cards:
  - My Garage
  - Diagnostic System
  - Parts & Maintenance
- Added sign-in and registration links.
- Made the new page the `/` route.
- Verified the page returns HTTP 200 and renders all three services.

### Step 4: Database Foundation - Completed

- Added MongoDB connection helper at `config/db.js`.
- Added `mongoose` and `dotenv` dependencies.
- Added a MongoDB URI fallback for local development.
- Kept the web server usable when MongoDB is offline during frontend work.

### Step 5: Database Models - Completed

Added the following models:

- `User`: login identity and role.
- `Owner`: owner profile linked to a user.
- `Car`: vehicle data, owner relationship, and VIN.
- `Diagnostic`: issue descriptions, OBD codes, and status.
- `Part`: part number, price, stock, external reference, and replacement guide.
- `Maintenance`: service history, cost, notes, and used parts.
- `Workshop`: workshop directory information.
- `Review`: user ratings and comments for workshops.
- `Agent`: diagnostic/system assistant status and capabilities.

All model files passed Node syntax checks.

## Current Status

The project is currently at the **database foundation and model stage**.

Completed and working:

- Express server.
- EJS frontend foundation.
- New landing page.
- MongoDB connection helper.
- Nine Mongoose models.
- Existing garage and system pages.

Not completed yet:

- Real authentication.
- Sessions.
- Owner creation after registration.
- Permission middleware.
- Car CRUD.
- VIN decoding service.
- Diagnostic code reference service.
- Parts and replacement pages.
- Temporary and permanent access sharing.
- Workshop comparison based on user-submitted offers.

## Next Steps

1. Add authentication routes, controllers, forms, bcrypt, and sessions.
2. Create an Owner profile automatically after registration or through setup.
3. Add permission middleware for private user data.
4. Build Car CRUD and connect cars to the logged-in owner.
5. Add VIN validation and vehicle lookup.
6. Add diagnostic code reference results.
7. Add parts, Auto Rock references, and replacement guides.
8. Add maintenance history and cost records.
9. Add report sharing with permanent, temporary, read-only, and technician access.
10. Add workshop reports and user-submitted price references.
11. Add tests, validation, security checks, and deployment configuration.
