import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../store/services/authApi";
import { toast } from "react-hot-toast";
import { Lock, Mail, Loader2 } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [login, { isLoading }] = useLoginMutation();

    const onSubmit = async (data) => {
        try {
            await login(data).unwrap();
            toast.success("Login Successful!");
            navigate("/");
        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome Back! 👋
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your BrainSync AI notes
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register("email", { required: true })}
                                type="email"
                                placeholder="Email address"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register("password", { required: true })}
                                type="password"
                                placeholder="Password"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;