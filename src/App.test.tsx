import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store/store';

test('renders login route', () => {
  window.history.pushState({}, 'Test page', '/login');
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /forgot password\?/i })).toBeInTheDocument();
});
