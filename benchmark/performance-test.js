const levenshtein = require('../levenshtein');

// Helper function to measure execution time
function benchmark(name, fn, iterations = 10000) {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = process.hrtime.bigint();
  const timeMs = Number(end - start) / 1000000;
  const opsPerSec = Math.round((iterations / timeMs) * 1000);
  console.log(`${name}: ${timeMs.toFixed(2)}ms (${opsPerSec.toLocaleString()} ops/sec)`);
  return timeMs;
}

console.log('=== Fast-Levenshtein Performance Benchmarks ===\n');

// Test 1: Early exit optimization - identical strings
console.log('Test 1: Identical strings (early exit)');
const identicalStr = 'thisisateststring';
benchmark('  Identical strings', () => {
  levenshtein.get(identicalStr, identicalStr);
}, 100000);

// Test 2: Short strings
console.log('\nTest 2: Short strings (4-8 chars)');
benchmark('  "back" <-> "book"', () => {
  levenshtein.get('back', 'book');
}, 50000);

// Test 3: Medium strings
console.log('\nTest 3: Medium strings (10-20 chars)');
benchmark('  "levenshtein" <-> "frankenstein"', () => {
  levenshtein.get('levenshtein', 'frankenstein');
}, 50000);

// Test 4: Long strings
console.log('\nTest 4: Long strings (100+ chars)');
const longStr1 = 'Morbi interdum ultricies neque varius condimentum. Donec volutpat turpis interdum metus ultricies vulputate.';
const longStr2 = 'Duis erat dolor, cursus in tincidunt a, lobortis in odio. Cras magna sem, pharetra et iaculis quis.';
benchmark('  Long text comparison', () => {
  levenshtein.get(longStr1, longStr2);
}, 10000);

// Test 5: Cache performance - repeated comparisons
console.log('\nTest 5: Cache performance (with useCollator)');
const cacheStr1 = 'mikailovitch';
const cacheStr2 = 'Mikhaïlovitch';
benchmark('  Repeated comparisons (first run)', () => {
  levenshtein.get(cacheStr1, cacheStr2, { useCollator: true });
}, 1000);

// Same test to show cache hit performance
benchmark('  Repeated comparisons (cached)', () => {
  levenshtein.get(cacheStr1, cacheStr2, { useCollator: true });
}, 10000);

// Test 6: Non-latin characters
console.log('\nTest 6: Non-latin characters');
benchmark('  "你好世界" <-> "你好"', () => {
  levenshtein.get('你好世界', '你好');
}, 20000);

// Test 7: Mixed workload
console.log('\nTest 7: Mixed workload (various string lengths)');
const testPairs = [
  ['hello', 'hello'],
  ['a', 'b'],
  ['back', 'book'],
  ['example', 'samples'],
  ['levenshtein', 'frankenstein'],
  ['distance', 'difference'],
  ['javawasneat', 'scalaisgreat'],
  longStr1.substring(0, 50),
  longStr2.substring(0, 50)
];
let pairIndex = 0;
benchmark('  Mixed string pairs', () => {
  const pair = testPairs[pairIndex % testPairs.length];
  levenshtein.get(pair[0] || pair, pair[1] || pair);
  pairIndex++;
}, 50000);

// Test 8: Empty strings and edge cases
console.log('\nTest 8: Edge cases');
benchmark('  Empty string <-> "test"', () => {
  levenshtein.get('', 'test');
}, 50000);

benchmark('  Single char <-> Single char', () => {
  levenshtein.get('a', 'b');
}, 100000);

console.log('\n=== Benchmark Complete ===');
