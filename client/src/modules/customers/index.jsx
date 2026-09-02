import { Link, Route, Routes } from 'react-router-dom';
import CustomerList from './pages/CustomerList';
import AddCustomer from './pages/AddCustomer';
import CustomerDetails from './pages/CustomerDetails';

function CustomerLayout() {
  return (
    <main className="container">
      <Routes>
        <Route index element={<CustomerList />} />
        <Route path="add" element={<AddCustomer />} />
        <Route path=":id" element={<CustomerDetails />} />
      </Routes>
    </main>
  );
}

export default CustomerLayout;
