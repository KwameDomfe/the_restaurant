# API Contract Summary

Base URL: `http://localhost:8000/api`

## Restaurants
- `GET /restaurants/` — list restaurants
- `GET /restaurants/:slug/` — restaurant detail (slug-based)
- `GET /restaurants/popular-cuisines/` — popular cuisines

## Menu Items
- `GET /menu-items/` — list menu items
- `GET /menu-items/:slug/` — menu item detail (slug-based)
- `GET /menu-items/meal-periods/` — grouped by meal period

## Categories
- `GET /categories/` — list categories (filter `?restaurant=<id>`)

## Reviews
- `GET /reviews/` — list reviews (filter `?restaurant=<id>`)

## Accounts (custom)
- `POST /accounts/login/` — unified email/password login (web + mobile)
- `POST /accounts/register/` — register (new unified path)
- `POST /accounts/auth/register/` — register (legacy, to be deprecated)
- `POST /accounts/auth/check-email/` — check email
- `POST /accounts/auth/check-username/` — check username
- `POST /accounts/auth/request-password-reset/` — password reset
- `GET /accounts/auth/user-types/` — supported user types

Notes
- ViewSets use read-only access for unauthenticated users (safe methods). Global default is `IsAuthenticated`, but overridden per-view with `IsAuthenticatedOrReadOnly`.
- Slugs are primary lookup keys for `Restaurant` and `MenuItem`. Migration backfills unique slugs.
- CORS is enabled for local development including Expo tunnels.

## Client Config

Web (`webapp/src/App.js`):
- `API_BASE_URL = 'http://localhost:8000/api'`
- Uses endpoints listed above. Meal periods and popular cuisines aligned.

Mobile (`mobile/src/context/AppContext.js`):
- `API_BASE_URL` is `EXPO_PUBLIC_API_BASE_URL` if set; otherwise:
  - Web: `http://<host>:8000/api`
  - Device/LAN default: `http://192.168.62.227:8000/api`
- Uses the same endpoints; login via `/accounts/login/`.

## Quick Checks
- Popular cuisines: `curl http://localhost:8000/api/restaurants/popular-cuisines/`
- Meal periods: `curl http://localhost:8000/api/menu-items/meal-periods/`
- Restaurants: `curl http://localhost:8000/api/restaurants/`
- Menu items: `curl http://localhost:8000/api/menu-items/`
