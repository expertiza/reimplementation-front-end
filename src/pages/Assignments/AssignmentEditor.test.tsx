import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AssignmentEditor from './AssignmentEditor';
import authReducer from '../../store/slices/authSlice';
import alertReducer from '../../store/slices/alertSlice';

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

jest.mock('components/Form/FormSelect', () => ({
    __esModule: true,
    default: ({ name, options }: any) => (
        <select data-testid={`select-${name}`}>
            {options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    ),
}));

jest.mock('components/Form/FormCheckBox', () => ({
    __esModule: true,
    default: ({ name, label }: any) => (
        <input type="checkbox" data-testid={`checkbox-${name}`} aria-label={label} />
    ),
}));

jest.mock('components/Table/Table', () => ({
    __esModule: true,
    default: ({ data }: any) => <div data-testid="table">{data?.length}</div>,
}));

const createMockStore = () => {
    return configureStore({
        reducer: {
            authentication: authReducer,
            alert: alertReducer,
        },
        preloadedState: {
            authentication: { isAuthenticated: true, user: null },
            alert: { show: false, variant: '', message: '' },
        },
    });
};

const renderComponent = (mode: 'create' | 'update' = 'create') => {
    const store = createMockStore();
    return render(
        <Provider store={store}>
            <BrowserRouter>
                <AssignmentEditor mode={mode} />
            </BrowserRouter>
        </Provider>
    );
};

describe('AssignmentEditor', () => {
    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText(/Editing Assignment:/i)).toBeInTheDocument();
    });

    it('renders all tabs', () => {
        renderComponent();
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('Topics')).toBeInTheDocument();
        expect(screen.getByText('Rubrics')).toBeInTheDocument();
        expect(screen.getByText('Review strategy')).toBeInTheDocument();
        expect(screen.getByText('Due dates')).toBeInTheDocument();
        expect(screen.getByText('Etc')).toBeInTheDocument();
    });

    it('renders form inputs in General tab', () => {
        renderComponent();
        expect(screen.getByTestId('input-name')).toBeInTheDocument();
        expect(screen.getByTestId('input-directory_path')).toBeInTheDocument();
        expect(screen.getByTestId('input-spec_location')).toBeInTheDocument();
    });

    it('renders checkboxes in General tab', () => {
        renderComponent();
        expect(screen.getByTestId('checkbox-private')).toBeInTheDocument();
        expect(screen.getByTestId('checkbox-has_teams')).toBeInTheDocument();
    });

    it('shows team-related checkboxes when has_teams is checked', async () => {
        renderComponent();
        const hasTeamsCheckbox = screen.getByTestId('checkbox-has_teams');
        await userEvent.click(hasTeamsCheckbox);
        await waitFor(() => {
            expect(screen.getByTestId('checkbox-show_teammate_review')).toBeInTheDocument();
        });
    });
    