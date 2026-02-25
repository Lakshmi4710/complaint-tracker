import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const registrationMessage = location.state?.message || '';
  const registrationEmail = location.state?.email || '';

  const [residentData, setResidentData] = useState({
    email: registrationEmail,
    password: '',
  });

  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
  });

  const [residentLoading, setResidentLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [residentError, setResidentError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [residentFieldErrors, setResidentFieldErrors] = useState({});
  const [adminFieldErrors, setAdminFieldErrors] = useState({});

  const validateLoginField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) 
        error = 'Please enter a valid email address';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) 
        error = 'Password must be at least 6 characters';
    }
    return error;
  };

  const handleResidentChange = (e) => {
    const { name, value } = e.target;
    setResidentData({ ...residentData, [name]: value });
    const fieldError = validateLoginField(name, value);
    setResidentFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    setResidentError('');
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
    const fieldError = validateLoginField(name, value);
    setAdminFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    setAdminError('');
  };

  // ✅ Parse backend error and show under correct field
  const parseLoginError = (message) => {
    const msg = message?.toLowerCase() || '';
    if (msg.includes('email') || msg.includes('user') || 
        msg.includes('found') || msg.includes('exist')) {
      return { 
        field: 'email', 
        error: '❌ No account found with this email address' 
      };
    }
    if (msg.includes('password') || msg.includes('incorrect') || 
        msg.includes('invalid') || msg.includes('wrong') ||
        msg.includes('credentials')) {
      return { 
        field: 'password', 
        error: '❌ Incorrect password. Please try again.' 
      };
    }
    return { field: 'general', error: message };
  };

  const handleResidentSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateLoginField('email', residentData.email);
    const passwordError = validateLoginField('password', residentData.password);
    
    if (emailError || passwordError) {
      setResidentFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    setResidentLoading(true);
    setResidentError('');
    setResidentFieldErrors({});

    const result = await login(residentData.email, residentData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      // ✅ Show error under correct field
      const { field, error } = parseLoginError(result.message);
      if (field === 'email') {
        setResidentFieldErrors({ email: error });
      } else if (field === 'password') {
        setResidentFieldErrors({ password: error });
      } else {
        setResidentError(error);
      }
    }
    
    setResidentLoading(false);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateLoginField('email', adminData.email);
    const passwordError = validateLoginField('password', adminData.password);

    if (emailError || passwordError) {
      setAdminFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    setAdminLoading(true);
    setAdminError('');
    setAdminFieldErrors({});

    const result = await login(adminData.email, adminData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      // ✅ Show error under correct field
      const { field, error } = parseLoginError(result.message);
      if (field === 'email') {
        setAdminFieldErrors({ email: error });
      } else if (field === 'password') {
        setAdminFieldErrors({ password: error });
      } else {
        setAdminError(error);
      }
    }

    setAdminLoading(false);
  };

  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-1.5 text-red-600">
        <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
        <p className="text-xs font-medium">{error}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Complaint & Issue Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Select your login type below
          </p>
        </div>

        {/* ✅ Success message after registration */}
        {registrationMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-center font-medium">
            ✅ {registrationMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ===== RESIDENT LOGIN ===== */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <UserGroupIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Resident Login
              </h2>
              <p className="text-sm text-gray-600">
                Access your complaint dashboard
              </p>
            </div>

            {residentError && (
              <Alert 
                type="error" 
                message={residentError} 
                onClose={() => setResidentError('')} 
              />
            )}

            {/* ✅ autoComplete="on" allows browser autofill */}
            <form 
              className="space-y-5" 
              onSubmit={handleResidentSubmit}
              autoComplete="on"
            >
              <div>
                <label 
                  htmlFor="resident-email" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  User Name / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="resident-email"
                    name="email"
                    type="email"
                    required
                    value={residentData.email}
                    onChange={handleResidentChange}
                    className={`input-field pl-10 ${
                      residentFieldErrors.email 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : ''
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                <FieldError error={residentFieldErrors.email} />
              </div>

              <div>
                <label 
                  htmlFor="resident-password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="resident-password"
                    name="password"
                    type="password"
                    required
                    value={residentData.password}
                    onChange={handleResidentChange}
                    className={`input-field pl-10 ${
                      residentFieldErrors.password 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : ''
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
                <FieldError error={residentFieldErrors.password} />
              </div>

              <button
                type="submit"
                disabled={residentLoading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {residentLoading ? <Spinner size="small" /> : 'LOGIN'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-gray-600">
              <p className="font-semibold mb-1">Demo Resident:</p>
              <p>Email: resident@example.com</p>
              <p>Password: password123</p>
            </div>
          </div>

          {/* ===== ADMIN LOGIN ===== */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-12 w-12 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-purple-900 mb-2">
                Admin Login
              </h2>
              <p className="text-sm text-gray-600">
                Manage all complaints and users
              </p>
            </div>

            {adminError && (
              <Alert 
                type="error" 
                message={adminError} 
                onClose={() => setAdminError('')} 
              />
            )}

            {/* ✅ autoComplete="on" allows browser autofill */}
            <form 
              className="space-y-5" 
              onSubmit={handleAdminSubmit}
              autoComplete="on"
            >
              <div>
                <label 
                  htmlFor="admin-email" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  User Name / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    required
                    value={adminData.email}
                    onChange={handleAdminChange}
                    className={`input-field pl-10 ${
                      adminFieldErrors.email 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : ''
                    }`}
                    placeholder="Enter admin email"
                    autoComplete="email"
                  />
                </div>
                <FieldError error={adminFieldErrors.email} />
              </div>

              <div>
                <label 
                  htmlFor="admin-password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type="password"
                    required
                    value={adminData.password}
                    onChange={handleAdminChange}
                    className={`input-field pl-10 ${
                      adminFieldErrors.password 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : ''
                    }`}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                  />
                </div>
                <FieldError error={adminFieldErrors.password} />
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {adminLoading ? <Spinner size="small" /> : 'LOGIN'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Admin access only • Unauthorized access prohibited
              </p>
            </div>

            <div className="mt-4 bg-purple-50 rounded-lg p-3 text-xs text-gray-600">
              <p className="font-semibold mb-1">Demo Admin:</p>
              <p>Email: admin@example.com</p>
              <p>Password: admin123</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;