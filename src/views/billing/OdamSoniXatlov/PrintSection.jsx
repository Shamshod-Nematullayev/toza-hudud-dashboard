import { Button, Checkbox, Dialog, DialogActions, DialogContent, InputLabel } from '@mui/material';
import { lotinga } from 'helpers/lotinKiril';
import React, { useRef, useState } from 'react';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import { useReactToPrint } from 'react-to-print';
import { QRCodeCanvas } from 'qrcode.react';
import { reactToPrintDefaultOptions } from 'store/constant';

const oylar = ['Январ', 'Февраль', 'Март', 'Апрель', 'Май', 'Июн', 'Июл', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабр'];
const raqamlar = [
  'Nol',
  'Bir',
  'Ikki',
  'Uch',
  'To‘rt',
  'Besh',
  'Olti',
  'Yetti',
  'Sakkiz',
  'To‘qqiz',
  'O‘n',
  'O‘n bir',
  'O‘n ikki',
  'O‘n uch',
  'O‘n to‘rt',
  'O‘n besh',
  'O‘n olti',
  'O‘n yetti',
  'O‘n sakkiz',
  'O‘n to‘qqiz',
  'Yigirma'
];
function stringToName(str) {
  const parts = str.split(' ');
  let name = ``;
  parts.forEach((part) => {
    part = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    name += part + ' ';
  });
  return name;
}

function PrintSection() {
  const [mfyRaisi, setMfyRaisi] = useState(true);
  const { dalolatnomaData, openPrintSection, setOpenPrintSection } = odamSoniXatlovStore();
  const { mahalla, data } = dalolatnomaData;
  const printComponentRef = useRef(null);
  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: mahalla.name + 'xatlov',
    contentRef: printComponentRef
  });
  const company = JSON.parse(localStorage.getItem('company'));
  const date = new Date();
  return (
    <Dialog
      open={openPrintSection}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // kenglikni belgilash
          maxWidth: '800px' // maksimal kenglik
        }
      }}
    >
      <DialogContent>
        <div ref={printComponentRef}>
          <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
            <p style={{ textAlign: 'center' }}>
              <b>
                Abonentlar bo‘yicha o‘zgarishlar to‘g‘risidagi ma’lumotlarga kiritilmagan va ular haqida Sanitar tozalash markaziga taqdim
                etilmagan yangi abonentlar yoki birga istiqomat qiluvchi shaxslar sonini aniqlash
              </b>
            </p>
            <p style={{ textAlign: 'center' }}>
              <b>DALOLATNOMASI</b>
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                lineHeight: '50px'
              }}
            >
              <div>
                "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
              </div>
              <div>Kattaqo‘rg‘on tumani {lotinga(mahalla.name)}</div>
            </div>
            <p style={{ textIndent: '25px' }}>
              Bizlar kim imzo chekuvchilar Kattaqo‘rg‘on tuman {lotinga(mahalla.name)} MFY raisi{' '}
              {fullNameToShortName(mahalla.mfy_rais_name)}, “Anvarjon biznes invest” MCHJ rahbari {fullNameToShortName('Sadriddinov Aziz')}{' '}
              va abonentlar bilan ishlash bo‘limi xodimi {fullNameToShortName("Ne'matullayev Shamshod")}
              {mahalla.biriktirilganNazoratchi?.inspector_name && (
                <span>, aholi nazoratchisi {fullNameToShortName(mahalla.biriktirilganNazoratchi?.inspector_name)}</span>
              )}{' '}
              mazkur dalolatnomani shu haqida tuzdik.
            </p>
            <p style={{ textIndent: '25px' }}>
              {lotinga(mahalla.name)} MFY-da xatlov o‘tkazilganda quyidagi jadvaldagi abonentlar yashovchi sonlari o‘zgarganligi ma'lum
              bo‘ldi.
            </p>
            <table
              style={{
                border: '1px solid #ccc',
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                textAlign: 'center'
              }}
              border={1}
            >
              <thead>
                <tr>
                  <th>t/r</th>
                  <th>Hisob raqam</th>
                  <th
                    style={{
                      textAlign: 'left'
                    }}
                  >
                    F.I.O.
                  </th>
                  <th>Yashovchilar soni</th>
                </tr>
              </thead>
              <tbody>
                {dalolatnomaData.rows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.accountNumber}</td>
                    <td
                      style={{
                        textAlign: 'left'
                      }}
                    >
                      {lotinga(stringToName(row.fio))}
                    </td>
                    <td>
                      <div style={{ textAlign: 'left', margin: 'auto', width: '70px' }}>
                        <span>{row.YASHOVCHILAR}</span>
                        <span>{' (' + raqamlar[row.YASHOVCHILAR] + ')'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Ushbu dalolatnomani to‘g‘ri deb imzo chekuvchilar:</p>
            {mfyRaisi && <ImzoJoyiRow label={lotinga(mahalla.name) + ' MFY raisi:'} name={fullNameToShortName(mahalla.mfy_rais_name)} />}
            <br />
            <ImzoJoyiRow label="Abonentlar bilan ishlash bo‘limi xodimi:" name={company.billingAdminName} />
            <br />
            <ImzoJoyiRow label="Axoli nazoratchisi:" name={fullNameToShortName(mahalla.biriktirilganNazoratchi?.inspector_name)} />
            <br />
            <ImzoJoyiRow label={`${company.name} ${company.locationName} filiali raxbari:`} name={company.managerName} />
            <br />
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <QRCodeCanvas
                value={`XatlovOdamSoni_${data._id}_${data.documentNumber}`}
                size={150}
                bgColor={'#ffffff'}
                fgColor={'#000000'}
                level={'Q'}
                includeMargin={true}
              />
              <p>{data.documentNumber}</p>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogContent
        style={{
          flexShrink: 0
        }}
      >
        <DialogActions>
          <InputLabel id="raisi">
            {' '}
            <Checkbox checked={mfyRaisi} onChange={(e) => setMfyRaisi(e.target.checked)} /> MFY raisi
          </InputLabel>
          <Button variant="outlined" color="primary" onClick={() => setOpenPrintSection(false)}>
            Chiqish
          </Button>
          <Button variant="contained" color="primary" onClick={printFunction}>
            Chop etish
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
const ImzoJoyiRow = ({ label, placeholder = '___________', name }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ width: 300 }}>{label}</div>
    <div>{placeholder}</div>
    <div style={{ width: 200 }}>{fullNameToShortName(name)}</div>
  </div>
);

export default PrintSection;
