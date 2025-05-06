const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 text-center px-4">
      <h1 className="text-5xl font-bold text-blue-600 mb-2">404</h1>
      <p className="text-lg text-gray-700 mb-4">
        Sorry, this page doesn't exist.
      </p>
      <a
        href="/"
        className="mt-1 px-6 py-3 text-base font-medium bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-300"
      >
        Go back to Home
      </a>
    </div>

  );
};

export default NotFound;
