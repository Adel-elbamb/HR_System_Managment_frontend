import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`d-flex align-items-center justify-content-center min-vh-100 bg-light`}>
      <div className={`${styles.card} shadow-sm p-4`}>
        <div className="text-center mb-4">
          <div className={styles.iconCircle}>
            <i className="bi bi-box-arrow-in-right fs-3 text-primary"></i>
          </div>
          <h2 className="fw-bold mt-3">Sign In</h2>
          <div className="text-muted">Access your HR dashboard</div>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white ${styles.noRightBorder}">
                <i className="bi bi-envelope fs-5 text-secondary"></i>
              </span>
              <input
                type="email"
                name="email"
                className="form-control ${styles.noLefttBorder}"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white ${styles.noRightBorder">
                <i className="bi bi-lock fs-5 text-secondary"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control ${styles.noLefttBorder}"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className={`${styles.signInBtn} btn w-100 fw-semibold`} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
