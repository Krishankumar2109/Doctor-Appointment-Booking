import { Chip } from '@mui/material';
import { SlotStatus } from '../../types';

interface StatusChipProps {
  status: SlotStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<SlotStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: '#2e7d32', bg: '#e8f5e9' },
  booked: { label: 'Booked', color: '#e65100', bg: '#fff3e0' },
  blocked: { label: 'Blocked', color: '#546e7a', bg: '#eceff1' },
};

const StatusChip = ({ status, size = 'small' }: StatusChipProps) => {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.72rem',
        height: size === 'small' ? 24 : 30,
      }}
    />
  );
};

export default StatusChip;
