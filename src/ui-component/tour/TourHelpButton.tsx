import React from 'react';
import { IconButton, Tooltip, SxProps, Theme } from '@mui/material';
import { HelpOutlined as HelpOutlineIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface TourHelpButtonProps {
  onClick: () => void;
  title?: string;
  id?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default' | 'inherit' | 'info';
  sx?: SxProps<Theme>;
}

export default function TourHelpButton({
  onClick,
  title,
  id = 'tour-help-button',
  size = 'small',
  color = 'primary',
  sx
}: TourHelpButtonProps) {
  const { t } = useTranslation();
  const tooltipText = title || t('Sahifa bo‘yicha yo‘riqnoma');

  return (
    <Tooltip title={tooltipText} arrow placement="bottom">
      <IconButton
        id={id}
        onClick={onClick}
        size={size}
        color={color}
        sx={{
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'primary.light',
            color: 'primary.main',
            borderColor: 'primary.main',
            transform: 'scale(1.05)'
          },
          ...sx
        }}
        aria-label={tooltipText}
      >
        <HelpOutlineIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
}
