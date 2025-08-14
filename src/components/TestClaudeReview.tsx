import { useState } from "react";
import { testClaudeReview } from "@/test-claude-review";

export default function TestClaudeReview() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await testClaudeReview();
      setResult(response);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🤖 Test Claude Code Review</h1>
        
        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Claude analizează...' : 'Testează Claude Review'}
        </button>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Rezultat:</h2>
            
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Eroare:</p>
                <pre className="text-red-600 mt-2 whitespace-pre-wrap text-sm">
                  {result.error}
                </pre>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✅ Succes!</p>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Review generat cu succes:</p>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Ce testează:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Apelul către edge function-ul Claude</li>
            <li>Analiza unui PR mock cu schimbări reale</li>
            <li>Generarea de feedback constructiv</li>
            <li>Integrarea cu API-ul Anthropic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}