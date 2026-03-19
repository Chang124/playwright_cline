/**
 * TodoMVC Automated Test Suite
 * 
 * Test cases based on Todo_testcases.xlsx
 * 
 * Test Case Mapping:
 * TC 01: Check UI elements on the screen
 * TC 02: Create a new task
 * TC 03: Hover on created task to show clear button
 * TC 04: Delete a created task
 * TC 05: Create multiple tasks
 * TC 06: Click checkbox to mark as completed
 * TC 07: Check filter All
 * TC 08: Check filter Active
 * TC 09: Check filter Completed
 * TC 10: Check Clear Completed button
 */

const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { testData } = require('./utils/testData');

test.describe('TodoMVC - Complete Test Suite', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  // TC 01: Check UI elements on the screen
  test('TC 01 - Check UI elements on the screen', async () => {
    // Verify title "Todos" at the center top
    await expect(todoPage.title).toHaveText(testData.uiElements.title);
    
    // Verify Textbox with placeholder "What needs to be done?"
    await expect(todoPage.newTodoInput).toHaveAttribute('placeholder', testData.uiElements.placeholder);
  });

  // TC 02: Create a new task
  test('TC 02 - Create a new task', async () => {
    // Click Textbox
    await todoPage.newTodoInput.click();
    
    // Enter "Meeting"
    await todoPage.createTodo(testData.singleTodo.text);
    
    // Verify checkbox "Meeting" displays below the Textbox
    await expect(todoPage.todoList).toContainText(testData.singleTodo.text);
    
    // Verify display shows "1 item left"
    const itemCount = await todoPage.getActiveItemCount();
    expect(itemCount).toBe(testData.singleTodo.expectedCount);
  });

  // TC 03: Hover on created task
  test('TC 03 - Hover on created task to show clear button', async () => {
    // Create a todo first
    await todoPage.createTodo(testData.hoverTodo.text);
    
    // Hover on Checkbox "Meeting"
    await todoPage.hoverTodo(testData.hoverTodo.text);
    
    // Verify X button (Clear button) is displayed
    const todoItem = todoPage.todoItems.filter({ hasText: testData.hoverTodo.text });
    await expect(todoItem.locator('button.destroy')).toBeVisible();
  });

  // TC 04: Delete a created task
  test('TC 04 - Delete a created task', async () => {
    // Create a todo first
    await todoPage.createTodo(testData.deleteTodo.text);
    
    // Hover on Checkbox "Meeting"
    await todoPage.hoverTodo(testData.deleteTodo.text);
    
    // Click X button
    await todoPage.deleteTodo(testData.deleteTodo.text);
    
    // Verify checkbox "Meeting" is cleared
    const hasTodo = await todoPage.hasTodo(testData.deleteTodo.text);
    expect(hasTodo).toBe(false);
    
    // Verify screen displays default state (title "Todos" and Textbox)
    await expect(todoPage.title).toHaveText(testData.uiElements.title);
    await expect(todoPage.newTodoInput).toHaveAttribute('placeholder', testData.uiElements.placeholder);
  });

  // TC 05: Create multiple tasks
  test('TC 05 - Create multiple tasks', async () => {
    // Create first todo "Meeting"
    await todoPage.createTodo(testData.multipleTodos.todos[0]);
    
    // Create second todo "Review"
    await todoPage.createTodo(testData.multipleTodos.todos[1]);
    
    // Verify both todos are displayed
    const todoTexts = await todoPage.getTodoTexts();
    expect(todoTexts).toContain(testData.multipleTodos.todos[0]);
    expect(todoTexts).toContain(testData.multipleTodos.todos[1]);
    
    // Verify order: "Meeting" above "Review"
    expect(todoTexts[0]).toBe(testData.multipleTodos.todos[0]);
    expect(todoTexts[1]).toBe(testData.multipleTodos.todos[1]);
    
    // Verify display shows "2 items left"
    const itemCount = await todoPage.getActiveItemCount();
    expect(itemCount).toBe(testData.multipleTodos.expectedCount);
  });

  // TC 06: Click checkbox to mark as completed
  test('TC 06 - Click checkbox to mark as completed', async () => {
    // Create multiple todos first
    await todoPage.createTodo(testData.multipleTodos.todos[0]);
    await todoPage.createTodo(testData.multipleTodos.todos[1]);
    
    // Click Checkbox "Meeting"
    await todoPage.toggleTodo(testData.toggleTodo.text);
    
    // Verify Checkbox "Meeting" is chosen and underlined
    const meetingItem = todoPage.todoItems.filter({ hasText: testData.toggleTodo.text });
    await expect(meetingItem.locator('input[type="checkbox"]')).toBeChecked();
    
    // Verify display shows "1 item left" and "Clear Completed" button
    const itemCount = await todoPage.getActiveItemCount();
    expect(itemCount).toBe(1);
    await expect(todoPage.clearCompletedButton).toBeVisible();
  });

  // TC 07: Check filter All
  test('TC 07 - Check filter All', async () => {
    // Create todos and mark one as completed
    await todoPage.createTodo(testData.multipleTodos.todos[0]);
    await todoPage.createTodo(testData.multipleTodos.todos[1]);
    await todoPage.toggleTodo(testData.toggleTodo.text);
    
    // Click Filter All
    await todoPage.filterTodos('all');
    
    // Verify both todos are visible
    const todoTexts = await todoPage.getTodoTexts();
    expect(todoTexts).toContain(testData.multipleTodos.todos[0]);
    expect(todoTexts).toContain(testData.multipleTodos.todos[1]);
    
    // Verify "Meeting" is completed (checked) and "Review" is active
    const meetingItem = todoPage.todoItems.filter({ hasText: testData.multipleTodos.todos[0] });
    const reviewItem = todoPage.todoItems.filter({ hasText: testData.multipleTodos.todos[1] });
    
    await expect(meetingItem.locator('input[type="checkbox"]')).toBeChecked();
    await expect(reviewItem.locator('input[type="checkbox"]')).not.toBeChecked();
    
    // Verify display shows "1 item left" and "Clear Completed" button
    const itemCount = await todoPage.getActiveItemCount();
    expect(itemCount).toBe(1);
    await expect(todoPage.clearCompletedButton).toBeVisible();
  });

  // TC 08: Check filter Active
  test('TC 08 - Check filter Active', async () => {
    // Create todos and mark one as completed
    await todoPage.createTodo(testData.multipleTodos.todos[0]);
    await todoPage.createTodo(testData.multipleTodos.todos[1]);
    await todoPage.toggleTodo(testData.toggleTodo.text);
    
    // Click Filter Active
    await todoPage.filterTodos('active');
    
    // Verify only active todos are visible (only "Review")
    const todoTexts = await todoPage.getTodoTexts();
    expect(todoTexts).toContain(testData.multipleTodos.todos[1]);
    expect(todoTexts).not.toContain(testData.multipleTodos.todos[0]);
    
    // Verify "Review" is not chosen and not underlined
    const reviewItem = todoPage.todoItems.filter({ hasText: testData.multipleTodos.todos[1] });
    await expect(reviewItem.locator('input[type="checkbox"]')).not.toBeChecked();
    
    // Verify display shows "1 item left" and "Clear Completed" button
    const itemCount = await todoPage.getActiveItemCount();
    expect(itemCount).toBe(1);
    await expect(todoPage.clearCompletedButton).toBeVisible();
  });

  // TC 09: Check filter Completed
  test('TC 09 - Check filter Completed', async () => {
    // Create todos and mark one as completed
    await todoPage.createTodo(testData.multipleTodos.todos[0]);
    await todoPage.createTodo(testData.multipleTodos.todos[1]);
    await todoPage.toggleTodo(testData.toggleTodo.text);
    
    // Click Filter Completed
    await todoPage.filterTodos('completed');
    
    // Verify only completed todos are visible (only "Meeting")
    const todoTexts = await todoPage.getTodoTexts();
    expect(todoTexts).toContain(testData.multipleTodos.todos[0]);
    expect(todoTexts).not.toContain(testData.multipleTodos.todos[1]);
    
    // Verify "Meeting" is chosen and underlined
    const meetingItem = todoPage.todoItems.filter({ hasText: testData.multipleTodos.todos[0] });
    await expect(meetingItem.locator('input[type="checkbox"]')).toBeChecked();
    
    // Verify display shows "1 item left" and "Clear Completed" button
    const itemCount = await todoPage.getActiveItemCount();
    expect(itemCount).toBe(1);
    await expect(todoPage.clearCompletedButton).toBeVisible();
  });

  // TC 10: Check Clear Completed button
  test('TC 10 - Check Clear Completed button', async () => {
    // Create todos and mark one as completed
    await todoPage.createTodo(testData.multipleTodos.todos[0]);
    await todoPage.createTodo(testData.multipleTodos.todos[1]);
    await todoPage.toggleTodo(testData.toggleTodo.text);
    
    // Click button Clear Completed
    await todoPage.clearCompleted();
    
    // Click filter All
    await todoPage.filterTodos('all');
    
    // Verify "Meeting" is deleted
    const todoTexts = await todoPage.getTodoTexts();
    expect(todoTexts).not.toContain(testData.multipleTodos.todos[0]);
    
    // Verify only "Review" is displayed and not chosen
    expect(todoTexts).toContain(testData.multipleTodos.todos[1]);
    const reviewItem = todoPage.todoItems.filter({ hasText: testData.multipleTodos.todos[1] });
    await expect(reviewItem.locator('input[type="checkbox"]')).not.toBeChecked();
    
    // Verify display shows "1 item left"
    const itemCount = await todoPage.getActiveItemCount();
    expect(itemCount).toBe(1);
  });
});