import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardDocumentCheckIcon,
  BellAlertIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: ClipboardDocumentCheckIcon,
      title: 'Easy Complaint Filing',
      description: 'Submit and track your complaints with just a few clicks.',
    },
    {
      icon: BellAlertIcon,
      title: 'Real-time Updates',
      description: 'Get instant notifications when your complaint status changes.',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'View comprehensive statistics and insights about all complaints.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry-standard security.',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-6">
              Complaint & Issue Tracker
            </h1>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Streamline your complaint management process with our powerful,
              real-time tracking system designed for residents and administrators.
            </p>
            <div className="flex justify-center space-x-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn-secondary bg-primary-700 text-white hover:bg-primary-600">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A comprehensive solution for managing complaints efficiently and transparently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card text-center hover:shadow-md transition-shadow">
                <Icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {!user && (
        <div className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join hundreds of users managing their complaints efficiently.
            </p>
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Create Free Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;