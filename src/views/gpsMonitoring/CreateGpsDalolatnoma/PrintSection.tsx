import { TextareaAutosize } from '@mui/material';
import React from 'react';
import useCustomizationStore from 'store/customizationStore';

function PrintSection() {
  const [value, setValue] = React.useState('Assomu alaykum brat');
  const { customization } = useCustomizationStore();
  return (
    <div>
      <TextareaAutosize
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: '100%',
          height: '100%',
          resize: 'none',
          outline: 'none',
          border: 'none',
          fontFamily: customization.fontFamily,
          fontSize: 16
        }}
      />
    </div>
  );
}

export default PrintSection;
