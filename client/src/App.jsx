import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { SelectedProvider } from './SelectedContext';
import NavigationBar from './NavigationBar';
import Home from './Home';
import Scenarios from './Scenarios';
import Investments from './Investments';
import EventSeries from './EventSeries';
import Simulations from './Simulations';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      {/* Only show NavigationBar if the user is logged in */}
      {user && <NavigationBar />}

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/scenarios" element={<ProtectedRoute element={<Scenarios />} />} />
        <Route path="/investments" element={<ProtectedRoute element={<Investments />} />} />
        <Route path="/eventseries" element={<ProtectedRoute element={<EventSeries />} />} />
        <Route path="/simulations" element={<ProtectedRoute element={<Simulations />} />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <SelectedProvider>
        <AppContent />
      </SelectedProvider>
    </AuthProvider>
  );
}

export default App;