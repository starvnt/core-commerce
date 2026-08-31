import { Link, Route, Routes } from 'react-router-dom';
import CustomersRoutes from './modules/customers';

function Home() {
  return (
    <main className="container">
      <h1>StarVnt Core</h1>
      <p className="muted">Day 1 foundation — Customer module.</p>
      <nav>
        <Link to="/customers">Customers →</Link>
      </nav>
    </main>
  );
}

function NotFound() {
  return (
    <main className="container">
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link to="/">Go home</Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/customers/*" element={<CustomersRoutes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
