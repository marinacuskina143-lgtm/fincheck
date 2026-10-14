import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryPage } from './pages/CategoryPage'
import { EditorPage } from './pages/EditorPage'
import { HomePage } from './pages/HomePage'
import { ReceiptPage } from './pages/ReceiptPage'
import { ScanPage } from './pages/ScanPage'
import { FinProvider } from './store'

export default function App() {
  return (
    <BrowserRouter>
      <FinProvider>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/receipt/:id" element={<ReceiptPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/edit/:id" element={<EditorPage />} />
          </Route>
        </Routes>
      </FinProvider>
    </BrowserRouter>
  )
}
