interface IRow {
  id: number;
  type: string;
  status: string;
  actStatus: string;
}
function ReportPetitions() {
  const columns = [{ field: 'id', headerName: 'ID', width: 50, renderCell: ({ row }: { row: IRow }) => row.id + 1 }];
  return <div>ReportPetitions</div>;
}

export default ReportPetitions;
