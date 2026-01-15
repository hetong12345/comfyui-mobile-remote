// React 18+ 不再需要显式导入React
import MainScreen from './components/MainScreen'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <MainScreen />
    </div>
  )
}

export default App
