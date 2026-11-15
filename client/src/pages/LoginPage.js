import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to log in. Please verify your credentials or server connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ padding: '60px 0', minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div
          className="card"
          style={{
            maxWidth: '460px',
            margin: '0 auto',
            padding: '40px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-warm)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '2.5rem', display: 'inline-block', marginBottom: '8px' }}>🎓</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1B2533' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.9rem', color: '#4D5C6D', marginTop: '4px' }}>
              Sign in to your InternMatch AI student dashboard
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
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              </div>
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
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px', height: '48px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <FiArrowRight />}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600 }}>
              Quick Demo Login:
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('student@example.com', 'password123')}
                style={{
                  backgroundColor: '#E6F7F2',
                  border: '1px solid #A7F3D0',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#008C6B',
                  cursor: 'pointer'
                }}
              >
                🎓 Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@internshipfinder.com', 'password123')}
                style={{
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1B2533',
                  cursor: 'pointer'
                }}
              >
                🛡️ Project Guide (Admin)
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
