import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import MainLayout from '../components/Layout/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

// Lazy-loaded feature modules for code splitting
const CalendarPage = lazy(() => import('../features/calendar/CalendarPage'));
const AvailabilityPage = lazy(() => import('../features/availability/AvailabilityPage'));
const UnavailabilityPage = lazy(() => import('../features/unavailability/UnavailabilityPage'));
const BookingPage = lazy(() => import('../features/booking/BookingPage'));

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
    <CircularProgress size={36} thickness={4} sx={{ color: '#1565c0' }} />
  </Box>
);

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(CalendarPage) },
      { path: 'availability', element: withSuspense(AvailabilityPage) },
      { path: 'unavailability', element: withSuspense(UnavailabilityPage) },
      { path: 'booking', element: withSuspense(BookingPage) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
