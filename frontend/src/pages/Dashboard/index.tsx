import Layout from '../../components/common/Layout'

export default function Dashboard() {
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold text-secondary-800 mb-4">Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-secondary-600">Bienvenido al dashboard de ASE Athletics</p>
        </div>
      </div>
    </Layout>
  )
}