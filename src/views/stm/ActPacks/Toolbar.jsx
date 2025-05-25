import React from 'react'
import MuiToolbar from '@mui/material/Toolbar';
import { Alert } from '@mui/material';

function Toolbar({stats}) {
  return (
    <MuiToolbar sx={{gap: "5px"}}>
      <Alert color='info'  >Yangi: {stats?.newActsCount}</Alert>
      <Alert color='warning' >Ogohlantirilgan: {stats?.warnedActsCount}</Alert>
      <Alert color='success' >Tekshirilgan: {stats?.checkedActsCount}</Alert>
      <Alert color='error' >Bekor qilingan: {stats?.rejectedActsCount}</Alert>
    </MuiToolbar>
  )
}
// warnedActsCount,
// fixedActsCount,
// rejectedActsCount,
// checkedActsCount,
// newActsCount

export default Toolbar