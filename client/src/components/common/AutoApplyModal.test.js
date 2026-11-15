import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import AutoApplyModal from './AutoApplyModal';
import * as api from '../../services/api';

jest.mock('../../services/api', () => ({
  createApplication: jest.fn().mockResolvedValue({ success: true, data: { id: 'app_123' } })
}));

describe('AutoApplyModal Refresh & Submission Stability Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockInternship = {
    _id: 'internship_adobe_123',
    title: 'Generative AI Engineering Intern',
    organization: 'Adobe',
    location: 'Bangalore, India',
    skills: ['Python', 'PyTorch', 'NLP', 'Machine Learning'],
    source: 'LinkedIn',
    url: 'https://adobe.com/careers'
  };

  const mockProfile = {
    userId: { name: 'Aditya Thukral', email: 'aditya@example.com' },
    phone: '+91 9811223344',
    degree: 'B.Tech Electrical & Computer Engineering',
    institution: 'Delhi Technological University',
    skills: ['Python', 'NLP', 'PyTorch', 'React', 'FastAPI']
  };

  test('AutoApplyModal transitions to filled and DOES NOT automatically submit or refresh after 3, 5, or 10 seconds', async () => {
    const handleSuccess = jest.fn();
    const handleClose = jest.fn();

    const { rerender } = render(
      <AutoApplyModal
        isOpen={true}
        onClose={handleClose}
        internship={mockInternship}
        profile={mockProfile}
        onSuccess={handleSuccess}
      />
    );

    // Initial state: processing scan animation
    expect(screen.getByText(/Analyzing Job Description & Generating Real-Time Dossier/i)).toBeInTheDocument();

    // Fast-forward 1.2s to complete scanning animation
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    // Now it should be in filled stage with candidate details
    expect(screen.getByText(/AI Autofill Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm & Submit Application/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Aditya Thukral')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B.Tech Electrical & Computer Engineering')).toBeInTheDocument();

    // Verify NO auto-submission occurred
    expect(api.createApplication).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();

    // Advance by 3 seconds (where the previous infinite loop occurred!)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Verify it is STILL on the filled stage, NOT submitted, and NOT refreshed
    expect(screen.getByText(/Confirm & Submit Application/i)).toBeInTheDocument();
    expect(api.createApplication).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();

    // Advance by another 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/Confirm & Submit Application/i)).toBeInTheDocument();
    expect(api.createApplication).not.toHaveBeenCalled();

    // Simulate parent re-rendering with a new profile object reference
    rerender(
      <AutoApplyModal
        isOpen={true}
        onClose={handleClose}
        internship={mockInternship}
        profile={{ ...mockProfile, skills: [...mockProfile.skills] }}
        onSuccess={handleSuccess}
      />
    );

    // Verify modal DID NOT reset to processing!
    expect(screen.getByText(/Confirm & Submit Application/i)).toBeInTheDocument();
    expect(screen.queryByText(/Analyzing Job Description & Generating Real-Time Dossier/i)).not.toBeInTheDocument();
  });

  test('User can review credentials and manually click Confirm & Submit Application', async () => {
    const handleSuccess = jest.fn();
    const handleClose = jest.fn();

    render(
      <AutoApplyModal
        isOpen={true}
        onClose={handleClose}
        internship={mockInternship}
        profile={mockProfile}
        onSuccess={handleSuccess}
      />
    );

    // Advance timers past loading stage
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    const submitBtn = screen.getByText(/Confirm & Submit Application/i);
    expect(submitBtn).toBeInTheDocument();

    // User clicks submit button
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Verify API called with verified internship details
    expect(api.createApplication).toHaveBeenCalledTimes(1);
    expect(handleSuccess).toHaveBeenCalledTimes(1);

    // Verify receipt screen is displayed
    expect(screen.getByText(/Application Transmitted in Real-Time!/i)).toBeInTheDocument();
    expect(screen.getByText(/Official Application Reference:/i)).toBeInTheDocument();
    expect(screen.getByText(/View in Applications Tracker/i)).toBeInTheDocument();
  });
});
