import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

function SelectInputComponent(props) {
  const { item, applyValue, valueOptions } = props;

  const handleChange = (event) => {
    applyValue({ ...item, value: event.target.value });
  };

  return (
    <FormControl variant="standard">
      <InputLabel id="standard-label">Status</InputLabel>
      <Select value={item.value || 'Hammasi'} onChange={handleChange} labelId="standard-label">
        <MenuItem value="Hammasi" default>
          Hammasi
        </MenuItem>
        {valueOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
export default SelectInputComponent;
