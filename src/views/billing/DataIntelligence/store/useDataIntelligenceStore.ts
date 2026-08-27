import { create } from 'zustand';
import {
  RecordSource,
  MatchingResult,
  WeightConfig,
  DEFAULT_WEIGHTS,
  evaluateMatch
} from '../engine/matchingEngine';
import {
  searchGreenZoneRealApi,
  CandidateResult
} from '../engine/candidateFinder';
import {
  StagingRecord,
  ImportBatch,
  ComparisonLogItem
} from '../mock/mockData';

interface DataIntelligenceState {
  // Navigation
  activeTab: number;
  setActiveTab: (tab: number) => void;

  // Staging state (faqat operator yuklagan real Excel fayllar)
  stagingRecords: StagingRecord[];
  importBatches: ImportBatch[];
  stagingSearchQuery: string;
  stagingStatusFilter: 'all' | 'valid' | 'warning' | 'error';
  setStagingSearchQuery: (query: string) => void;
  setStagingStatusFilter: (filter: 'all' | 'valid' | 'warning' | 'error') => void;
  addStagingBatch: (batch: ImportBatch, records: StagingRecord[]) => void;
  deleteStagingRecord: (id: string) => void;
  clearAllStaging: () => void;

  // Candidate Finder state (1-Bosqich: Real GreenZone bazasi bo'yicha qidiruv)
  candidateQueryRecord: RecordSource;
  candidateSearchResults: CandidateResult[];
  candidateSearchTimeMs: number;
  isSearchingCandidates: boolean;
  setCandidateQueryRecord: (patch: Partial<RecordSource>) => void;
  searchCandidates: (query?: RecordSource, options?: Partial<CandidateSearchOptions>) => Promise<void>;
  startCandidateSearchForStagingRecord: (record: RecordSource, options?: Partial<CandidateSearchOptions>) => Promise<void>;

  // Matching Playground state (2-Bosqich: Aniq 1-ga-1 solishtirish)
  sourceA: RecordSource;
  sourceB: RecordSource;
  customWeights: WeightConfig;
  currentMatchResult: MatchingResult | null;
  isEvaluating: boolean;
  setSourceA: (patch: Partial<RecordSource>) => void;
  setSourceB: (patch: Partial<RecordSource>) => void;
  setWeights: (weights: WeightConfig) => void;
  resetWeights: () => void;
  runMatch: () => void;
  loadPairIntoPlayground: (sourceA: RecordSource, sourceB?: RecordSource) => void;
  resetPlaygroundForm: () => void;

  // Audit / History log
  comparisonLogs: ComparisonLogItem[];
  saveCurrentResultToLog: (operatorNote?: string) => void;
  deleteLogItem: (id: string) => void;
  clearAllLogs: () => void;
}

const emptyRecord = (source: 'soliq' | 'greenzone' | 'manual'): RecordSource => ({
  fullName: '',
  pnfl: '',
  cadastreNumber: '',
  mahalla: '',
  street: '',
  objectType: '',
  phone: '',
  tin: '',
  source
});

