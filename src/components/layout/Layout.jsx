import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NotificationPanel from "../notification/NotificationPanel";

const Layout = () => {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex h-full">
        <Sidebar />

        <div className="flex flex-1 flex-col h-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <NotificationPanel />
    </div>
  );
};

export default Layout;
