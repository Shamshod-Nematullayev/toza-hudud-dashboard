import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useState } from 'react'
import dayjs from 'dayjs'

function DialogForCreateAriza({
    showCreateArizaModal,
    handleCloseModal
}) {
    // ==================STATES========================
    const [arizaType, setArizaType] = useState("")
    const [arizaDate, setArizaDate] = useState(dayjs(new Date()))


    return (
        <Dialog open={showCreateArizaModal}>
            <DialogTitle >
                Parametrlarni tanlang!
            </DialogTitle>
            <DialogContent>
                <FormControl variant='standard' sx={{

                }}>
                    <DatePicker label="ariza sanasi" value={arizaDate} onChange={e => setArizaDate(e)} />
                    <InputLabel id="ariza-type">Ariza turi</InputLabel>
                    <Select labelid='ariza-type' value={arizaType} onChange={e => setArizaType(e.target.value)}>
                        <MenuItem value="prokuratura">Prokuratura</MenuItem>
                        <MenuItem value="savdo-sanoat">Savdo Sanoat Palatasi</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" variant='outlined' onClick={handleCloseModal}>
                    Chiqish
                </Button>
                <Button variant='contained' sx={{ background: "primary.main" }}>
                    Yaratish
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DialogForCreateAriza