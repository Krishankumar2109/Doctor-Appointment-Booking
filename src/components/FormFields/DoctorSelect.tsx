import { FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import doctors from '../../data/doctors';

interface DoctorSelectProps {
  value: number | '';
  onChange: (doctorId: number) => void;
  onClear?: () => void;
  allowAll?: boolean;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const DoctorSelect = ({
  value,
  onChange,
  onClear,
  allowAll = false,
  label = 'Select Doctor',
  size = 'medium',
  fullWidth = true,
}: DoctorSelectProps) => {
  const handleChange = (event: SelectChangeEvent<number | ''>) => {
    const val = event.target.value;
    if (val === '') {
      onClear?.();
    } else if (typeof val === 'number') {
      onChange(val);
    }
  };

  return (
    <FormControl fullWidth={fullWidth} size={size}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={handleChange} label={label}>
        {allowAll && (
          <MenuItem value="">
            <em>All Doctors</em>
          </MenuItem>
        )}
        {doctors.map((doc) => (
          <MenuItem key={doc.id} value={doc.id}>
            <span style={{ fontWeight: 500 }}>{doc.name}</span>
            <Chip
              label={doc.specialization}
              size="small"
              sx={{
                ml: 1,
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 500,
                bgcolor: '#e3f2fd',
                color: '#1565c0',
              }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DoctorSelect;
