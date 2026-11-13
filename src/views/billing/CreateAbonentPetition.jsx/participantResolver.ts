import fullNameToShortName from 'views/tools/fullNameToShortName';

export type ParticipantKey =
  | 'billing_staff'
  | 'rahbar'
  | 'fuqaro'
  | 'mahalla_raisi'
  | 'mahalla_yettiligi'
  | 'aholi_nazoratchisi';

export interface IParticipantConfig {
  key: ParticipantKey;
  order: number;
  label?: string;
}

export interface ActTypeItem {
  _id?: string;
  companyId: number;
  key: string;
  name: string;
  description?: string;
  participants: IParticipantConfig[];
  isDefault: boolean;
  isActive: boolean;
}

export interface ResolvedParticipant {
  id: string; // Unique stable ID (e.g. 'billing_staff', 'yettilik_hokim_yordamchisi')
  key: ParticipantKey;
  label: string;
  name: string;
  position?: string;
  order: number;
  isExcluded: boolean;
}

/**
 * Mahalla xodimlarining lavozimlarini tekshirish va normallashtirish.
 * Noto'g'ri yoki noaniq lavozimlar yettilikka qo'shilmaydi (null qaytaradi).
 */
export function matchYettilikRole(positionRaw?: string): { roleKey: string; standardTitle: string } | null {
  if (!positionRaw || typeof positionRaw !== 'string') return null;
  const p = positionRaw.trim().toLowerCase();
  if (!p) return null;

  if (p.includes('rais') || p.includes('oqsoqol') || p.includes('раис') || p.includes('оқсоқол')) {
    return { roleKey: 'mahalla_raisi', standardTitle: 'Mahalla raisi' };
  }
  if (p.includes('hokim') || p.includes('xokim') || p.includes('ҳоким') || p.includes('хоким')) {
    return { roleKey: 'hokim_yordamchisi', standardTitle: 'Hokim yordamchisi' };
  }
  if (
    p.includes('profilaktika') ||
    p.includes('uchastkavoy') ||
    p.includes('профилактика') ||
    p.includes('участкавой') ||
    ((p.includes('inspektor') || p.includes('инспектор')) && !p.includes('soliq') && !p.includes('солиқ'))
  ) {
    return { roleKey: 'profilaktika_inspektori', standardTitle: 'Profilaktika inspektori' };
  }
  if (p.includes('yoshlar') || p.includes('yetakchi') || p.includes('ёшлар') || p.includes('етакчи')) {
    return { roleKey: 'yoshlar_yetakchisi', standardTitle: 'Yoshlar yetakchisi' };
  }
  if (
    p.includes('xotin') ||
    p.includes('qizlar') ||
    p.includes('ayollar') ||
    p.includes('хотин') ||
    p.includes('қизлар') ||
    p.includes('аёллар')
  ) {
    return { roleKey: 'xotin_qizlar_faoli', standardTitle: 'Xotin-qizlar faoli' };
  }
  if (p.includes('soliq') || p.includes('солиқ')) {
    return { roleKey: 'soliq_inspektori', standardTitle: 'Soliq inspektori' };
  }
  if (p.includes('ijtimoiy') || p.includes('inson') || p.includes('ижтимоий') || p.includes('инсон')) {
    return { roleKey: 'ijtimoiy_xodim', standardTitle: 'Ijtimoiy xodim' };
  }

  return null;
}

/**
 * Dalolatnoma turi va real obyektlar asosida barcha ishtirokchilarni shakllantirish
 */
