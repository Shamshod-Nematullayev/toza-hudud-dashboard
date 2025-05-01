import React, { useState } from 'react';

function ReportsTable() {
  const [columns, setColumns] = useState([]);
  return (  
    <div
      style={{
        height: '100%',
        border: '1px solid red'
      }}
    >
      Reports table
    </div>
  );
}

export default ReportsTable;
