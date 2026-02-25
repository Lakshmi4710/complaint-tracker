import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          error = 'Name cannot exceed 50 characters';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!value.includes('@') || !value.includes('.')) {
          error = 'Please enter a valid email (e.g. user@example.com)';
        } else if (value.indexOf('@') === 0) {
          error = 'Email cannot start with @';
        } else if (value.lastIndexOf('.') < value.indexOf('@')) {
          error = 'Please enter a valid email (e.g. user@example.com)';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/[0-9]/.test(value)) {
          error = 'Password must contain at least one number';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      case 'phoneNumber':
        if (value && !/^\d{10,15}$/.test(value.replace(/[\s\-+]/g, ''))) {
          error = 'Please enter a valid phone number (10-15 digits)';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));

    // Re-validate confirmPassword when password changes
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = value !== formData.confirmPassword
        ? 'Passwords do not match'
        : '';
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }

    setError('');
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (strength <= 3) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' };
    if (strength <= 4) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const validateAll = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateAll()) {
      setError('Please fix the errors below before submitting');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please login with your credentials.',
          email: formData.email
        }
      });
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const FieldError = ({ field }) => {
    if (!fieldErrors[field]) return null;
    return (
      <div className="flex items-center mt-1 text-red-600">
        <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
        <p className="text-xs">{fieldErrors[field]}</p>
      </div>
    );
  };

  const FieldSuccess = ({ field }) => {
    if (fieldErrors[field] || !formData[field]) return null;
    return (
      <div className="flex items-center mt-1 text-green-600">
        <CheckCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
        <p className="text-xs">Looks good!</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserGroupIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Resident Registration
          </h2>
          <p className="text-gray-600">
            Create your account to submit and track complaints
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field pl-10 ${
                      fieldErrors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : formData.name && !fieldErrors.name
                          ? 'border-green-500 focus:ring-green-500'
                          : ''
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                <FieldError field="name" />
                <FieldSuccess field="name" />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field pl-10 ${
                      fieldErrors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : formData.email && !fieldErrors.email
                          ? 'border-green-500 focus:ring-green-500'
                          : ''
                    }`}
                    placeholder="you@example.com"
                    autoComplete="off"
                  />
                </div>
                <FieldError field="email" />
                <FieldSuccess field="email" />
              </div>
            </div>

            {/* Phone and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`input-field pl-10 ${
                      fieldErrors.phoneNumber
                        ? 'border-red-500 focus:ring-red-500'
                        : formData.phoneNumber && !fieldErrors.phoneNumber
                          ? 'border-green-500 focus:ring-green-500'
                          : ''
                    }`}
                    placeholder="1234567890"
                  />
                </div>
                <FieldError field="phoneNumber" />
                <FieldSuccess field="phoneNumber" />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 ${
                    fieldErrors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.password && !fieldErrors.password
                        ? 'border-green-500 focus:ring-green-500'
                        : ''
                  }`}
                  placeholder="Min 6 chars, 1 uppercase, 1 number"
                  autoComplete="new-password"
                />
              </div>
              <FieldError field="password" />

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength?.label === 'Weak' ? 'text-red-600' :
                      passwordStrength?.label === 'Fair' ? 'text-yellow-600' :
                      passwordStrength?.label === 'Good' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength?.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength?.color} ${passwordStrength?.width}`} />
                  </div>
                  <ul className="mt-2 space-y-1">
                    {[
                      { test: formData.password.length >= 6, text: 'At least 6 characters' },
                      { test: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                      { test: /[0-9]/.test(formData.password), text: 'One number' },
                    ].map((rule, i) => (
                      <li key={i} className={`flex items-center text-xs ${rule.test ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className={`h-3.5 w-3.5 mr-1 ${rule.test ? 'text-green-500' : 'text-gray-300'}`} />
                        {rule.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 ${
                    fieldErrors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.confirmPassword && !fieldErrors.confirmPassword
                        ? 'border-green-500 focus:ring-green-500'
                        : ''
                  }`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
              <FieldError field="confirmPassword" />
              <FieldSuccess field="confirmPassword" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              {loading ? <Spinner size="small" /> : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
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

export default Register;