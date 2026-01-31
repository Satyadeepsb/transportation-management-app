import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <div className="text-6xl mb-4">🚚</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? Check out our:</p>
          <div className="mt-2 flex gap-4 justify-center">
            <button
              onClick={() => navigate('/track')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Track Shipment
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/my-shipments')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              My Shipments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
