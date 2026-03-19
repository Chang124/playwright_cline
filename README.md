# TodoMVC Automated Test Suite

Automated test suite for TodoMVC application based on test cases from `Todo_testcases.xlsx`.

## Project Structure

```
tests/
├── pages/
│   └── TodoPage.js          # Page Object Model for TodoMVC
├── utils/
│   └── testData.js          # Test data and constants
├── todomvc-complete.spec.js # Complete test suite (10 test cases)
└── todomvc.spec.js          # Original simple test (kept for reference)

modern-todomvc-vanillajs/     # TodoMVC application source
```

## Test Cases Covered

| Test Case | Description | Test Function |
|-----------|-------------|---------------|
| TC 01 | Check UI elements on the screen | `TC 01 - Check UI elements on the screen` |
| TC 02 | Create a new task | `TC 02 - Create a new task` |
| TC 03 | Hover on created task | `TC 03 - Hover on created task to show clear button` |
| TC 04 | Delete a created task | `TC 04 - Delete a created task` |
| TC 05 | Create multiple tasks | `TC 05 - Create multiple tasks` |
| TC 06 | Click checkbox to mark as completed | `TC 06 - Click checkbox to mark as completed` |
| TC 07 | Check filter All | `TC 07 - Check filter All` |
| TC 08 | Check filter Active | `TC 08 - Check filter Active` |
| TC 09 | Check filter Completed | `TC 09 - Check filter Completed` |
| TC 10 | Check Clear Completed button | `TC 10 - Check Clear Completed button` |

## Dependencies

### Required Dependencies
- Node.js (version 18 or higher recommended)
- Playwright Test framework
- Playwright Chromium browser

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install
```

## How to Run Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test tests/todomvc-complete.spec.js
```

### Run Specific Test Case
```bash
npx playwright test tests/todomvc-complete.spec.js -g "TC 01"
```

### Run Tests with UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (see browser)
```bash
npx playwright test --headed
```

### Run Tests with Video Recording
```bash
npx playwright test --video on
```

## Test Configuration

The test configuration is in `playwright.config.js`:

- **Browser**: Chromium
- **Test Timeout**: 30 seconds
- **Base URL**: `http://172.25.96.1:8080`
- **Test Files**: `tests/**/*.spec.js`

## Page Object Model

The `TodoPage.js` file implements the Page Object Model pattern with:

- **Element Locators**: All page elements with descriptive names
- **Action Methods**: Reusable methods for common operations
- **Assertion Helpers**: Methods for checking page state

## Test Data

The `testData.js` file contains:

- UI element text and placeholders
- Test todo items and expected results
- Filter names and states

## Best Practices Implemented

✅ **Reusable Functions**: All common operations are in the Page Object Model  
✅ **Clear Naming**: Test functions map directly to Excel test case IDs  
✅ **Comments**: Each test maps to original test case ID from Excel  
✅ **Proper Waits**: Using Playwright's auto-waiting, no hard waits  
✅ **Assertions**: Based on expected results from test cases  
✅ **Error Handling**: Tests fail gracefully with clear error messages  

## Test Execution Flow

1. **Setup**: Navigate to TodoMVC application
2. **Test Execution**: Run each test case independently
3. **Cleanup**: Playwright handles browser cleanup automatically
4. **Reporting**: Generate detailed test reports

## Expected Test Results

All tests should pass if:
- TodoMVC application is running at `http://172.25.96.1:8080`
- Application behaves according to the Excel test case specifications
- No network or browser issues occur

## Troubleshooting

### Application Not Running
Ensure the TodoMVC application is running at the configured URL.

### Browser Issues
Run `npx playwright install` to ensure browsers are properly installed.

### Test Failures
- Check application URL in `playwright.config.js`
- Verify application functionality manually
- Run tests with `--headed` flag to see browser actions

## Generated Reports

After running tests, reports are generated in:
- `playwright-report/` - HTML test report
- `test-results/` - Detailed test results and videos (if enabled)