import { create } from 'zustand'

const useStore =  create(set => ({
    selectedRows: [],
    setSelectedRows: rows => set({selectedRows: rows}),
    rowsForPrint: [],
    setRowsForPrint: rows => set({rowsForPrint: rows}),
}))

export default useStore