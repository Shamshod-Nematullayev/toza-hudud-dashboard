export interface AssignedMfy {
  mfy_id: number;
  mfy_name: string;
}

export interface InspectorRow {
  id: number;
  name: string;
  activ: boolean;
  biriktirilgan: AssignedMfy[];
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
