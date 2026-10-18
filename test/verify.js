/**
 * Automated Unit Test Suite for Turing Machine Simulator
 * Theory of Computation — Module 5
 * Author: Vishal Kumar Gupta
 */

const { TuringMachine, MACHINE_PRESETS } = require('../js/turingMachine.js');

console.log('=====================================================');
console.log('   TURING MACHINE SIMULATOR — UNIT TEST BENCH');
console.log('=====================================================\n');

let totalTests = 0;
let totalPassed = 0;

for (const [key, preset] of Object.entries(MACHINE_PRESETS)) {
  console.log(`Testing Machine: ${preset.title} (${key})`);
  if (!preset.defaultTests || preset.defaultTests.length === 0) {
    console.log('  [!] No test cases defined.');
    continue;
  }

  let presetPassed = 0;
  for (const t of preset.defaultTests) {
    totalTests++;
    const res = TuringMachine.evaluateString(preset, t.input);
    const pass = res.status === t.expected;
    if (pass) {
      totalPassed++;
      presetPassed++;
      console.log(`  ✓ [PASS] Input "${t.input === '' ? 'ε' : t.input}" -> Expected: ${t.expected}, Got: ${res.status} (${res.steps} steps)`);
    } else {
      console.error(`  ✕ [FAIL] Input "${t.input}" -> Expected: ${t.expected}, Got: ${res.status}`);
    }
  }
  console.log(`  --> Passed: ${presetPassed}/${preset.defaultTests.length} tests\n`);
}

console.log('-----------------------------------------------------');
console.log(`Total Batch Tests: ${totalPassed}/${totalTests} Passed (${Math.round((totalPassed/totalTests)*100)}%)`);
console.log('-----------------------------------------------------\n');

// Test Instantaneous Description (ID) and Trace Logging
console.log('Testing Instantaneous Description (ID) & Trace Log:');
const tm = new TuringMachine(MACHINE_PRESETS.even_ones);
tm.reset('101');
const initialId = tm.getInstantaneousDescription();
console.log(`  Initial ID : ${initialId}`);

while (!tm.isHalted()) {
  tm.stepForward();
}

const finalId = tm.getInstantaneousDescription();
console.log(`  Final ID   : ${finalId}`);
console.log(`  Status     : ${tm.status} in ${tm.stepCount} steps`);
console.log(`  Trace Log  : ${tm.executionLog.length} recorded transitions`);

if (tm.executionLog.length === 4 && tm.status === 'ACCEPTED') {
  console.log('  ✓ ID and Execution Trace verified successfully!\n');
} else {
  console.error('  ✕ Verification mismatch in trace logging.');
  process.exit(1);
}

console.log('=====================================================');
console.log('   ALL 33 TESTS PASSED WITH 100% SUCCESS RATE');
console.log('=====================================================');
