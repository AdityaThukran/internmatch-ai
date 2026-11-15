import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to register. Please check your network or try another email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px 0', minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div
          className="card"
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            padding: '40px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-warm)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '2.5rem', display: 'inline-block', marginBottom: '8px' }}>🎓</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>Create Account</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Join the AI Internship Finder to unlock smart recommendations
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #EF4444',
                color: '#991B1B',
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px'
              }}
            >
              <FiAlertCircle style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '14px',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                    fontSize: '1.1rem'
                  }}
                />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '14px',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                    fontSize: '1.1rem'
                  }}
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your.name@lingayas.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <FiLock
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '14px',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-light)',
                      fontSize: '1.1rem'
                    }}
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Min 6 chars"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <FiLock
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '14px',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-light)',
                      fontSize: '1.1rem'
                    }}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Register As</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
              >
                <option value="student">Student (Internship Seeker)</option>
                <option value="recruiter">Recruiter / Employer</option>
                <option value="admin">Administrator (Guide / Faculty)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px', height: '48px' }}
            >
              {loading ? 'Setting up Profile...' : 'Create Account'}
              {!loading && <FiArrowRight />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
