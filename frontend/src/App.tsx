import { Navigate, Route, Routes } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Layout from './components/common/Layout';
import PaymentsPage from './pages/PaymentsPage';
import TasksBoardPage from './pages/TasksBoardPage';
import TemplatesPage from './pages/TemplatesPage';
import AvailabilityPage from './pages/AvailabilityPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/payments" replace />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/tasks" element={<TasksBoardPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
