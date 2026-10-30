import { runAllTestCases } from './src/utils/testSuites.js';

console.log('================ RUNNING AI TRAFFIC FLOW TEST SUITES ================');
const results = runAllTestCases();
let passedCount = 0;

results.forEach(res => {
  if (res.passed) {
    passedCount++;
    console.log(`[PASS] Test ${res.testId}: ${res.title}`);
    console.log(`       Details: ${res.details}`);
  } else {
    console.error(`[FAIL] Test ${res.testId}: ${res.title}`);
    console.error(`       Details: ${res.details}`);
  }
});

console.log('=====================================================================');
console.log(`TEST SUMMARY: ${passedCount}/${results.length} PASSED`);
if (passedCount === results.length) {
  console.log('ALL VERIFICATION TEST SUITES PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
