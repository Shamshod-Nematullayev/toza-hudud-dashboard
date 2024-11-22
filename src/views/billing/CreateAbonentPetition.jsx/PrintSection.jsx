import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styled from 'styled-components';
import { kirillga } from '../../../helpers/lotinKiril';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import useStore from './useStore';
const StyledTable = styled.table`
  margin: auto;
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    border: 1px solid #000;
    text-align: left;
  }
`;
const oylar = ['Январ', 'Февраль', 'Март', 'Апрель', 'Май', 'Июн', 'Июл', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабр'];
const raqamlar = ['Нол', 'Бир', 'Икки', 'Уч', 'Тўрт', 'Беш', 'Олти', 'Етти', 'Саккиз', 'Тўққиз', 'Ўн', 'Ўн бир', 'Ўн икки'];

function renderSwitch({
  date = new Date(),
  abonentData = {},
  abonentData2 = {},
  asoslantiruvchi = '',
  mahalla,
  mahalla2,
  aniqlanganYashovchiSoni,
  documentType = 'odam_soni',
  arizaData = {}
}) {
  switch (documentType) {
    case 'odam_soni':
      return (
        <>
          <p style={{ textAlign: 'center' }}>
            <b>
              Абонентлар бўйича ўзгаришлар тўғрисидаги маълумотларга киритилмаган ва улар ҳақида Санитар тозалаш марказига тақдим этилмаган
              янги абонентлар ёки бирга истиқомат қилувчи шахслар сонини аниқлаш
            </b>
          </p>
          <p style={{ textAlign: 'center' }}>
            <b>ДАЛОЛАТНОМАСИ</b>
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              lineHeight: '50px'
            }}
          >
            <div>
              "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил
            </div>
            <div>Каттақўрғон тумани</div>
          </div>
          <p>
            <b>Қуйидаги манзил бўйича:</b>
          </p>
          <p>МФЙ номи: {abonentData?.mahalla_name}</p>
          <p>Манзил: {abonentData?.address}</p>
          <p>Шахсий ҳисоб рақами: {abonentData?.licshet}</p>
          <p>
            <b>Абонент: {abonentData?.fio}</b>
          </p>
          <p>
            Жами {aniqlanganYashovchiSoni} ({raqamlar[aniqlanganYashovchiSoni]}) нафар шахc 20__ йилнинг “___” _______ ойидан буён бирга
            истиқомат қилиши аниқланди.
          </p>
          <p>
            Юқоридагиларга ва асослантирувчи ҳужжатларга мувофиқ, {date.getFullYear()} йилнинг {oylar[date.getMonth()]} ойида ҳисобга
            олишнинг ягона электрон тизимида мазкур абонент тўғрисидаги маълумотларга тегишли ўзгартиришлар киритиш ҳамда тўловларни қайта
            ҳисоб-китоб қилишни мақсадга мувофиқ деб ҳисоблаймиз.
          </p>
          <p>Асослантирувчи ҳужжатлар*:</p>
          <p>{kirillga(asoslantiruvchi)}</p>

          {asoslantiruvchi.length === 0 ? <p>_______________________________________________________________</p> : ''}
          {asoslantiruvchi.length < 70 ? <p>_______________________________________________________________</p> : ''}

          <p>
            *) асослантирувчи ҳужжатлар (доимий ёки вақтинча прописка қилинганлигини тасдиғи, ФҲДЁнинг туғилганликни қайд этиш тўғрисидаги
            ва бошқа маълумотлар) мавжуд бўлса уларнинг нусхалари илова қилинади.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>"Анваржон бизнес инвест" МЧЖ Каттақўрғон туман филиали рахбари:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>А.Садриддинов</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>Абонентлар билан ишлаш бўлими ходими:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>Ш.Нематуллаев</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>Ахоли назоратчиси:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>{mahalla.biriktirilganNazoratchi?.inspector_name}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>Абонент:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>{abonentData?.fio}</div>
          </div>
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>{mahalla.name} МФЙ раиси:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>{`${mahalla.mfy_rais_name?.split(' ')[1][0]}. ${mahalla.mfy_rais_name?.split(' ')[0]}`}</div>
          </div>
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div></div>
            <div
              style={{
                width: 300,
                textAlign: 'justify',
                fontWeight: 'bold',
                textIndent: '40px'
              }}
            >
              Каттақўрғон туман “Анваржон бизнес инвест” МЧЖ рахбари А.А.Садриддиновга. Каттақўрғон туман {mahalla.name} МФЙ да яшовчи
              фукаро {abonentData?.fio} томонидан
            </div>
          </div>
          <br />
          <h1
            style={{
              textAlign: 'center',
              margin: 'auto 0 0 0',
              fontSize: '24px'
            }}
          >
            АРИЗА
          </h1>
          <br />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            Шуни ёзиб маълум қиламанки менинг {abonentData?.licshet} хисоб рақамим онлайн базага нотўғри хисоб китоб қилингани сабабли
            далолатнома тақдим киляпман. Ушбу далолатномам асосида қайта хисоб китоб қилиб беришингизни сурайман.
          </p>
          <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
            "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил _______ {abonentData?.fio}
          </p>
          {!arizaData._id ? (
            ''
          ) : (
            <>
              <QRCodeCanvas
                value={`ariza_${arizaData._id}_${arizaData.document_number}`}
                size={150}
                bgColor={'#ffffff'}
                fgColor={'#000000'}
                level={'Q'}
                includeMargin={true}
              />
              <p>{arizaData.document_number}</p>
            </>
          )}
        </>
      );
    case 'dvaynik':
      return (
        <>
          <p style={{ textAlign: 'center' }}>
            <b>ДАЛОЛАТНОМА</b>
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              lineHeight: '50px'
            }}
          >
            <div>
              "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил
            </div>
            <div>Каттақўрғон тумани</div>
          </div>
          <p
            style={{
              textAlign: 'justify',
              textIndent: '40px'
            }}
          >
            Биз қуйидаги имзо чекувчилар, Самарқанд вилояти, Каттакургон тумани, {mahalla.name} МФЙ раиси{' '}
            {`${mahalla.mfy_rais_name?.split(' ')[1][0]}. ${mahalla.mfy_rais_name?.split(' ')[0]}`} , “АНВАРЖОН БИЗНЕС ИНВЕСТ” МЧЖ
            Каттақўрғон туман аҳоли назоратчиси {mahalla.biriktirilganNazoratchi?.inspector_name}, Абонентлар билан ишлаш бўлими бошлиғи
            Ш.Неъматуллаев мазкур далолатномани шу ҳақида туздик. МФЙ рўйхатини ўрганиш натижасида куйидаги абонент
          </p>
          <StyledTable border={1} style={{ borderCollapse: 'collapse' }}>
            <tr>
              <th>Хакикий хисоб ракам</th>
              <th>Абонент И.Ф.Ш</th>
              <th>Икиламчи хисоб ракам</th>
              <th>Абонент И.Ф.Ш</th>
            </tr>
            <tr>
              <td>{abonentData.licshet}</td>
              <td>{abonentData.fio}</td>
              <td>{abonentData2.licshet}</td>
              <td>{abonentData2.fio}</td>
            </tr>
          </StyledTable>
          <p
            style={{
              textAlign: 'justify',
              textIndent: '40px'
            }}
          >
            Ушбу абонентлар иккиламчи ҳисоб рақам бўлганлиги сабабли ягона электрон тизимда иккиламчи хисоб ракамга тушган пул маблағларини
            хақиқий ҳисоб рақамга ўтказиб, иккиламчи абонентларни ўчиришни мақсадга мувофиқ деб ҳисоблаймиз.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>"Анваржон бизнес инвест" МЧЖ Каттақўрғон туман филиали рахбари:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>А.Садриддинов</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>Абонентлар билан ишлаш бўлими ходими:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>Ш.Нематуллаев</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>Ахоли назоратчиси:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>{mahalla.biriktirilganNazoratchi?.inspector_name}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>Абонент:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>{abonentData.fio}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300 }}>{mahalla.name} МФЙ раиси:</div>
            <div>___________</div>
            <div style={{ width: 200 }}>{`${mahalla.mfy_rais_name?.split(' ')[1][0]}. ${mahalla.mfy_rais_name?.split(' ')[0]}`}</div>
          </div>
          {mahalla2 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 300 }}>{mahalla2.name} МФЙ раиси:</div>
              <div>___________</div>
              <div style={{ width: 200 }}>{`${mahalla2.mfy_rais_name?.split(' ')[1][0]}. ${mahalla2.mfy_rais_name?.split(' ')[0]}`}</div>
            </div>
          ) : (
            ''
          )}
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div></div>
            <div
              style={{
                width: 300,
                textAlign: 'justify',
                fontWeight: 'bold',
                textIndent: '40px'
              }}
            >
              Каттақўрғон туман “Анваржон бизнес инвест” МЧЖ рахбари А.А.Садриддиновга. Каттақўрғон туман {mahalla.name} МФЙ да яшовчи
              фукаро {abonentData.fio} томонидан
            </div>
          </div>
          <h1
            style={{
              textAlign: 'center',
              margin: 'auto 0 0 0',
              fontSize: '24px'
            }}
          >
            АРИЗА
          </h1>
          <br />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            Шуни ёзиб маълум қиламанки менинг {abonentData2.licshet} иккиламчи хисоб ракамимни ҳакикий {abonentData.licshet} ҳисоб рақамимга
            далолатнома асосида иккиламчи хисоб-рақамимда тўловлар мавжуд бўлса, асосий ҳисоб-рақамга кўчириб, иккиламчи ҳисоб-рақамимни
            ўчириб беришингизни сурайман.
          </p>
          <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
            "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил _______ {abonentData.fio}
          </p>
          {!arizaData._id ? (
            ''
          ) : (
            <>
              <QRCodeCanvas
                value={`ariza_${arizaData._id}_${arizaData.document_number}`}
                size={150}
                bgColor={'#ffffff'}
                fgColor={'#000000'}
                level={'Q'}
                includeMargin={true}
              />
              <p>{arizaData.document_number}</p>
            </>
          )}
        </>
      );
    case 'viza':
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div></div>
            <div
              style={{
                width: 300,
                textAlign: 'justify',
                fontWeight: 'bold',
                textIndent: '40px'
              }}
            >
              Каттақўрғон туман “Анваржон бизнес инвест” МЧЖ рахбари А.А.Садриддиновга. Каттақўрғон туман {mahalla.name} МФЙ да яшовчи
              фукаро {abonentData.fio} томонидан
            </div>
          </div>
          <h1
            style={{
              textAlign: 'center',
              margin: 'auto 0 0 0',
              fontSize: '24px'
            }}
          >
            АРИЗА
          </h1>
          <br />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            Шуни ёзиб маълум қиламанки менинг {abonentData.licshet} хисоб рақамим онлайн базага нотўғри хисоб китоб қилингани сабабли
            паспорт визалари тақдим киляпман. Ушбу паспорт визаларим асосида қайта хисоб китоб қилиб беришингизни сурайман.
          </p>
          <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
            "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил _______ {abonentData.fio}
          </p>
          {!arizaData._id ? (
            ''
          ) : (
            <>
              <QRCodeCanvas
                value={`ariza_${arizaData._id}_${arizaData.document_number}`}
                size={150}
                bgColor={'#ffffff'}
                fgColor={'#000000'}
                level={'Q'}
                includeMargin={true}
              />
              <p>{arizaData.document_number}</p>
            </>
          )}
        </>
      );
    case 'death':
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div></div>
            <div
              style={{
                width: 300,
                textAlign: 'justify',
                fontWeight: 'bold',
                textIndent: '40px'
              }}
            >
              Каттақўрғон туман “Анваржон бизнес инвест” МЧЖ рахбари А.А.Садриддиновга. Каттақўрғон туман {mahalla.name} МФЙ да яшовчи
              фукаро {abonentData.fio} томонидан
            </div>
          </div>
          <br />
          <h1
            style={{
              textAlign: 'center',
              margin: 'auto 0 0 0',
              fontSize: '24px'
            }}
          >
            АРИЗА
          </h1>
          <br />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            Шуни ёзиб маълум қиламанки менинг {abonentData.licshet} хисоб рақамим онлайн базага нотўғри хисоб китоб қилингани сабабли ўлим
            гувоҳнома тақдим киляпман. Ушбу гувоҳнома асосида қайта хисоб китоб қилиб беришингизни сурайман.
          </p>
          <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
            "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил _______ {abonentData.fio}
          </p>
          {!arizaData._id ? (
            ''
          ) : (
            <>
              <QRCodeCanvas
                value={`ariza_${arizaData._id}_${arizaData.document_number}`}
                size={150}
                bgColor={'#ffffff'}
                fgColor={'#000000'}
                level={'Q'}
                includeMargin={true}
              />
              <p>{arizaData.document_number}</p>
            </>
          )}
        </>
      );
  }
}

function PrintSection({ componentRef, show, ...props }) {
  const { setShowPrintSection } = useStore();
  return (
    <Dialog
      open={show}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // kenglikni belgilash
          maxWidth: '800px' // maksimal kenglik
        }
      }}
    >
      <DialogContent style={{ margin: '40px 55px', fontSize: 14 }}>
        <div id="print" ref={componentRef}>
          {renderSwitch(props)}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowPrintSection(false)}>Chiqish</Button>
        <Button variant="contained" color="primary">
          Chop etish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PrintSection;
