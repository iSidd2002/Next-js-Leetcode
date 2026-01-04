import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Problem } from '../../types';

// Form interaction helpers
export const fillInput = async (labelText: string | RegExp, value: string) => {
  const input = screen.getByLabelText(labelText);
  await userEvent.clear(input);
  await userEvent.type(input, value);
  return input;
};

export const selectOption = async (labelText: string | RegExp, optionText: string) => {
  const select = screen.getByLabelText(labelText);
  await userEvent.click(select);
  const option = screen.getByText(optionText);
  await userEvent.click(option);
  return select;
};

export const clickButton = async (buttonText: string) => {
  const button = screen.getByRole('button', { name: buttonText });
  await userEvent.click(button);
  return button;
};

export const submitForm = async (formTestId?: string) => {
  const form = formTestId 
    ? screen.getByTestId(formTestId)
    : screen.getByRole('form') || document.querySelector('form');
  
  if (form) {
    fireEvent.submit(form);
  } else {
    // Fallback: look for submit button
    const submitButton = screen.getByRole('button', { name: /submit|save|add/i });
    await userEvent.click(submitButton);
  }
};

// Problem form specific helpers
export const fillProblemForm = async (problem: Partial<Problem>) => {
  if (problem.title) {
    await fillInput(/title/i, problem.title);
  }
  
  if (problem.platform) {
    await selectOption(/platform/i, problem.platform);
  }
  
  if (problem.difficulty) {
    await selectOption(/difficulty/i, problem.difficulty);
  }
  
  if (problem.url) {
    await fillInput(/url/i, problem.url);
  }
  
  if (problem.notes) {
    await fillInput(/notes/i, problem.notes);
  }
  
  if (problem.topics && problem.topics.length > 0) {
    // Handle multi-select topics
    for (const topic of problem.topics) {
      const topicInput = screen.getByLabelText(/topics/i);
      await userEvent.type(topicInput, topic);
      await userEvent.keyboard('{Enter}');
    }
  }
};

// Mock problem factory
export const createMockProblem = (overrides: Partial<Problem> = {}): Problem => ({
  id: 'test-1',
  platform: 'leetcode',
  title: 'Two Sum',
  problemId: '1',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/two-sum/',
  dateSolved: '2024-01-01',
  createdAt: '2024-01-01T00:00:00.000Z',
  notes: 'Test notes',
  isReview: false,
  repetition: 0,
  interval: 1,
  nextReviewDate: null,
  topics: ['Array', 'Hash Table'],
  status: 'active',
  companies: ['Google'],
  source: 'manual',
  ...overrides,
});

// Wait for async operations
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

export const waitForErrorToAppear = async (errorText?: string) => {
  await waitFor(() => {
    const errorElement = errorText 
      ? screen.getByText(errorText)
      : screen.getByRole('alert') || screen.getByText(/error/i);
    expect(errorElement).toBeInTheDocument();
  });
};

// Modal helpers
export const openModal = async (triggerText: string) => {
  const trigger = screen.getByText(triggerText);
  await userEvent.click(trigger);
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
};

export const closeModal = async () => {
  const closeButton = screen.getByRole('button', { name: /close|cancel/i });
  await userEvent.click(closeButton);
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
};

// Table helpers
export const getTableRows = () => {
  const table = screen.getByRole('table');
  return table.querySelectorAll('tbody tr');
};

export const getTableCellByRowAndColumn = (rowIndex: number, columnIndex: number) => {
  const rows = getTableRows();
  const row = rows[rowIndex];
  const cells = row.querySelectorAll('td');
  return cells[columnIndex];
};

// Search and filter helpers
export const searchFor = async (searchTerm: string) => {
  const searchInput = screen.getByRole('searchbox') || screen.getByPlaceholderText(/search/i);
  await userEvent.clear(searchInput);
  await userEvent.type(searchInput, searchTerm);
};

export const applyFilter = async (filterName: string, filterValue: string) => {
  const filterButton = screen.getByText(filterName);
  await userEvent.click(filterButton);
  const filterOption = screen.getByText(filterValue);
  await userEvent.click(filterOption);
};

// Assertion helpers
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectToBeHidden = (element: HTMLElement | null) => {
  if (element) {
    expect(element).not.toBeVisible();
  } else {
    expect(element).not.toBeInTheDocument();
  }
};
