import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocsPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">API Documentation</h1>

        <Card className="mb-8">
          <CardHeader><CardTitle>Authentication</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4">Include your API key in the Authorization header:</p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`curl https://yourapp.com/api/v1/analyze \\
  -H "Authorization: Bearer ca_live_sk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Your content here..."}'`}
            </pre>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader><CardTitle>POST /api/v1/analyze</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4">Analyze a piece of content.</p>
            <h4 className="font-semibold mb-2">Request Body</h4>
            <pre className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
{`{
  "content": "Your article content (100-50000 chars)",
  "title": "Optional title",
  "options": {
    "include_keywords": true,
    "include_readability": true,
    "include_seo": true
  }
}`}
            </pre>
            <h4 className="font-semibold mb-2">Response</h4>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`{
  "success": true,
  "data": {
    "word_count": 1250,
    "readability": { "score": 72.5, "grade_level": 8 },
    "seo": { "score": 85, "keyword_density": {...} },
    "suggestions": [...]
  }
}`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rate Limits</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-2">Plan</th><th className="text-left py-2">Per Minute</th><th className="text-left py-2">Per Day</th></tr></thead>
              <tbody>
                <tr className="border-b"><td className="py-2">Starter</td><td>10</td><td>100</td></tr>
                <tr className="border-b"><td className="py-2">Growth</td><td>60</td><td>1,000</td></tr>
                <tr><td className="py-2">Enterprise</td><td>300</td><td>10,000</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
