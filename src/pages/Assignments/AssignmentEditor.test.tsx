import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AssignmentEditor from './AssignmentEditor';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLoaderData: () => ({ name: 'Test Assignment', id: 1 }),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ state: { from: '/assignments' } }),
}));

jest.mock('hooks/useAPI', () => ({
    __esModule: true,
    default: () => ({
        data: null,
        error: null,
        sendRequest: jest.fn(),
    }),
}));

jest.mock('components/Form/FormInput', () => ({
    __esModule: true,
    default: ({ name, label }: any) => <input data-testid={`input-${name}`} placeholder={label} />,
}));

