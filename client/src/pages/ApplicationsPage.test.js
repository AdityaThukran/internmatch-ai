import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ApplicationsPage from './ApplicationsPage';
import * as api from '../services/api';

jest.mock('../services/api');

const mockApplications = [
  {
    _id: 'app-1',
    status: 'applied',
    notes: '⚡ Auto-Applied via AI Zero-Friction Engine (99% ATS Match). Tailored SOP generated for MediNex Workforce. Matched Skills: Python, Machine Learning.',
    updated_at: new Date().toISOString(),
    internshipId: {
      _id: 'job-1',
      title: 'Python Developer Intern',
      organization: 'MediNex Workforce',
      location: 'India',
      mode: 'remote',
      stipend: '₹35,000 / month',
      duration: '6 Months',
      skills: ['Python', 'Machine Learning'],
      source: 'LinkedIn',
      url: 'https://in.linkedin.com/jobs/view/sample'
    }
  },
  {
    _id: 'app-2',
    status: 'interviewing',
    notes: '⚡ Technical Round 1 scheduled with Engineering Lead.',
    updated_at: new Date().toISOString(),
    internshipId: {
      _id: 'job-2',
      title: 'AI Engineering Apprentice',
      organization: 'CredHive',
      location: 'Bengaluru, India',
      mode: 'hybrid',
      stipend: '₹40,000 / month',
      duration: '6 Months',
      skills: ['Python', 'PyTorch'],
      source: 'Internshala',
      url: 'https://internshala.com/internship/detail/sample'
    }
  }
];

describe('ApplicationsPage Visual Redesign Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getApplications.mockResolvedValue({ data: { data: mockApplications } });
  });

  test('renders hero header banner and KPI summary metrics matching recommendations page style', async () => {
    render(
      <BrowserRouter>
        <ApplicationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Live Application Tracker/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Real-Time Autonomous Application & Interview Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText('Total Tracked Roles')).toBeInTheDocument();
    expect(screen.getByText('Offers Extended')).toBeInTheDocument();
  });

  test('renders rich horizontal cards with match score circle, company logo, and interactive milestone stepper', async () => {
    render(
      <BrowserRouter>
        <ApplicationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Python Developer Intern')).toBeInTheDocument();
      expect(screen.getByText('AI Engineering Apprentice')).toBeInTheDocument();
    });

    // Check company and stage pills
    expect(screen.getByText(/MediNex Workforce/i)).toBeInTheDocument();
    expect(screen.getByText(/CredHive/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Round Scheduled:/i)).toBeInTheDocument();

    // Check milestone stepper labels
    const savedSteps = screen.getAllByText('Saved');
    expect(savedSteps.length).toBeGreaterThan(0);
    const appliedSteps = screen.getAllByText('Applied');
    expect(appliedSteps.length).toBeGreaterThan(0);
  });
});
