import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { PatternFormat } from 'react-number-format';

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  textFieldProps?: Omit<TextFieldProps, 'variant'>;
}

const PhoneInput = ({ value, onChange, textFieldProps }: Props) => {
  return (
    // @ts-ignore
    <PatternFormat
      customInput={TextField} // MUI TextField bilan integratsiya
      format="(##) ###-##-##" // Format shabloni
      mask="_" // To'ldirilmagan joylar uchun belgi
      onValueChange={(values) => {
        // .value — bu formatlangan (shablonli) qiymat
        // .formattedValue — bu (99) 187-25-36
        onChange(values.value); // Biz bazaga faqat 991872536 ni yuboramiz
      }}
      {...textFieldProps}
      value={value}
    />
  );
};

export default PhoneInput;
