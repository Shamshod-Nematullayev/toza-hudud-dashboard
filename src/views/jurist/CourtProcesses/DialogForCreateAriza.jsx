import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useState } from 'react'
import dayjs from 'dayjs'
import axios from 'axios'
import { toast } from 'react-toastify'

function DialogForCreateAriza({
    showCreateArizaModal,
    handleCloseModal
}) {
    // ==================STATES========================
    const { selectedRows, setRowsForPrint } = useStore()
    const [arizaType, setArizaType] = useState("prokuratura")
    const [arizaDate, setArizaDate] = useState(dayjs(new Date()))

    // =================HANDLERS=======================
    const handleSubmitButtonClick = async () => {
        const sudAktIds = selectedRows.map(row => row._id)
        const { data } = axios.put("/sudAkts/create-many-ariza", {
            sudAktIds
        })
        if (!data.ok) return toast.error(data.message);

        setRowsForPrint(data.rows);
        handleCloseModal()
    }
    return (
        <Dialog open={showCreateArizaModal}>
            <DialogTitle >
                Parametrlarni tanlang!
            </DialogTitle>
            <DialogContent>
                <DatePicker label="ariza sanasi" value={arizaDate} onChange={e => setArizaDate(e)} sx={{
                    margin: '5px 0',
                    display: "block"
                }} />
                <InputLabel id="ariza-type">Ariza turi</InputLabel>
                <Select labelid='ariza-type' value={arizaType} onChange={e => setArizaType(e.target.value)} fullWidth>
                    <MenuItem value="prokuratura">Prokuratura</MenuItem>
                    <MenuItem value="savdo-sanoat">Savdo Sanoat Palatasi</MenuItem>
                </Select>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" variant='outlined' onClick={handleCloseModal}>
                    Chiqish
                </Button>
                <Button variant='contained' sx={{ background: "primary.main" }} onClick={handleSubmitButtonClick}>
                    Yaratish
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DialogForCreateAriza