export function resolveParticipants(params: {
  actType: ActTypeItem;
  company?: any;
  user?: any;
  abonentData?: any;
  mahalla?: any;
  mahalla2?: any;
  excludedIds?: string[];
  creatorName?: string;
  documentType?: string;
}): ResolvedParticipant[] {
  const { actType, company, user, abonentData, mahalla, mahalla2, excludedIds = [], creatorName, documentType } = params;
  const list: ResolvedParticipant[] = [];

  const mahallaData = mahalla?.data || mahalla;
  const hasExplicitRais = actType.participants?.some((p) => p.key === 'mahalla_raisi');
  // Rais ba'zi kompaniyalarda faqat xodimlar ro'yxatida turadi (mfy_rais_name bo'sh)
  const raisEmployee = (mahallaData?.employees || []).find(
    (emp: any) => emp.fullName?.trim() && matchYettilikRole(emp.position)?.roleKey === 'mahalla_raisi'
  );
  const raisName = (mahallaData?.mfy_rais_name || '').trim() || raisEmployee?.fullName?.trim() || '';
  const raisNameNormalized = raisName.toLowerCase();

  const sortedConfigs = [...(actType.participants || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const cfg of sortedConfigs) {
    switch (cfg.key) {
      case 'billing_staff': {
        const name = creatorName || user?.fullName || company?.billingAdminName || '';
        if (name) {
          list.push({
            id: 'billing_staff',
            key: 'billing_staff',
            label: cfg.label || 'Abonentlar bilan ishlash bo‘limi xodimi:',
            name,
            position: 'Abonentlar bilan ishlash bo‘limi xodimi',
            order: cfg.order,
            isExcluded: excludedIds.includes('billing_staff')
          });
        }
        break;
      }
      case 'rahbar': {
        const name = company?.managerName || company?.manager?.fullName || '';
        if (name) {
          list.push({
            id: 'rahbar',
            key: 'rahbar',
            label: cfg.label || `${company?.name || ''} ${company?.locationName || ''} filial rahbari:`.trim(),
            name,
            position: 'Filial rahbari',
            order: cfg.order,
            isExcluded: excludedIds.includes('rahbar')
          });
        }
        break;
      }
      case 'fuqaro': {
        if (documentType === 'cancelContract') {
          // Shartnomani bekor qilish dalolatnomasida fuqaro qatnashmaydi (abonent mavjud emas)
          break;
        }
        const name = abonentData?.fullName || '';
        if (name) {
          list.push({
            id: 'fuqaro',
            key: 'fuqaro',
            label: cfg.label || 'Fuqaro:',
            name,
            position: 'Fuqaro',
            order: cfg.order,
            isExcluded: excludedIds.includes('fuqaro')
          });
        }
        break;
      }
      // Aholi nazoratchisi umuman imzo qo'yuvchilardan olib tashlangan (telegram bot orqali xabar boradi)
      case 'aholi_nazoratchisi': {
        break;
      }
      case 'mahalla_raisi': {
        list.push({
          id: 'mahalla_raisi',
          key: 'mahalla_raisi',
          label: cfg.label || `${mahallaData?.name || 'MFY'} raisi:`,
          name: raisName,
          position: 'MFY raisi',
          order: cfg.order,
          isExcluded: excludedIds.includes('mahalla_raisi')
        });

        // Agar 2 xil mahalla bo'lsa va mahalla raisi dalolatnoma turiga kiritilgan bo'lsa (faqat Mahalla dalolatnomasida!)
        const mahalla2Data = mahalla2?.data || mahalla2;
        if (
          (documentType === 'dvaynik' || documentType === 'yashovchi_kuchirish') &&
          mahalla2Data?.id &&
          mahallaData?.id &&
          mahalla2Data.id !== mahallaData.id
        ) {
          const rais2Employee = (mahalla2Data?.employees || []).find(
            (emp: any) => emp.fullName?.trim() && matchYettilikRole(emp.position)?.roleKey === 'mahalla_raisi'
          );
          const rais2Name = (mahalla2Data?.mfy_rais_name || '').trim() || rais2Employee?.fullName?.trim() || '';
          list.push({
            id: 'mahalla2_raisi',
            key: 'mahalla_raisi',
            label: `${mahalla2Data.name || 'MFY'} raisi:`,
            name: rais2Name,
            position: 'MFY raisi',
            order: (cfg.order ?? 1) + 0.1,
            isExcluded: excludedIds.includes('mahalla2_raisi')
          });
        }
        break;
      }
      case 'mahalla_yettiligi': {
        const employees = mahallaData?.employees || [];
        const seenRoles = new Set<string>();

        let subIndex = 0;
        for (const emp of employees) {
          if (!emp.fullName?.trim() || !emp.position?.trim()) continue;

          // Rais takrorlanmasligi uchun tekshirish
          if (hasExplicitRais && raisNameNormalized && emp.fullName.trim().toLowerCase() === raisNameNormalized) {
            continue;
          }

          const matched = matchYettilikRole(emp.position);
          if (!matched) continue; // Noma'lum lavozimni taxmin qilmaymiz

          // Agar lavozim rais bo'lsa va rais alohida mavjud bo'lsa, tashlab ketamiz
          if (matched.roleKey === 'mahalla_raisi' && hasExplicitRais) {
            continue;
          }

          if (seenRoles.has(matched.roleKey)) continue;
          seenRoles.add(matched.roleKey);

          const memberId = `yettilik_${matched.roleKey}`;
          list.push({
            id: memberId,
            key: 'mahalla_yettiligi',
            label: `${matched.standardTitle}:`,
            name: emp.fullName.trim(),
            position: matched.standardTitle,
            order: (cfg.order ?? 2) * 10 + subIndex,
            isExcluded: excludedIds.includes(memberId)
          });
          subIndex++;
        }
        break;
      }
    }
  }

  return list;
}

/**
 * Dalolatnoma mazmunida (kirish qismida) tuzuvchi ishtirokchilar ro'yxatini matn ko'rinishida shakllantirish.
 * Faqat dalolatnomada qatnashayotgan (isExcluded bo'lmagan) xodim va fuqarolar kiritiladi.
 */
export function formatParticipantsText(participants?: ResolvedParticipant[] | any[]): string {
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    return '';
  }

  const active = participants.filter(
    (p) => !p.isExcluded && p.key !== 'aholi_nazoratchisi' && p.id !== 'aholi_nazoratchisi'
  );
  if (active.length === 0) return '';

  return active
    .map((p) => {
      const cleanLabel = (p.label || p.position || '').replace(/:$/, '').trim();
      const short = p.name ? fullNameToShortName(p.name) : '';
      if (short && cleanLabel) {
        return `${cleanLabel} ${short}`;
      }
      return short || cleanLabel;
    })
    .filter(Boolean)
    .join(', ');
}
