import { Link, Route, Routes } from 'react-router-dom';
import CustomerList from './pages/CustomerList';
import AddCustomer from './pages/AddCustomer';
import CustomerDetails from './pages/CustomerDetails';

function CustomerLayout() {
  return (
    <>
      <header className="appbar">
        <div className="brand">StarVnt Core</div>
        <nav>
          <Link to="/customers">List</Link>
          <Link to="/customers/add">Add</Link>
        </nav>
      </header>
      <Routes>
        <Route index element={<CustomerList />} />
        <Route path="add" element={<AddCustomer />} />
        <Route path=":id" element={<CustomerDetails />} />
      </Routes>
    </>
  );
}

export default CustomerLayout;
