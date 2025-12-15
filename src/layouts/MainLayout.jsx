import { Outlet } from "react-router-dom";
import { Button } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "../store/features/auth/authSlice";
import { LogOut } from "lucide-react";
import { toast } from "react-hot-toast";

const MainLayout = () => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">BrainSync AI 🧠</h1>
                <Button
                    type="text"
                    icon={<LogOut size={18} />}
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    Logout
                </Button>
            </nav>

            {/* Main Content */}
            <main className="p-6 max-w-7xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;