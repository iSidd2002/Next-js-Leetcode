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

// Global mock for API service
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => false),
    getProblems: jest.fn(() => Promise.resolve([])),
    createProblem: jest.fn(),
    updateProblem: jest.fn(),
    deleteProblem: jest.fn(),
    getContests: jest.fn(() => Promise.resolve([])),
    createContest: jest.fn(),
    updateContest: jest.fn(),
    deleteContest: jest.fn(),
    clearAuthState: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getToken: jest.fn(),
    setToken: jest.fn(),
  }
}), { virtual: true });

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
