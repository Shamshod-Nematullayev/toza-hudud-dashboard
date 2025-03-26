import { IconButton, List, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import React from 'react';

function MahallaList({ type, mahallas }) {
  return (
    <List sx={{ width: 200, overflowY: 'auto' }}>
      {mahallas.map((mahalla) => (
        <>
          {type === 'printed' && (
            <ListItem key={mahalla.id}>
              <ListItemButton>
                {mahalla.name}
                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </ListItemButton>
            </ListItem>
          )}
          {type === 'not-printed' && (
            <ListItem key={mahalla.id}>
              <ListItemButton>--{mahalla.name}</ListItemButton>
            </ListItem>
          )}
        </>
      ))}
    </List>
  );
}

export default MahallaList;
