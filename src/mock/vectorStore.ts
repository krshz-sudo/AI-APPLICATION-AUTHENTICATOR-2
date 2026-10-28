import { MOCK_CORPUS, findCorpusRule } from './corpus';
import { RetrievedPassage, ScenarioId } from '../types';

export const VECTOR_DB_LABEL = 'Vector DB (ChromaDB — AICTE APH 2024-27, demo)';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface VectorSearchResult {
  dbLabel: string;
  collectionName: string;
  totalIndexedChunks: number;
  queryText: string;
  embeddingPreview: string;
  latencyMs: number;
  topK: RetrievedPassage[];
}

/**
 * Simulated ChromaDB vector search over AICTE APH 2024–27 regulatory passages.
 * Always waits 650-950ms and returns the pre-assigned top-3 passages with
 * similarity scores like 0.91 / 0.84 / 0.79.
 */
export async function searchVectorStore(
  scenarioId: ScenarioId,
  customQuery?: string
): Promise<VectorSearchResult> {
  const waitMs = 680 + Math.floor(Math.random() * 240);
  await delay(waitMs);

  let ruleIds: [string, string, string] = ['APH-6.1', 'APH-5.1', 'APH-3.1'];
  let scores: [number, number, number] = [0.91, 0.84, 0.79];
  let defaultQuery =
    'AICTE APH 2024-27 faculty_student_ratio 1:20 norm AND fire_noc_valid_until active check AND built_up_area_sqm requirement';

  switch (scenarioId) {
    case 'A':
      ruleIds = ['APH-6.1', 'APH-5.1', 'APH-3.1'];
      scores = [0.91, 0.84, 0.79];
      defaultQuery =
        'verify EoA dossier Sahyadri Tech FSR "1:15", fire_noc_valid_until "30/06/2028", built_up_area "14,850 sq.m" against APH 2024-27 norms';
      break;
    case 'B':
      ruleIds = ['APH-1.1', 'APH-1.5', 'APH-1.3'];
      scores = [0.92, 0.86, 0.78];
      defaultQuery =
        'template schema mandatory permanent_institute_id format 1-NNNNNNN AND fire_noc_valid_until DD/MM/YYYY format check';
      break;
    case 'C':
      ruleIds = ['AUTH-2.2', 'AUTH-3.1', 'AUTH-4.4'];
      scores = [0.91, 0.84, 0.79];
      defaultQuery =
        'visual integrity Fire NOC date stamp region ELA/GAN risk indicator AND Annexure-8 geotagged lab photo perceptual hash duplicate check';
      break;
    case 'D':
      ruleIds = ['APH-6.1', 'APH-5.1', 'APH-2.4'];
      scores = [0.91, 0.84, 0.79];
      defaultQuery =
        'validate non-compliant faculty_student_ratio "18 Faculty (FSR 1:25)" against APH-6.1 1:20 ceiling AND expired fire_noc_valid_until "15/03/2024" against APH-5.1';
      break;
    case 'E':
      ruleIds = ['APH-7.2', 'AUD-2.5', 'APH-4.1'];
      scores = [0.61, 0.58, 0.52];
      defaultQuery =
        'North-East Autonomous Hill Council customary land grant 90-day conversion AND provisional university syndicate intake endorsement exemption';
      break;
  }

  const topK: RetrievedPassage[] = ruleIds.map((id, idx) => {
    const found = findCorpusRule(id) || MOCK_CORPUS[idx];
    return {
      ...found,
      similarityScore: scores[idx],
    };
  });

  return {
    dbLabel: VECTOR_DB_LABEL,
    collectionName: 'aicte_aph_2024_27_corpus_v1',
    totalIndexedChunks: MOCK_CORPUS.length,
    queryText: customQuery || defaultQuery,
    embeddingPreview: '[-0.0241, 0.0819, -0.0412, 0.1104, 0.0093, ... 1536 dims]',
    latencyMs: waitMs,
    topK,
  };
}
