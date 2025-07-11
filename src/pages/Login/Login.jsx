import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import HRImage from '../../assets/hr-illustration.png'; // ضعي صورة HR هنا

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
    <div className={styles.loginBg}>
      <div className={styles.loginContainer}>
        <div className={styles.formSection}>
          <h2 className={styles.title}>Login</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              className={styles.input}
              placeholder="username@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            
            <button type="submit" className={styles.signInBtn} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign in'}
            </button>
            {error && <div className={styles.error}>{error}</div>}
          </form>
        </div>
        <div className={styles.imageSection}>
          <img src={HRImage} alt="HR Illustration" className={styles.hrImg} />
        </div>
      </div>
    </div>
  );
};

export default Login;
