export interface AssignedMfy {
  mfy_id: number;
  mfy_name: string;
}

export interface InspectorRow {
  _id?: string;
  id: number;
  name: string;
  activ: boolean;
  biriktirilgan: AssignedMfy[];
  telegram_id?: number[];
  hasTelegram?: boolean;
  telegramUsername?: string | null;
  telegramLinkedAt?: string | null;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  blockedBy?: string | null;
  isTerminalBlocked?: boolean;
  terminalBlockedAt?: string | null;
  terminalBlockedReason?: string | null;
  terminalBlockedBy?: string | null;
  isBotBlocked?: boolean;
  botBlockedAt?: string | null;
  botBlockedReason?: string | null;
  botBlockedBy?: string | null;
  terminalId?: number | null;
  terminalSerial?: string | null;
  terminalCompanyId?: number | null;
}

export interface Mahalla {
  id: number;
  name: string;
  reja: number;
  biriktirilganNazoratchi: {
    inspactor_id: number | null;
  };
}

export interface InspectorsApiResponse {
  rows: InspectorRow[];
  mahallalar: Mahalla[];
}

export interface FlatInspectorRow {
  id: number;
  name: string;
  activ: boolean;
  biriktirilgan: AssignedMfy[];
}

export type ChooseType = 'inspector' | 'mfy';

export interface OpenChooseModalParams {
  type: ChooseType;
  focus: number;
}
