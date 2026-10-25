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

  if (p.includes('rais') || p.includes('oqsoqol')) {
    return { roleKey: 'mahalla_raisi', standardTitle: 'Mahalla raisi' };
  }
  if (p.includes('hokim') || p.includes('xokim')) {
    return { roleKey: 'hokim_yordamchisi', standardTitle: 'Hokim yordamchisi' };
  }
  if (p.includes('profilaktika') || p.includes('uchastkavoy') || (p.includes('inspektor') && !p.includes('soliq'))) {
    return { roleKey: 'profilaktika_inspektori', standardTitle: 'Profilaktika inspektori' };
  }
  if (p.includes('yoshlar') || p.includes('yetakchi')) {
    return { roleKey: 'yoshlar_yetakchisi', standardTitle: 'Yoshlar yetakchisi' };
  }
  if (p.includes('xotin') || p.includes('qizlar') || p.includes('ayollar')) {
    return { roleKey: 'xotin_qizlar_faoli', standardTitle: 'Xotin-qizlar faoli' };
  }
  if (p.includes('soliq')) {
    return { roleKey: 'soliq_inspektori', standardTitle: 'Soliq inspektori' };
  }
  if (p.includes('ijtimoiy') || p.includes('inson')) {
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
  excludedIds?: string[];
  creatorName?: string;
}): ResolvedParticipant[] {
  const { actType, company, user, abonentData, mahalla, excludedIds = [], creatorName } = params;
  const list: ResolvedParticipant[] = [];

  const mahallaData = mahalla?.data || mahalla;
  const hasExplicitRais = actType.participants?.some((p) => p.key === 'mahalla_raisi');
  const raisNameNormalized = (mahallaData?.mfy_rais_name || '').trim().toLowerCase();

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
      case 'aholi_nazoratchisi': {
        const name = mahallaData?.biriktirilganNazoratchi?.inspector_name || '';
        if (name) {
          list.push({
            id: 'aholi_nazoratchisi',
            key: 'aholi_nazoratchisi',
            label: cfg.label || 'Aholi nazoratchisi:',
            name,
            position: 'Aholi nazoratchisi',
            order: cfg.order,
            isExcluded: excludedIds.includes('aholi_nazoratchisi')
          });
        }
        break;
      }
      case 'mahalla_raisi': {
        const name = mahallaData?.mfy_rais_name || '';
        if (name) {
          list.push({
            id: 'mahalla_raisi',
            key: 'mahalla_raisi',
            label: cfg.label || `${mahallaData?.name || 'MFY'} raisi:`,
            name,
            position: 'MFY raisi',
            order: cfg.order,
            isExcluded: excludedIds.includes('mahalla_raisi')
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
