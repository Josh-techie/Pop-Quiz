import React from "react";
import { Link } from "react-router-dom";

const Aside = () => {
  return (
    <aside className="bg-blue-900 text-gray-200 w-64 flex-shrink-0">
      {/* Sidebar header */}
      <div className="p-4 text-xl font-bold">Admin Dashboard</div>

      {/* Sidebar navigation */}
      <nav className="px-4 py-2">
        <ul>
          <li className="mb-2">
            <Link
              to="/dashboard"
              className="block p-2 rounded hover:bg-blue-800"
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/users" className="block p-2 rounded hover:bg-blue-800">
              Users
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/products"
              className="block p-2 rounded hover:bg-blue-800"
            >
              Products
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/orders" className="block p-2 rounded hover:bg-blue-800">
              Orders
            </Link>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="absolute bottom-0 w-full p-4">
        <p className="text-sm">&copy; 2024 Admin Dashboard</p>
      </div>
    </aside>
  );
};

export default Aside;
