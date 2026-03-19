const fs = require('fs');
const ExcelJS = require('exceljs');

async function createNewExcelWithColumnO() {
  try {
    console.log('Creating new Excel file with test results in column O...');

    // Test results from our successful test run
    const testResults = [
      { id: 'TC 01', status: 'PASS' },
      { id: 'TC 02', status: 'PASS' },
      { id: 'TC 03', status: 'PASS' },
      { id: 'TC 04', status: 'PASS' },
      { id: 'TC 05', status: 'PASS' },
      { id: 'TC 06', status: 'PASS' },
      { id: 'TC 07', status: 'PASS' },
      { id: 'TC 08', status: 'PASS' },
      { id: 'TC 09', status: 'PASS' },
      { id: 'TC 10', status: 'PASS' }
    ];

    console.log('Test Results Summary:');
    console.log('====================');
    testResults.forEach(result => {
      console.log(`${result.id}: ${result.status}`);
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

    // Create a new workbook for the output with a different name
    const newWorkbook = new ExcelJS.Workbook();
    const newWorksheet = newWorkbook.addWorksheet('Todo');

    // Copy all data from original worksheet to new worksheet
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        newWorksheet.getCell(rowNumber, colNumber).value = cell.value;
        newWorksheet.getCell(rowNumber, colNumber).style = cell.style;
      });
    });

    // Column O is fixed index = 15
    const columnOIndex = 15;
    
    // Update each row with test results
    let updatedCount = 0;
    let notFoundCount = 0;
    
    newWorksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const testCaseId = row.getCell(1).value;
      if (!testCaseId) return;

      // Find the corresponding test result
      const testResult = testResults.find(r => r.id === testCaseId);

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

    // Save the updated Excel file with a different name
    const outputPath = 'test-results-column-o-updated.xlsx';
    await newWorkbook.xlsx.writeFile(outputPath);
    
    console.log(`\n✅ New Excel file created successfully: ${outputPath}`);
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
createNewExcelWithColumnO();