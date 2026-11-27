import { Button, Checkbox, Dialog, DialogActions, DialogContent, InputLabel, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { lotinga } from 'helpers/lotinKiril';
import React, { useRef, useState, useEffect } from 'react';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import { useReactToPrint } from 'react-to-print';
import { QRCodeCanvas } from 'qrcode.react';
import { reactToPrintDefaultOptions } from 'store/constant';
import useCustomizationStore from 'store/customizationStore';
import { getMahallaById } from 'services/getMahallaById';
import { matchYettilikRole } from 'views/billing/CreateAbonentPetition.jsx/participantResolver';
import { IMahalla } from 'types/billing';

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
function stringToName(str: string) {
  const parts = str.split(' ');
  let name = ``;
  parts.forEach((part) => {
    part = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    name += part + ' ';
  });
  return name;
}

function PrintSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mfyRaisi, setMfyRaisi] = useState(true);
  const { dalolatnoma, ui, setPrintModal } = odamSoniXatlovStore();
  const { mahalla } = dalolatnoma;
  const [mahallaDetails, setMahallaDetails] = useState<IMahalla | null>(null);

  const printComponentRef = useRef(null);
  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: (mahalla?.name || 'mahalla') + ' xatlov',
    contentRef: printComponentRef
  });
  const { company } = useCustomizationStore();
  const date = new Date();

  useEffect(() => {
    if (mahalla?.id && (!mahalla.employees || mahalla.employees.length === 0)) {
      getMahallaById(String(mahalla.id))
        .then((res) => {
          if (res?.data) {
            setMahallaDetails(res.data);
          }
        })
        .catch((err) => {
          console.error('Mahalla xodimlarini yuklashda xatolik:', err);
        });
    }
  }, [mahalla?.id, mahalla?.employees]);

  const currentMahalla = mahallaDetails || mahalla;
  const employees = currentMahalla?.employees || [];

  const findEmployee = (roleKey: string, fallbackKeywords: string[]) => {
    const matchedEmp = employees.find((emp: any) => {
      if (!emp?.fullName?.trim() || !emp?.position?.trim()) return false;
      const matched = matchYettilikRole(emp.position);
      if (matched && matched.roleKey === roleKey) return true;
      const pos = emp.position.toLowerCase();
      return fallbackKeywords.some((kw) => pos.includes(kw));
    });
    return matchedEmp?.fullName?.trim() || '';
  };

  const hokimYordamchisiName = findEmployee('hokim_yordamchisi', ['hokim', 'xokim', 'yordamchi']);
  const yoshlarYetakchisiName = findEmployee('yoshlar_yetakchisi', ['yoshlar', 'yetakchi']);
  const profilaktikaInspektoriName = findEmployee('profilaktika_inspektori', ['profilaktika', 'uchastkavoy', 'inspektor']);

  const nazoratchiName =
    currentMahalla?.biriktirilganNazoratchi?.inspector_name?.trim() ||
    (currentMahalla as any)?.biriktirilganNazoratchi?.name?.trim() ||
    findEmployee('aholi_nazoratchisi', ['nazoratchi', 'aholi nazoratchisi']) ||
    '';

  return (
    <Dialog
      open={ui.isPrintModalOpen}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '100%', sm: '85%' },
          maxWidth: '800px'
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
                &quot;{date.getDate()}&quot; {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
              </div>
              <div>
                {company?.locationName} {lotinga(currentMahalla?.name)}
              </div>
            </div>
            <p style={{ textIndent: '25px', lineHeight: '1.6' }}>
              Bizlar kim imzo chekuvchilar {company?.locationName} {lotinga(currentMahalla?.name)} MFY raisi{' '}
              {fullNameToShortName(currentMahalla?.mfy_rais_name) || '________________'}, Aholi nazoratchisi{' '}
              {fullNameToShortName(nazoratchiName) || '________________'}, Yoshlar yetakchisi{' '}
              {fullNameToShortName(yoshlarYetakchisiName) || '________________'}, Profilaktika inspektori{' '}
              {fullNameToShortName(profilaktikaInspektoriName) || '________________'} va Hokim yordamchisi{' '}
              {fullNameToShortName(hokimYordamchisiName) || '________________'} mazkur dalolatnomani shu haqida tuzdik.
            </p>
            <p style={{ textIndent: '25px' }}>
              {lotinga(currentMahalla?.name)} MFY-da xatlov o‘tkazilganda quyidagi jadvaldagi abonentlar yashovchi sonlari o‘zgarganligi ma&#39;lum
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
                {dalolatnoma.rows?.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.accountNumber}</td>
                    <td
                      style={{
                        textAlign: 'left'
                      }}
                    >
                      {lotinga(stringToName(row.fio || ''))}
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
            <p style={{ marginTop: '20px', marginBottom: '12px' }}>Ushbu dalolatnomani to‘g‘ri deb imzo chekuvchilar:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mfyRaisi && (
                <ImzoJoyiRow
                  label={lotinga(currentMahalla?.name) + ' MFY raisi:'}
                  name={currentMahalla?.mfy_rais_name || ''}
                />
              )}
              <ImzoJoyiRow
                label="Hokim yordamchisi:"
                name={hokimYordamchisiName}
              />
              <ImzoJoyiRow
                label="Yoshlar yetakchisi:"
                name={yoshlarYetakchisiName}
              />
              <ImzoJoyiRow
                label="Profilaktika inspektori:"
                name={profilaktikaInspektoriName}
              />
              <ImzoJoyiRow
                label="Aholi nazoratchisi:"
                name={nazoratchiName}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
              <QRCodeCanvas
                value={`XatlovOdamSoni_${dalolatnoma._id}_${dalolatnoma.documentNumber}`}
                size={140}
                bgColor={'#ffffff'}
                fgColor={'#000000'}
                level={'Q'}
                includeMargin={true}
              />
              <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{dalolatnoma?.documentNumber}</p>
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
          <Button variant="outlined" color="primary" onClick={() => setPrintModal(false)}>
            Chiqish
          </Button>
          <Button variant="contained" color="primary" onClick={() => printFunction()}>
            Chop etish
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
const ImzoJoyiRow = ({ label, placeholder = '___________', name }: { label: string; placeholder?: string; name: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ width: 300, fontWeight: 500 }}>{label}</div>
    <div style={{ letterSpacing: '2px' }}>{placeholder}</div>
    <div style={{ width: 200, textAlign: 'right' }}>{fullNameToShortName(name) || (name ? name : '________________')}</div>
  </div>
);

export default PrintSection;
