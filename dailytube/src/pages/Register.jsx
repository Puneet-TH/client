import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="flex justify-center items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.8 8s-.195-1.377-.795-1.984c-.76-.797-1.613-.8-2.004-.847-2.799-.203-6.996-.203-6.996-.203h-.01s-4.197 0-6.996.203c-.39.046-1.243.05-2.003.847C2.395 6.623 2.2 8 2.2 8S2 9.62 2 11.24v1.517c0 1.618.2 3.237.2 3.237s.195 1.378.795 1.985c.76.797 1.76.77 2.205.855 1.6.153 6.8.2 6.8.2s4.203-.006 7.001-.209c.391-.047 1.244-.05 2.004-.847.6-.607.795-1.985.795-1.985s.2-1.618.2-3.237v-1.517C22 9.62 21.8 8 21.8 8zM9.935 14.595V9.405l5.403 2.598-5.403 2.592z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">DailyTube</span>
          </Link>
          <h2 className="text-3xl font-bold text-white">Create your account</h2>
          <p className="text-zinc-400 mt-2">Join the community and start sharing</p>
        </div>

        <RegisterForm />

        <div className="text-center mt-6">
          <p className="text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-4">Or explore as a guest</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Browse Videos
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs text-zinc-500 text-center">
            <p>By creating an account, you agree to our</p>
            <div className="flex justify-center gap-4 mt-1">
              <Link to="/terms" className="text-red-400 hover:text-red-300">Terms of Service</Link>
              <Link to="/privacy" className="text-red-400 hover:text-red-300">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
