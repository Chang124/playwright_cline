const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Test case mapping
const testCaseMapping = {
  'TC 01 - Check UI elements on the screen': 'TC 01',
  'TC 02 - Create a new task': 'TC 02',
  'TC 03 - Hover on created task to show clear button': 'TC 03',
  'TC 04 - Delete a created task': 'TC 04',
  'TC 05 - Create multiple tasks': 'TC 05',
  'TC 06 - Click checkbox to mark as completed': 'TC 06',
  'TC 07 - Check filter All': 'TC 07',
  'TC 08 - Check filter Active': 'TC 08',
  'TC 09 - Check filter Completed': 'TC 09',
  'TC 10 - Check Clear Completed button': 'TC 10'
};

async function waitForTestOutput() {
  const testOutputPath = 'test-output.json';
  
  console.log('Waiting for test output file to be populated...');
  
  // Wait for the file to have content
  let attempts = 0;
  const maxAttempts = 60; // Wait up to 10 minutes (60 * 10 seconds)
  
  while (attempts < maxAttempts) {
    if (fs.existsSync(testOutputPath)) {
      const stats = fs.statSync(testOutputPath);
      if (stats.size > 0) {
        console.log('Test output file is ready!');
        return true;
      }
    }
    
    attempts++;
    console.log(`Attempt ${attempts}/${maxAttempts}: File not ready yet, waiting 10 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  throw new Error('Test output file was not created or is empty after waiting');
}

async function processTestResultsAndUpdateExcel() {
  try {
    // Wait for test output to be ready
    await waitForTestOutput();
    
    // Read the JSON output from the test run
    const testOutput = fs.readFileSync('test-output.json', 'utf8');
    
    console.log('Processing test results from JSON output...');
    
    // Parse JSON output
    const lines = testOutput.split('\n').filter(line => line.trim());
    const testResults = [];
    
    for (const line of lines) {
      try {
        const result = JSON.parse(line);
        if (result.type === 'test' && result.spec) {
          testResults.push(result);
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    }

    // Group results by test case
    const groupedResults = {};
    testResults.forEach(result => {
      const testTitle = result.spec.title;
      if (!groupedResults[testTitle]) {
        groupedResults[testTitle] = {
          title: testTitle,
          status: 'PASSED',
          duration: 0,
          errors: []
        };
      }
      
      // Update status if any browser failed
      if (result.status === 'failed') {
        groupedResults[testTitle].status = 'FAILED';
        if (result.error) {
          groupedResults[testTitle].errors.push(result.error.message || 'Unknown error');
        }
      }
      
      // Track duration
      groupedResults[testTitle].duration = Math.max(groupedResults[testTitle].duration, result.duration || 0);
    });

    console.log('Test Results Summary:');
    console.log('====================');
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    Object.values(groupedResults).forEach(result => {
      totalTests++;
      if (result.status === 'PASSED') {
        passedTests++;
        console.log(`✅ ${result.title} - PASSED (${result.duration}ms)`);
      } else {
        failedTests++;
        console.log(`❌ ${result.title} - FAILED (${result.duration}ms)`);
        if (result.errors.length > 0) {
          result.errors.forEach(error => console.log(`   Error: ${error}`));
        }
      }
    });

    console.log(`\nSummary: ${totalTests} total, ${passedTests} passed, ${failedTests} failed`);
    console.log(`Pass rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Map test results to Test Case IDs
    const mappedResults = [];
    Object.values(groupedResults).forEach(result => {
      const testCaseId = testCaseMapping[result.title];
      if (testCaseId) {
        mappedResults.push({
          id: testCaseId,
          status: result.status === 'PASSED' ? 'PASS' : 'FAILED'
        });
      }
    });

    // Read the original Excel file
    const workbook = new ExcelJS.Workbook();
    const excelPath = 'c:/Users/Admin/Downloads/Todo_testcases.xlsx';
    
    if (!fs.existsSync(excelPath)) {
      console.error('Excel file not found at:', excelPath);
      return;
    }

    await workbook.xlsx.readFile(excelPath);
    const worksheet = workbook.getWorksheet('Todo');

    if (!worksheet) {
      console.error('Worksheet "Todo" not found in Excel file');
      return;
    }

    // Column O is fixed index = 15
    const columnOIndex = 15;
    
    // Update each row with test results
    let updatedCount = 0;
    let notFoundCount = 0;
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const testCaseId = row.getCell(1).value;
      if (!testCaseId) return;

      // Find the corresponding test result
      const testResult = mappedResults.find(r => r.id === testCaseId);

      if (testResult) {
        // Update ONLY column O (index 15)
        row.getCell(columnOIndex).value = testResult.status;
        updatedCount++;
        console.log(`Updated ${testCaseId} in column O: ${testResult.status}`);
      } else {
        // Test not found
        notFoundCount++;
        console.log(`Test Case ID ${testCaseId} not found in results - skipping`);
      }
    });

    // Save the updated Excel file
    const outputPath = 'test-results-updated.xlsx';
    await workbook.xlsx.writeFile(outputPath);
    
    console.log(`\n✅ Excel file updated successfully: ${outputPath}`);
    console.log(`📊 Statistics:`);
    console.log(`   - Rows updated: ${updatedCount}`);
    console.log(`   - Test Case IDs not found: ${notFoundCount}`);
    console.log(`   - Column O (index 15) contains: PASS/FAILED only`);
    console.log(`   - All other columns preserved unchanged`);

  } catch (error) {
    console.error('Error processing test results:', error.message);
  }
}

// Run the script
processTestResultsAndUpdateExcel();