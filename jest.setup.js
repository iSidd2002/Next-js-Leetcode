require('dotenv').config({ path: '.env.test' });
require('@testing-library/jest-dom');

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return children;
  };
});

// Mock remark-gfm
jest.mock('remark-gfm', () => {
  return function remarkGfm() {
    return {};
  };
});

// Mock react-syntax-highlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: function MockPrism({ children }) {
    return children;
  },
  Light: function MockLight({ children }) {
    return children;
  },
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
  oneLight: {},
}));

// Mock CSS imports
jest.mock('./src/components/ui/MarkdownEditor.css', () => ({}), { virtual: true });

// Global mock for API service (no { virtual: true } so it replaces the real module)
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => false),
    getProblems: jest.fn(() => Promise.resolve([])),
    createProblem: jest.fn(() => Promise.resolve({})),
    updateProblem: jest.fn(() => Promise.resolve({})),
    deleteProblem: jest.fn(() => Promise.resolve()),
    deleteAllProblems: jest.fn(() => Promise.resolve(0)),
    getContests: jest.fn(() => Promise.resolve([])),
    createContest: jest.fn(() => Promise.resolve({})),
    updateContest: jest.fn(() => Promise.resolve({})),
    deleteContest: jest.fn(() => Promise.resolve()),
    getTodos: jest.fn(() => Promise.resolve([])),
    createTodo: jest.fn(() => Promise.resolve({})),
    updateTodo: jest.fn(() => Promise.resolve({})),
    deleteTodo: jest.fn(() => Promise.resolve()),
    getPatternPaths: jest.fn(() => Promise.resolve([])),
    createPatternPath: jest.fn(() => Promise.resolve({})),
    updatePatternPath: jest.fn(() => Promise.resolve({})),
    deletePatternPath: jest.fn(() => Promise.resolve()),
    clearAuthState: jest.fn(),
    checkAuthStatus: jest.fn(() => Promise.resolve(false)),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver for components using layout measurements
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;
