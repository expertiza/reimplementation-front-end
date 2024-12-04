import React from 'react';
import { render } from '@testing-library/react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { store, persistor } from './store/store';

// Mock the required modules
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

jest.mock('./reportWebVitals', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Index', () => {
  const mockRoot = document.createElement('div');
  mockRoot.id = 'root';

  beforeEach(() => {
    document.body.appendChild(mockRoot);
  });

  afterEach(() => {
    document.body.removeChild(mockRoot);
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    // Import the index file
    require('./index');

    // Check if createRoot was called with the root element
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(mockRoot);
    
    // Verify that render was called with the correct component structure
    expect(ReactDOM.createRoot(mockRoot).render).toHaveBeenCalledWith(
      <React.StrictMode>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </React.StrictMode>
    );
  });
}); 