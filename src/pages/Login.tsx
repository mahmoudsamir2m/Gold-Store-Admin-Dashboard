import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaUser, FaLock, FaGem, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      const response = await api.post("/login", formData);
      const { token, user } = response.data.data;

      if (![1, 2].includes(user.roles[0]?.id)) {
        toast.error("ليس لديك صلاحية الدخول");
        return;
      }

      login(token, user);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("فشل في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full opacity-20 animate-pulse-gold"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full opacity-20 animate-pulse-gold"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full opacity-10 animate-float"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-gold mb-4 animate-float">
            <FaGem className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold gold-text mb-2">متجر الذهب</h1>
          <p className="text-gray-400 text-lg">لوحة التحكم الإدارية</p>
        </div>

        {/* Login form */}
        <div className="glass-effect p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h2>
            <p className="text-gray-400">ادخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaUser className="text-yellow-400 text-lg" />
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder="البريد الإلكتروني"
                className="w-full pr-10 pl-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 mr-2"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-lg" />
                  ) : (
                    <FaEye className="text-lg" />
                  )}
                </button>
                <FaLock className="text-yellow-400 text-lg" />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="كلمة المرور"
                className="w-full pr-20 pl-4 py-3  bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "btn-gold hover:scale-105 active:scale-95"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري التسجيل...
                </div>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              نظام إدارة متجر الذهب © 2024
            </p>
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-60 animate-pulse-gold"></div>
        <div
          className="absolute -bottom-4 -left-4 w-6 h-6 bg-yellow-500 rounded-full opacity-40 animate-pulse-gold"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
    </div>
  );
};

export default Login;
