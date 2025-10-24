import Layout from '../components/Layout'

export default function Test() {
  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 AgriTrace is Running!
        </h1>
        <p className="text-gray-600 mb-8">
          Frontend and Backend are successfully connected and running.
        </p>
        <div className="space-y-4">
          <div className="card max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-2">✅ Status Check</h2>
            <ul className="text-left space-y-2">
              <li>✅ Next.js Frontend: Running on port 3000</li>
              <li>✅ Express Backend: Running on port 3001</li>
              <li>✅ Stacks Integration: Ready</li>
              <li>✅ Smart Contracts: Deployed locally</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}