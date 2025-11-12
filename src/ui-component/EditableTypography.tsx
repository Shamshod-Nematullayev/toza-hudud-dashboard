import { TextareaAutosize, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import useCustomizationStore from 'store/customizationStore';
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return node.toString();
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }
  if (React.isValidElement(node)) {
    return extractText(node.props.children);
  }
  return '';
}

function EditableTypography({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  const [value, setValue] = React.useState(extractText(children));
  const { customization } = useCustomizationStore();
  const theme = useTheme();

  useEffect(() => {
    setValue(extractText(children));
  }, [children]);

  return (
    <TextareaAutosize
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{
        width: '100%',
        resize: 'none',
        outline: 'none',
        border: 'none',
        fontFamily: customization.fontFamily,
        fontSize: 16,
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        ...style
      }}
    />
  );
}

export default EditableTypography;
