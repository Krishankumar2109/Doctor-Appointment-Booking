import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import dayjs from 'dayjs';
import Sidebar from './Sidebar';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import styles from './MainLayout.module.scss';

const pageTitles: Record<string, string> = {
  '/': 'Calendar Overview',
  '/availability': 'Manage Availability',
  '/unavailability': 'Block Slots',
  '/booking': 'Book Appointment',
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || 'MedScheduler';

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
            <h1 className={styles.pageTitle}>{currentTitle}</h1>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.todayChip}>
              {dayjs().format('dddd, MMM D, YYYY')}
            </span>
          </div>
        </header>

        <main className={styles.content}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
