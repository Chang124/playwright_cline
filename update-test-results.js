const { execSync } = require('child_process');
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

async function updateExcelWithTestResults() {
  try {
    console.log('Running Playwright tests...');
    
    // Run tests and capture JSON output
    const testOutput = execSync('npx playwright test tests/todomvc-complete.spec.js --reporter=json', {
      encoding: 'utf8',
      timeout: 300000 // 5 minutes timeout
    });

    console.log('Tests completed. Processing results...');

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

    // Add new columns if they don't exist
    const headers = [
      'Actual Result', 'Status', 'Execution Date', 'Error Log'
    ];
    
    // Find the last column with data
    let lastCol = 0;
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      if (cell.value) lastCol = colNumber;
    });

    // Add new headers
    headers.forEach((header, index) => {
      const colNumber = lastCol + 1 + index;
      worksheet.getCell(1, colNumber).value = header;
    });

    // Update each row with test results
    const executionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const testCaseId = row.getCell(1).value;
      if (!testCaseId || !testCaseMapping) return;

      // Find the corresponding test result
      let testResult = null;
      for (const [testTitle, result] of Object.entries(groupedResults)) {
        if (testCaseMapping[testTitle] === testCaseId) {
          testResult = result;
          break;
        }
      }

      if (testResult) {
        // Update columns
        worksheet.getCell(rowNumber, lastCol + 1).value = testResult.status === 'PASSED' 
          ? 'Test executed successfully' 
          : `Test failed: ${testResult.errors.join('; ')}`;
        
        worksheet.getCell(rowNumber, lastCol + 2).value = testResult.status;
        worksheet.getCell(rowNumber, lastCol + 3).value = executionDate;
        worksheet.getCell(rowNumber, lastCol + 4).value = testResult.errors.length > 0 
          ? testResult.errors.join('; ') 
          : '';
      } else {
        // Test not found
        worksheet.getCell(rowNumber, lastCol + 1).value = 'Test not executed';
        worksheet.getCell(rowNumber, lastCol + 2).value = 'NOT_EXECUTED';
        worksheet.getCell(rowNumber, lastCol + 3).value = executionDate;
        worksheet.getCell(rowNumber, lastCol + 4).value = 'Test case not found in automation suite';
      }
    });

    // Save the updated Excel file
    const outputPath = 'test-results-updated.xlsx';
    await workbook.xlsx.writeFile(outputPath);
    
    console.log(`\n✅ Excel file updated successfully: ${outputPath}`);
    console.log('\nUpdated columns:');
    headers.forEach((header, index) => {
      console.log(`- ${header} (Column ${String.fromCharCode(65 + lastCol + index)})`);
    });

  } catch (error) {
    console.error('Error processing test results:', error.message);
    if (error.stdout) {
      console.error('STDOUT:', error.stdout);
    }
    if (error.stderr) {
      console.error('STDERR:', error.stderr);
    }
  }
}

// Run the script
updateExcelWithTestResults();