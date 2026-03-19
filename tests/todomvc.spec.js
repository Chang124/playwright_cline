// @ts-check
import { test, expect } from '@playwright/test';

test.describe('TodoMVC - Add new todo item', () => {
  test('Add a new todo item', async ({ page }) => {
    // Step 1: Open http://172.25.96.1:8080/index.html
    await page.goto('http://172.25.96.1:8080/index.html');

    // Step 2: Click the input field "What needs to be done?"
    const newTodoInput = page.locator('[data-todo="new"]');
    await newTodoInput.click();

    // Step 3: Type "Buy groceries"
    await newTodoInput.fill('Buy groceries');

    // Step 4: Press Enter
    await newTodoInput.press('Enter');

    // Step 5: Verify the todo list contains "Buy groceries"
    const todoItem = page.locator('.todo-list li label');
    await expect(todoItem).toHaveText('Buy groceries');

    // Verify the counter shows 1 item left
    const itemCount = page.locator('[data-todo="count"] strong');
    await expect(itemCount).toHaveText('1');
  });
});