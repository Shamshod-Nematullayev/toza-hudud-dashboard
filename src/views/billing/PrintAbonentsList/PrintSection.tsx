import React from 'react';
import useStore, { IFilters } from './useStore';
import { lotinga, kirillga } from 'helpers/lotinKiril';
import { formatName } from '../CreateAbonentPetition.jsx/PrintSection';
import useCustomizationStore, { defaultVisibleColumns, ITableVisibleColumns } from 'store/customizationStore';
import { Box, Typography, Paper } from '@mui/material';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import { useTranslation } from 'react-i18next';

interface PrintSectionProps {
  printContentRef: React.RefObject<HTMLDivElement | null>;
  filters?: IFilters;
}

export default function PrintSection({ printContentRef, filters }: PrintSectionProps) {
  const date = new Date();
  const { abonents, minSaldo, maxSaldo } = useStore();
  const { company, printTableSettings } = useCustomizationStore();
  const { t } = useTranslation();

  // Customization parametrlari
  const fontSize = printTableSettings?.fontSize || 13;
  const isCyrillic = printTableSettings?.alphabet === 'cyrillic';
  const isMonochrome = printTableSettings?.colorMode === 'monochrome';
  const isCompact = printTableSettings?.lineDensity === 'compact';
  const visibleCols: ITableVisibleColumns = printTableSettings?.visibleColumns || defaultVisibleColumns;

  const cellPadding = isCompact ? '3px 4px' : '5px 6px';
  const lineHeight = isCompact ? 1.25 : 1.45;

  // Matnni alifboga moslash funksiyasi
  const convertText = (text: string | number | undefined | null) => {
    if (!text && text !== 0) return '—';
    const str = String(text);
    return isCyrillic ? kirillga(str) : lotinga(str);
  };

  // Hisob raqamini professional formatlash
  const renderFormattedAccountNumber = (accNum: string) => {
    if (!accNum) return '—';
    const clean = accNum.replace(/\s+/g, '');
    if (clean.length >= 12) {
      const prefix = clean.slice(0, 6);
      const mid = clean.slice(6, 9);
      const last = clean.slice(9);
      return (
        <span style={{ whiteSpace: 'nowrap', letterSpacing: '0.4px', display: 'inline-block' }}>
          <span
            style={{
              opacity: 0.65,
              color: isMonochrome ? '#333' : '#444',
              fontWeight: 500
            }}
          >
            {prefix}
          </span>{' '}
          <span style={{ fontWeight: 'bold', color: '#000' }}>
            {mid} {last}
          </span>
        </span>
      );
    }
    return <span style={{ fontWeight: 'bold', color: '#000' }}>{clean}</span>;
  };

  // Faol filtrlarni sarlavha uchun matnga aylantirish
  const renderActiveFiltersText = () => {
    const activeFilters: string[] = [];

    if (minSaldo && maxSaldo) {
      activeFilters.push(
        `${isCyrillic ? 'Қарздорлик' : 'Saldo'}: ${Number(minSaldo).toLocaleString()} ${isCyrillic ? 'дан' : 'dan'} ${Number(maxSaldo).toLocaleString()} ${isCyrillic ? 'гача' : 'gacha'}`
      );
    } else if (minSaldo) {
      activeFilters.push(`${isCyrillic ? 'Қарздорлик' : 'Saldo'} >= ${Number(minSaldo).toLocaleString()}`);
    } else if (maxSaldo) {
      activeFilters.push(`${isCyrillic ? 'Қарздорлик' : 'Saldo'} <= ${Number(maxSaldo).toLocaleString()}`);
    }

    if (filters?.identified === 'true') {
      activeFilters.push(isCyrillic ? 'Шахси тасдиқланган' : 'Shaxsi tasdiqlangan');
    } else if (filters?.identified === 'false') {
      activeFilters.push(isCyrillic ? 'Шахси тасдиқланмаган' : 'Shaxsi tasdiqlanmagan');
    }

    if (filters?.elektrAccountNumberConfirmed === 'true') {
      activeFilters.push(isCyrillic ? 'ЭТК тасдиқланган' : 'ETK tasdiqlangan');
    } else if (filters?.elektrAccountNumberConfirmed === 'false') {
      activeFilters.push(isCyrillic ? 'ЭТК тасдиқланмаган' : 'ETK tasdiqlanmagan');
    }

    if (activeFilters.length === 0) {
      return isCyrillic ? 'Барча абонентлар (Фильтрсиз)' : 'Barcha abonentlar (Filtrsiz)';
    }

    return activeFilters.join(' • ');
  };

  if (!abonents || abonents.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          color: 'text.secondary',
          gap: 2,
          p: 4
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <TableChartOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t("Abonentlar ro'yxati shakllantirilmagan")}
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', maxWidth: 450 }}>
          {t("Chap tarafdagi paneldan mahallani tanlang yoki yuqoridagi filtrlar orqali 'Yangilash' tugmasini bosing")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 0.5, sm: 1 }
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          bgcolor: '#fff',
          color: '#000',
          p: { xs: 1.5, sm: 2.5 },
          borderRadius: 2,
          overflowX: 'auto'
        }}
      >
        <div ref={printContentRef}>
          {/* Hujjat sarlavhasi (Header Info) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <tbody>
              <tr>
                <td style={{ fontSize: 11, fontStyle: 'italic', color: '#555' }}>
                  <i>GreenZone ish boshqaruv tizimi</i>
                </td>
                <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>
                  {isCyrillic ? 'Сана' : 'Sana'}: {date.getDate().toString().padStart(2, '0')}.{(date.getMonth() + 1).toString().padStart(2, '0')}.{date.getFullYear()}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ fontSize: 14, fontWeight: 'bold', paddingTop: '4px' }}>
                  {convertText(company?.locationName || '')} / {convertText(company?.name || '')}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ fontSize: 13, fontWeight: '600', color: '#222', paddingTop: '2px' }}>
                  {isCyrillic ? 'Маҳалла' : 'Mahalla'}: {convertText(abonents[0]?.mahallaName || '')} ({isCyrillic ? 'Жами' : 'Jami'}: {abonents.length} {isCyrillic ? 'та абонент' : 'ta abonent'})
                </td>
              </tr>
              {/* Qo'llanilgan filtrlar qatori */}
              <tr>
                <td colSpan={2} style={{ fontSize: 11, color: '#444', paddingTop: '2px', fontStyle: 'italic' }}>
                  <b>{isCyrillic ? 'Қўлланилган фильтрлар:' : 'Qo‘llanilgan filtrlar:'}</b> {renderActiveFiltersText()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Asosiy Abonentlar Jadvali */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: `${fontSize}px`,
              tableLayout: 'auto'
            }}
          >
            <thead>
              <tr
                className="abonent_rows_head"
                style={{
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #000',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: `${fontSize}px`
                }}
              >
                {visibleCols.orderNum !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', width: '28px' }}>№</th>
                )}
                {visibleCols.accountNumber !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                    {isCyrillic ? 'Ҳисоб рақам' : 'Hisob raqam'}
                  </th>
                )}
                {visibleCols.fullName !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', maxWidth: '230px' }}>
                    {isCyrillic ? 'Ф.И.Ш' : 'F.I.Sh'}
                  </th>
                )}
                {visibleCols.streetName !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', maxWidth: '85px' }}>
                    {isCyrillic ? 'Кўча' : 'Ko‘cha'}
                  </th>
                )}
                {visibleCols.homeNumber !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', width: '30px' }}>{isCyrillic ? 'Уй' : 'Uy'}</th>
                )}
                {visibleCols.homeIndex !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', width: '30px' }}>{isCyrillic ? 'Индекс' : 'Indeks'}</th>
                )}
                {visibleCols.flatNumber !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', width: '32px' }}>{isCyrillic ? 'Хонадон' : 'Xonadon'}</th>
                )}
                {visibleCols.inhabitantCnt !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', width: '28px' }}>
                    {isCyrillic ? 'Я' : 'Y'}
                  </th>
                )}
                {visibleCols.ksaldo !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                    {isCyrillic ? 'Қарздорлик' : 'Qarzdorlik'}
                  </th>
                )}
                {visibleCols.lastPayment !== false && (
                  <>
                    <th style={{ padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                      {isCyrillic ? 'Охирги тўлов' : 'Oxirgi to‘lov'}
                    </th>
                    <th style={{ padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                      {isCyrillic ? 'Сана' : 'Sana'}
                    </th>
                  </>
                )}
                {visibleCols.electricityAccountNumber !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                    {isCyrillic ? 'ЭТК' : 'ETK'}
                  </th>
                )}
                {visibleCols.phone !== false && (
                  <th style={{ padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                    {isCyrillic ? 'Телефон' : 'Telefon'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {abonents.map((abonent, i) => {
                const ksaldoNum = Number(abonent.ksaldo) || 0;
                let debtColor = '#000';
                if (!isMonochrome) {
                  debtColor = ksaldoNum > 0 ? '#d32f2f' : ksaldoNum < 0 ? '#2e7d32' : '#000';
                }

                // Identifikatsiya holati tekshiruvi
                const isIdentified = Boolean(abonent.identified) || abonent.isIdentified === '✅';

                return (
                  <tr
                    className="abonent_rows"
                    style={{
                      border: '1px solid #000',
                      backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa',
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight
                    }}
                    key={abonent.id || i}
                  >
                    {visibleCols.orderNum !== false && (
                      <td style={{ textAlign: 'center', padding: cellPadding, border: '1px solid #000' }}>{i + 1}</td>
                    )}
                    {visibleCols.accountNumber !== false && (
                      <td style={{ textAlign: 'center', padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                        {renderFormattedAccountNumber(abonent.accountNumber)}
                      </td>
                    )}
                    {visibleCols.fullName !== false && (
                      <td style={{ padding: cellPadding, border: '1px solid #000', fontWeight: 500, maxWidth: '230px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={convertText(formatName(abonent.fullName))}
                          >
                            {convertText(
                              formatName(
                                abonent.fullName ? (abonent.fullName.length < 30 ? abonent.fullName : abonent.fullName.slice(0, 30) + '..') : '—'
                              )
                            )}
                          </span>
                          {!isIdentified && (
                            <span
                              title={isCyrillic ? 'Шахси тасдиқланмаган' : 'Shaxsi tasdiqlanmagan'}
                              style={{
                                flexShrink: 0,
                                fontSize: `${Math.max(10, fontSize - 1)}px`,
                                fontWeight: 'bold',
                                lineHeight: 1
                              }}
                            >
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleCols.streetName !== false && (
                      <td
                        style={{
                          padding: cellPadding,
                          border: '1px solid #000',
                          maxWidth: '85px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={convertText(abonent.streetName || '—')}
                      >
                        {convertText(abonent.streetName || '—')}
                      </td>
                    )}
                    {visibleCols.homeNumber !== false && (
                      <td style={{ textAlign: 'center', padding: cellPadding, border: '1px solid #000' }}>{abonent.homeNumber || ''}</td>
                    )}
                    {visibleCols.homeIndex !== false && (
                      <td style={{ textAlign: 'center', padding: cellPadding, border: '1px solid #000' }}>{abonent.homeIndex || ''}</td>
                    )}
                    {visibleCols.flatNumber !== false && (
                      <td style={{ textAlign: 'center', padding: cellPadding, border: '1px solid #000' }}>{abonent.flatNumber || ''}</td>
                    )}
                    {visibleCols.inhabitantCnt !== false && (
                      <td style={{ textAlign: 'center', fontWeight: 'bold', padding: cellPadding, border: '1px solid #000' }}>
                        {abonent.inhabitantCnt ?? 0}
                      </td>
                    )}
                    {/* Qarzdorlik */}
                    {visibleCols.ksaldo !== false && (
                      <td
                        style={{
                          textAlign: 'right',
                          padding: cellPadding,
                          border: '1px solid #000',
                          fontWeight: 'bold',
                          color: debtColor,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {Math.floor(ksaldoNum).toLocaleString()}
                      </td>
                    )}
                    {visibleCols.lastPayment !== false && (
                      <>
                        <td style={{ textAlign: 'right', padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                          {abonent.lastPaymentAmount ? Number(abonent.lastPaymentAmount).toLocaleString() : '—'}
                        </td>
                        <td style={{ textAlign: 'center', padding: cellPadding, border: '1px solid #000', whiteSpace: 'nowrap' }}>
                          {abonent.lastPayDate ? String(abonent.lastPayDate).split('T')[0] : '—'}
                        </td>
                      </>
                    )}
                    {/* ETK */}
                    {visibleCols.electricityAccountNumber !== false && (
                      <td
                        style={{
                          textAlign: 'center',
                          padding: cellPadding,
                          border: '1px solid #000',
                          color: '#000',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {abonent.electricityAccountNumber || '—'}
                      </td>
                    )}
                    {/* Telefon ustuni */}
                    {visibleCols.phone !== false && (
                      <td
                        style={{
                          textAlign: 'center',
                          padding: cellPadding,
                          border: '1px solid #000',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {abonent.phone || '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Paper>
    </Box>
  );
}
