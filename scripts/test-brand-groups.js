/**
 * Test Brand Groups Filter Functions
 * Run with: node scripts/test-brand-groups.js
 */

import { isAudiRSModel, isBMWMModel, isMercedesAMGModel } from '../lib/brandGroups.js';

console.log('🧪 Testing Brand Groups Filter Functions\n');

// Test Audi RS/S models
console.log('=== AUDI RS/S MODELS ===');
const audiModels = [
  // Should be RS/S (true)
  { name: 'RS3', expected: true },
  { name: 'RS4', expected: true },
  { name: 'RS5', expected: true },
  { name: 'RS6', expected: true },
  { name: 'RS7', expected: true },
  { name: 'RS Q3', expected: true },
  { name: 'RS Q8', expected: true },
  { name: 'RSQ3', expected: true },
  { name: 'RSQ8', expected: true },
  { name: 'S3', expected: true },
  { name: 'S4', expected: true },
  { name: 'S5', expected: true },
  { name: 'S6', expected: true },
  { name: 'S7', expected: true },
  { name: 'S8', expected: true },
  { name: 'SQ5', expected: true },
  { name: 'SQ7', expected: true },
  { name: 'SQ8', expected: true },
  { name: 'TT RS', expected: true },
  { name: 'TTS', expected: true },
  // Should be Standard (false)
  { name: 'A3', expected: false },
  { name: 'A4', expected: false },
  { name: 'A5', expected: false },
  { name: 'A6', expected: false },
  { name: 'A7', expected: false },
  { name: 'A8', expected: false },
  { name: 'Q3', expected: false },
  { name: 'Q5', expected: false },
  { name: 'Q7', expected: false },
  { name: 'Q8', expected: false },
  { name: 'TT', expected: false },
  { name: 'e-tron', expected: false },
  { name: 'e-tron GT', expected: false },
];

let audiPass = 0;
let audiFail = 0;
audiModels.forEach(({ name, expected }) => {
  const result = isAudiRSModel(name);
  const status = result === expected ? '✅' : '❌';
  if (result === expected) audiPass++;
  else audiFail++;
  console.log(`${status} ${name}: ${result} (expected: ${expected})`);
});
console.log(`\nAudi: ${audiPass} passed, ${audiFail} failed\n`);

// Test BMW M models
console.log('=== BMW M MODELS ===');
const bmwModels = [
  // Should be M (true)
  { name: 'M2', expected: true },
  { name: 'M3', expected: true },
  { name: 'M4', expected: true },
  { name: 'M5', expected: true },
  { name: 'M6', expected: true },
  { name: 'M8', expected: true },
  { name: 'X3 M', expected: true },
  { name: 'X4 M', expected: true },
  { name: 'X5 M', expected: true },
  { name: 'X6 M', expected: true },
  { name: 'XM', expected: true },
  { name: '1M Coupé', expected: true },
  // Should be Standard (false)
  { name: '1 Serie', expected: false },
  { name: '2 Serie', expected: false },
  { name: '3 Serie', expected: false },
  { name: '4 Serie', expected: false },
  { name: '5 Serie', expected: false },
  { name: '7 Serie', expected: false },
  { name: '8 Serie', expected: false },
  { name: 'X1', expected: false },
  { name: 'X2', expected: false },
  { name: 'X3', expected: false },
  { name: 'X4', expected: false },
  { name: 'X5', expected: false },
  { name: 'X6', expected: false },
  { name: 'X7', expected: false },
  { name: 'Z4', expected: false },
  { name: 'i3', expected: false },
  { name: 'i4', expected: false },
  { name: 'iX', expected: false },
];

let bmwPass = 0;
let bmwFail = 0;
bmwModels.forEach(({ name, expected }) => {
  const result = isBMWMModel(name);
  const status = result === expected ? '✅' : '❌';
  if (result === expected) bmwPass++;
  else bmwFail++;
  console.log(`${status} ${name}: ${result} (expected: ${expected})`);
});
console.log(`\nBMW: ${bmwPass} passed, ${bmwFail} failed\n`);

// Test Mercedes AMG models
console.log('=== MERCEDES AMG MODELS ===');
const mercedesModels = [
  // Should be AMG (true)
  { name: 'AMG GT', expected: true },
  { name: 'A 45 AMG', expected: true },
  { name: 'C 63 AMG', expected: true },
  { name: 'E 63 AMG', expected: true },
  { name: 'S 63 AMG', expected: true },
  { name: 'GLA 45 AMG', expected: true },
  { name: 'GLC 63 AMG', expected: true },
  { name: 'GLE 63 AMG', expected: true },
  // Should be Standard (false)
  { name: 'A-Klasse', expected: false },
  { name: 'B-Klasse', expected: false },
  { name: 'C-Klasse', expected: false },
  { name: 'E-Klasse', expected: false },
  { name: 'S-Klasse', expected: false },
  { name: 'GLA', expected: false },
  { name: 'GLB', expected: false },
  { name: 'GLC', expected: false },
  { name: 'GLE', expected: false },
  { name: 'GLS', expected: false },
  { name: 'CLA', expected: false },
  { name: 'CLS', expected: false },
  { name: 'EQC', expected: false },
  { name: 'EQS', expected: false },
];

let mercedesPass = 0;
let mercedesFail = 0;
mercedesModels.forEach(({ name, expected }) => {
  const result = isMercedesAMGModel(name);
  const status = result === expected ? '✅' : '❌';
  if (result === expected) mercedesPass++;
  else mercedesFail++;
  console.log(`${status} ${name}: ${result} (expected: ${expected})`);
});
console.log(`\nMercedes: ${mercedesPass} passed, ${mercedesFail} failed\n`);

// Summary
const totalPass = audiPass + bmwPass + mercedesPass;
const totalFail = audiFail + bmwFail + mercedesFail;
console.log('=== SUMMARY ===');
console.log(`Total: ${totalPass} passed, ${totalFail} failed`);
if (totalFail === 0) {
  console.log('✅ All tests passed!');
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}

