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
import CreateScenario from './CreateScenario';
import EditScenario from './EditScenario';
import { DataProvider } from './DataContext';
import CreateInvestment from './CreateInvestment';
import EditInvestment from './EditInvestment';
import CreateEventSeries from './CreateEventSeries';
import EditEventSeries from './EditEventSeries';
import Strategies from './Strategies';


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
        <Route path="/strategies" element={<ProtectedRoute element={<Strategies />} />} />

        <Route path="/create-scenario" element={<ProtectedRoute element={<CreateScenario />} />} />
        <Route path="/edit-scenario/:id" element={<ProtectedRoute element={<EditScenario />} />} />

        <Route path="/create-investment" element={<ProtectedRoute element={<CreateInvestment />} />} />
        <Route path="/edit-investment/:id" element={<ProtectedRoute element={<EditInvestment />} />} />

        <Route path="/create-event-series" element={<ProtectedRoute element={<CreateEventSeries />} />} />
        <Route path="/edit-event-series/:id" element={<ProtectedRoute element={<EditEventSeries />} />} />

       
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <SelectedProvider>
        <DataProvider>
            <AppContent />
        </DataProvider>
      </SelectedProvider>
    </AuthProvider>
  );
}

export default App;