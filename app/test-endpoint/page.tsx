"use client";

import { useState } from "react";

export default function TestEndpoints() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string, method: string = "GET") => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Endpoint Tester</h1>

        {/* Endpoint Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
          <div className="space-y-3">
            {/* Add your endpoints here */}
            <button
              onClick={() => testEndpoint("/api/example")}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left"
            >
              <span className="text-xs bg-green-600 px-2 py-1 rounded mr-2">
                GET
              </span>
              /api/example
            </button>

            <button
              onClick={() => testEndpoint("/api/users")}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left"
            >
              <span className="text-xs bg-green-600 px-2 py-1 rounded mr-2">
                GET
              </span>
              /api/users
            </button>

            <button
              onClick={() => testEndpoint("/api/data")}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left"
            >
              <span className="text-xs bg-green-600 px-2 py-1 rounded mr-2">
                GET
              </span>
              /api/data
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700">Loading...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Response</h3>

            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600">
                Status:{" "}
              </span>
              <span
                className={`font-semibold ${response.status < 400 ? "text-green-600" : "text-red-600"}`}
              >
                {response.status} {response.statusText}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Data:</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
