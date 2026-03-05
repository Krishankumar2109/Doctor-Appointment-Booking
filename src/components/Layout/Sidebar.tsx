import { useNavigate, useLocation } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BlockIcon from '@mui/icons-material/Block';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Calendar Overview', path: '/', icon: CalendarMonthIcon },
  { label: 'Manage Availability', path: '/availability', icon: EventAvailableIcon },
  { label: 'Block Slots', path: '/unavailability', icon: BlockIcon },
  { label: 'Book Appointment', path: '/booking', icon: BookOnlineIcon },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <LocalHospitalIcon />
          </div>
          <div className={styles.brandText}>
            <h2>Doctor-Scheduler</h2>
            <span>Appointment Portal</span>
          </div>
        </div>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <Icon className={styles.navIcon} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          Developed By Krishan Kumar.
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
