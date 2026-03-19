/**
 * Page Object Model for TodoMVC application
 * Maps to test cases from Todo_testcases.xlsx
 */

class TodoPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Page elements
    this.title = page.locator('h1');
    this.newTodoInput = page.locator('[data-todo="new"]');
    this.todoList = page.locator('[data-todo="list"]');
    this.todoItems = page.locator('.todo-list li');
    this.todoLabels = page.locator('.todo-list li label');
    this.todoCheckboxes = page.locator('.todo-list li input[type="checkbox"]');
    this.todoClearButtons = page.locator('.todo-list li button.destroy');
    this.itemCount = page.locator('[data-todo="count"] strong');
    this.filters = page.locator('[data-todo="filters"]');
    this.filterAll = page.locator('[data-todo="filters"] a[href="#/"]');
    this.filterActive = page.locator('[data-todo="filters"] a[href="#/active"]');
    this.filterCompleted = page.locator('[data-todo="filters"] a[href="#/completed"]');
    this.clearCompletedButton = page.locator('[data-todo="clear-completed"]');
    this.toggleAllCheckbox = page.locator('[data-todo="toggle-all"]');
  }

  /**
   * Navigate to the TodoMVC application
   * @returns {Promise<void>}
   */
  async goto() {
    await this.page.goto('http://localhost:1337/index.html');
  }

  /**
   * Create a new todo item
   * @param {string} text - The todo text
   * @returns {Promise<void>}
   */
  async createTodo(text) {
    await this.newTodoInput.click();
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  /**
   * Get the text of all todo items
   * @returns {Promise<string[]>}
   */
  async getTodoTexts() {
    return await this.todoLabels.allTextContents();
  }

  /**
   * Get the count of active items
   * @returns {Promise<number>}
   */
  async getActiveItemCount() {
    const countText = await this.itemCount.textContent();
    return parseInt(countText || '0', 10);
  }

  /**
   * Check if a todo item exists
   * @param {string} text - The todo text to find
   * @returns {Promise<boolean>}
   */
  async hasTodo(text) {
    const todos = await this.getTodoTexts();
    return todos.includes(text);
  }

  /**
   * Click on a todo item's checkbox
   * @param {string} text - The todo text
   * @returns {Promise<void>}
   */
  async toggleTodo(text) {
    const todoItem = this.todoItems.filter({ hasText: text });
    await todoItem.locator('input[type="checkbox"]').check();
  }

  /**
   * Hover over a todo item to show the clear button
   * @param {string} text - The todo text
   * @returns {Promise<void>}
   */
  async hoverTodo(text) {
    const todoItem = this.todoItems.filter({ hasText: text });
    await todoItem.hover();
  }

  /**
   * Delete a todo item by clicking the clear button
   * @param {string} text - The todo text
   * @returns {Promise<void>}
   */
  async deleteTodo(text) {
    const todoItem = this.todoItems.filter({ hasText: text });
    await todoItem.hover();
    await todoItem.locator('button.destroy').click();
  }

  /**
   * Filter todos by clicking filter links
   * @param {'all' | 'active' | 'completed'} filterType
   * @returns {Promise<void>}
   */
  async filterTodos(filterType) {
    switch (filterType) {
      case 'all':
        await this.filterAll.click();
        break;
      case 'active':
        await this.filterActive.click();
        break;
      case 'completed':
        await this.filterCompleted.click();
        break;
    }
  }

  /**
   * Clear all completed todos
   * @returns {Promise<void>}
   */
  async clearCompleted() {
    await this.clearCompletedButton.click();
  }

  /**
   * Check if the clear completed button is visible
   * @returns {Promise<boolean>}
   */
  async isClearCompletedVisible() {
    return await this.clearCompletedButton.isVisible();
  }

  /**
   * Get the current filter state
   * @returns {Promise<'all' | 'active' | 'completed'>}
   */
  async getCurrentFilter() {
    const allSelected = await this.filterAll.getAttribute('class');
    const activeSelected = await this.filterActive.getAttribute('class');
    const completedSelected = await this.filterCompleted.getAttribute('class');
    
    if (allSelected && allSelected.includes('selected')) return 'all';
    if (activeSelected && activeSelected.includes('selected')) return 'active';
    if (completedSelected && completedSelected.includes('selected')) return 'completed';
    
    return 'all'; // Default fallback
  }
}

module.exports = { TodoPage };