export const useDataIntelligenceStore = create<DataIntelligenceState>((set, get) => ({
  activeTab: 0,
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Staging (boshida bo'sh)
  stagingRecords: [],
  importBatches: [],
  stagingSearchQuery: '',
  stagingStatusFilter: 'all',
  setStagingSearchQuery: (query) => set({ stagingSearchQuery: query }),
  setStagingStatusFilter: (filter) => set({ stagingStatusFilter: filter }),
  addStagingBatch: (batch, newRecords) => {
    set((state) => ({
      importBatches: [batch, ...state.importBatches],
      stagingRecords: [...newRecords, ...state.stagingRecords]
    }));
  },
  deleteStagingRecord: (id) => {
    set((state) => ({
      stagingRecords: state.stagingRecords.filter((r) => r.id !== id)
    }));
  },
  clearAllStaging: () => set({ stagingRecords: [], importBatches: [] }),

  // Candidate Finder (Haqiqiy GreenZone bazasi)
  candidateQueryRecord: emptyRecord('soliq'),
  candidateSearchResults: [],
  candidateSearchTimeMs: 0,
  isSearchingCandidates: false,

  setCandidateQueryRecord: (patch) => {
    set((state) => ({
      candidateQueryRecord: { ...state.candidateQueryRecord, ...patch }
    }));
  },

  searchCandidates: async (query, options) => {
    const targetQuery = query || get().candidateQueryRecord;
    set({ isSearchingCandidates: true });

    try {
      const res = await searchGreenZoneRealApi(targetQuery, {
        weights: get().customWeights,
        mahallaId: options?.mahallaId,
        neighborMahallaIds: options?.neighborMahallaIds,
        includeNeighbors: options?.includeNeighbors
      });
      set({
        candidateQueryRecord: targetQuery,
        candidateSearchResults: res.candidates,
        candidateSearchTimeMs: res.searchTimeMs,
        isSearchingCandidates: false
      });
    } catch (err) {
      set({
        candidateSearchResults: [],
        candidateSearchTimeMs: 0,
        isSearchingCandidates: false
      });
    }
  },

  startCandidateSearchForStagingRecord: async (record, options) => {
    set({ candidateQueryRecord: { ...record }, isSearchingCandidates: true, activeTab: 1 });
    try {
      const res = await searchGreenZoneRealApi(record, {
        weights: get().customWeights,
        mahallaId: options?.mahallaId,
        neighborMahallaIds: options?.neighborMahallaIds,
        includeNeighbors: options?.includeNeighbors
      });
      set({
        candidateSearchResults: res.candidates,
        candidateSearchTimeMs: res.searchTimeMs,
        isSearchingCandidates: false
      });
    } catch {
      set({
        candidateSearchResults: [],
        candidateSearchTimeMs: 0,
        isSearchingCandidates: false
      });
    }
  },

  // Playground (Stage 2)
  sourceA: emptyRecord('soliq'),
  sourceB: emptyRecord('greenzone'),
  customWeights: { ...DEFAULT_WEIGHTS },
  currentMatchResult: null,
  isEvaluating: false,

  setSourceA: (patch) => {
    set((state) => {
      const updatedA = { ...state.sourceA, ...patch };
      const res = evaluateMatch(updatedA, state.sourceB, state.customWeights);
      return { sourceA: updatedA, currentMatchResult: res };
    });
  },

  setSourceB: (patch) => {
    set((state) => {
      const updatedB = { ...state.sourceB, ...patch };
      const res = evaluateMatch(state.sourceA, updatedB, state.customWeights);
      return { sourceB: updatedB, currentMatchResult: res };
    });
  },

  setWeights: (weights) => {
    set((state) => {
      const res = state.currentMatchResult ? evaluateMatch(state.sourceA, state.sourceB, weights) : null;
      return {
        customWeights: weights,
        currentMatchResult: res
      };
    });
  },

  resetWeights: () => {
    set((state) => {
      const res = state.currentMatchResult ? evaluateMatch(state.sourceA, state.sourceB, DEFAULT_WEIGHTS) : null;
      return {
        customWeights: { ...DEFAULT_WEIGHTS },
        currentMatchResult: res
      };
    });
  },

  runMatch: () => {
    const { sourceA, sourceB, customWeights } = get();
    set({ isEvaluating: true });
    setTimeout(() => {
      const res = evaluateMatch(sourceA, sourceB, customWeights);
      set({ currentMatchResult: res, isEvaluating: false });
    }, 50);
  },

  loadPairIntoPlayground: (recordA, recordB) => {
    const targetB = recordB || { ...get().sourceB };
    const res = evaluateMatch(recordA, targetB, get().customWeights);
    set({
      sourceA: { ...recordA },
      sourceB: { ...targetB },
      currentMatchResult: res,
      activeTab: 2 // Switch to Playground tab
    });
  },

  resetPlaygroundForm: () => {
    const newA = emptyRecord('soliq');
    const newB = emptyRecord('greenzone');
    set({
      sourceA: newA,
      sourceB: newB,
      currentMatchResult: null
    });
  },

  // Audit Logs
  comparisonLogs: [],
  saveCurrentResultToLog: (operatorNote) => {
    const { sourceA, sourceB, currentMatchResult } = get();
    if (!currentMatchResult) return;

    const newLogItem: ComparisonLogItem = {
      id: `log-${Date.now()}`,
      sourceA: { ...sourceA },
      sourceB: { ...sourceB },
      overallScore: currentMatchResult.overallScore,
      matchType: currentMatchResult.matchType,
      categoryLabel: currentMatchResult.categoryLabel,
      categoryColor: currentMatchResult.categoryColor,
      testedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      operatorNote: operatorNote || `${currentMatchResult.categoryLabel} (${currentMatchResult.overallScore}%)`
    };

    set((state) => ({
      comparisonLogs: [newLogItem, ...state.comparisonLogs]
    }));
  },

  deleteLogItem: (id) => {
    set((state) => ({
      comparisonLogs: state.comparisonLogs.filter((item) => item.id !== id)
    }));
  },

  clearAllLogs: () => set({ comparisonLogs: [] })
}));
