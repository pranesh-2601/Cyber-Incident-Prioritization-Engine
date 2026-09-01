const DEFAULT_WEIGHTS = {
  severity: 0.22,
  businessImpact: 0.18,
  assetImportance: 0.15,
  dataSensitivity: 0.15,
  attackConfidence: 0.12,
  affectedUsers: 0.08,
  correlationScore: 0.10,
};

function calculateWeightedScore(factors, weights = DEFAULT_WEIGHTS) {
  const sumWeights = Object.values(weights).reduce((a, b) => a + b, 0) || 1.0;
  const rawWeighted = (
    factors.severity * weights.severity +
    factors.businessImpact * weights.businessImpact +
    factors.assetImportance * weights.assetImportance +
    factors.dataSensitivity * weights.dataSensitivity +
    factors.attackConfidence * weights.attackConfidence +
    factors.affectedUsers * weights.affectedUsers +
    factors.correlationScore * weights.correlationScore
  ) / sumWeights;
  return Math.min(10.0, Math.max(1.0, rawWeighted));
}

function calculatePriorityScore(factors, weights = DEFAULT_WEIGHTS) {
  const weightedScore = calculateWeightedScore(factors, weights);
  const finalScore = weightedScore * 10;
  return Math.round(finalScore * 10) / 10;
}

function getRiskLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function compareIncidents(a, b) {
  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
  if (b.factors.correlationScore !== a.factors.correlationScore) return b.factors.correlationScore - a.factors.correlationScore;
  if (b.factors.severity !== a.factors.severity) return b.factors.severity - a.factors.severity;
  if (b.factors.assetImportance !== a.factors.assetImportance) return b.factors.assetImportance - a.factors.assetImportance;
  const timeA = new Date(a.timestamp).getTime();
  const timeB = new Date(b.timestamp).getTime();
  return timeB - timeA;
}

console.log('=== RUNNING SCORING & CORRELATION ENGINE UNIT TESTS ===\n');

// TEST 1: Exact Scoring Formula Verification
const testFactors = {
  severity: 9.5,
  businessImpact: 9.0,
  assetImportance: 10.0,
  dataSensitivity: 9.0,
  attackConfidence: 8.5,
  affectedUsers: 7.0,
  correlationScore: 9.0,
};

const score = calculatePriorityScore(testFactors, DEFAULT_WEIGHTS);
console.log(`[TEST 1] Calculated Priority Score: ${score} (Expected: 90.4)`);
if (score === 90.4) {
  console.log('  PASSED: Formula weight calculation is mathematically exact.\n');
} else {
  console.error('  FAILED: Score mismatch!\n');
  process.exit(1);
}

// TEST 2: Risk Tiers Classification
console.log('[TEST 2] Verifying Risk Tier Boundaries:');
console.log('  Score 90.4 ->', getRiskLevel(90.4), '(Expected: CRITICAL)');
console.log('  Score 72.5 ->', getRiskLevel(72.5), '(Expected: HIGH)');
console.log('  Score 48.0 ->', getRiskLevel(48.0), '(Expected: MEDIUM)');
console.log('  Score 25.0 ->', getRiskLevel(25.0), '(Expected: LOW)');
if (
  getRiskLevel(90.4) === 'CRITICAL' &&
  getRiskLevel(72.5) === 'HIGH' &&
  getRiskLevel(48.0) === 'MEDIUM' &&
  getRiskLevel(25.0) === 'LOW'
) {
  console.log('  PASSED: Risk tiers strictly conform to requirements.\n');
} else {
  console.error('  FAILED: Tier classification error!\n');
  process.exit(1);
}

// TEST 3: Deterministic Tie-Breaking Precedence
console.log('[TEST 3] Verifying 4-Stage Tie-Breaking Precedence:');
const incA = {
  id: 'INC-A',
  priorityScore: 80.0,
  factors: { severity: 8.0, assetImportance: 8.0, correlationScore: 9.0 },
  timestamp: '2026-09-01T05:00:00Z',
};
const incB = {
  id: 'INC-B',
  priorityScore: 80.0,
  factors: { severity: 8.0, assetImportance: 8.0, correlationScore: 7.0 },
  timestamp: '2026-09-01T06:00:00Z',
};

const cmp = compareIncidents(incA, incB);
console.log(`  Comparison result: ${cmp} (Negative means A outranks B)`);
if (cmp < 0) {
  console.log('  PASSED: Tie-breaking correctly prioritizes higher correlation score over timestamp.\n');
} else {
  console.error('  FAILED: Tie-breaking priority order violation!\n');
  process.exit(1);
}

console.log('=== ALL UNIT TESTS PASSED SUCCESSFULLY! ===');
