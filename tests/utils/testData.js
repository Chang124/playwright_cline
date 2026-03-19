/**
 * Test data for TodoMVC test cases
 * Maps to test cases from Todo_testcases.xlsx
 */

const testData = {
  // Test Case TC 01: Check UI elements
  uiElements: {
    title: 'todos',
    placeholder: 'What needs to be done?'
  },

  // Test Case TC 02: Create a new task
  singleTodo: {
    text: 'Meeting',
    expectedCount: 1
  },

  // Test Case TC 05: Create multiple tasks
  multipleTodos: {
    todos: ['Meeting', 'Review'],
    expectedCount: 2
  },

  // Test Case TC 03: Hover on created task
  hoverTodo: {
    text: 'Meeting'
  },

  // Test Case TC 04: Delete a created task
  deleteTodo: {
    text: 'Meeting'
  },

  // Test Case TC 06: Click checkbox
  toggleTodo: {
    text: 'Meeting'
  },

  // Test Case TC 07-09: Filter tests
  filters: {
    all: 'All',
    active: 'Active', 
    completed: 'Completed'
  }
};

module.exports = { testData };