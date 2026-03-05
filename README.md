# Doctor Appointment Booking App

A React + TypeScript app for managing doctor schedules and booking patient appointments. No backend required — all data is stored in localStorage.

## How to Run

```
npm install
npm run dev
```

Opens at `http://localhost:5173`

To build for production:

```
npm run build
```

## What It Does

- **Manage Availability** — Set weekly time slots for each doctor
- **Block Slots** — Mark a doctor as unavailable on specific dates with an optional reason
- **Book Appointments** — Book a patient into an available slot
- **Calendar View** — See the full week at a glance with color-coded statuses (Available, Booked, Blocked)

## Tech Used

- React 18 + TypeScript [Tech Stack Used]
- Vite (build tool)
- Material UI for components 
- React Router for navigation
- SweetAlert2 for alerts and confirmations
- Day.js for date handling
- SCSS Modules for scoped styling
- Context API + useReducer for state management : I have used ContextAPI for this instead of redux because of the complexity of the projext is medium ,Hence Redux would over Bloat the project
- localStorage for data persistence

## Folder Structure

```
src/
├── app/              — App entry, routes
├── components/       — Shared components (Layout, DoctorSelect, ErrorBoundary, etc.)
├── context/          — AppContext + reducer
├── data/             — Static doctor data
├── features/         — Feature pages (availability, booking, calendar, unavailability)
├── hooks/            — Custom hooks
├── styles/           — Global SCSS variables and mixins
├── types/            — TypeScript types
└── utils/            — Helper functions
```

## Screenshots
Attached in the mail




