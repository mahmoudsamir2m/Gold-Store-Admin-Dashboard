import { Link, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaBox,
  FaShieldAlt,
  FaBlog,
  FaHome,
  FaSignOutAlt,
  FaBars,
  FaClock,
  FaVideo,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";

const Dashboard = () => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    blogs: 0,
    pendingProducts: 0,
    pendingOrders: 0,
  });

  const navigation = [
    { name: "الرئيسية", href: "/", icon: FaHome },
    { name: "المستخدمين", href: "/users", icon: FaUsers },
    { name: "المنتجات", href: "/products", icon: FaBox },
    { name: "سياسة الخصوصية", href: "/privacy", icon: FaShieldAlt },
    { name: "المدونات", href: "/blogs", icon: FaBlog },
    { name: "الفيديوهات", href: "/videos", icon: FaVideo },
  ];

  const dashboardCards = [
    {
      title: "إدارة المستخدمين",
      description: "عرض وإدارة المستخدمين",
      href: "/users",
      icon: FaUsers,
      color: "from-yellow-400 to-yellow-600",
    },
    {
      title: "إدارة المنتجات",
      description: "عرض وإدارة المنتجات",
      href: "/products",
      icon: FaBox,
      color: "from-yellow-500 to-yellow-700",
    },
    {
      title: "سياسة الخصوصية",
      description: "تعديل سياسة الخصوصية",
      href: "/privacy",
      icon: FaShieldAlt,
      color: "from-yellow-600 to-yellow-800",
    },
    {
      title: "المدونات",
      description: "إدارة المدونات",
      href: "/blogs",
      icon: FaBlog,
      color: "from-yellow-700 to-yellow-900",
    },
    {
      title: "الفيديوهات",
      description: "إدارة الفيديوهات",
      href: "/videos",
      icon: FaVideo,
      color: "from-yellow-800 to-yellow-950",
    },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, blogsRes] = await Promise.all([
          api.get("/users"),
          api.get("/admin/products"),
          api.get("/blogs"),
        ]);
        console.log("Users response:", usersRes.data);
        console.log("Products response:", productsRes.data);
        console.log("Blogs response:", blogsRes.data);
        const usersData = usersRes.data?.data || usersRes.data || [];
        const productsData = productsRes.data?.data || productsRes.data || [];
        const blogsData = blogsRes.data?.data || blogsRes.data || [];

        const pendingProducts = Array.isArray(productsData)
          ? productsData.filter((product: any) => !product.is_approved).length
          : 0;

        setStats({
          users: Array.isArray(usersData) ? usersData.length : 0,
          products: Array.isArray(productsData) ? productsData.length : 0,
          blogs: Array.isArray(blogsData) ? blogsData.length : 0,
          pendingProducts,
          pendingOrders: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          users: 0,
          products: 0,
          blogs: 0,
          pendingProducts: 0,
          pendingOrders: 0,
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-gray-950/90 backdrop-blur-sm border-l border-gray-800 transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:border-l-0`}
      >
        {/* Top Brand Bar */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-800">
          <img src="/icon-gold.png" alt="Logo" className="h-12 w-12" />
          <div className="relative">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 tracking-wide">
              دهبنا للإدارة
            </h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1">
          <ul className="space-y-1.5">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-250 ${
                    location.pathname === item.href
                      ? "bg-gradient-to-r from-yellow-900/40 to-yellow-800/30 text-yellow-100 shadow-[0_0_12px_rgba(234,179,8,0.15)] border-l-2 border-yellow-500"
                      : "text-gray-400 hover:text-yellow-300 hover:bg-gray-900/60"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="ml-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button – Stylish & Subtle */}
        <div className="p-4 border-t border-gray-800/60 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 rounded-xl bg-gray-900/50 hover:bg-red-900/40 hover:text-red-200 transition-all duration-250"
          >
            <FaSignOutAlt className="h-5 w-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:mr-64">
        {/* Top bar */}
        <div className="bg-gray-900 shadow-lg border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <FaBars className="h-6 w-6" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-semibold ml-2">
                  يا مسؤل اهلا بعودتك
                </span>
                <span className="text-gray-300">مرحباً، </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="p-6">
          <div className="mb-8 flex justify-between ">
            <div>
              <h2 className="text-3xl font-bold gold-text mb-2">لوحة التحكم</h2>
              <p className="text-gray-400">إدارة متجر الذهب الخاص بك</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <Link
                key={card.title}
                to={card.href}
                className={`group relative overflow-hidden bg-gradient-to-br ${card.color} p-6 rounded-xl shadow-gold hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-float`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <card.icon className="h-8 w-8 text-white opacity-90" />
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-white text-opacity-90 text-sm">
                    {card.description}
                  </p>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white bg-opacity-10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
              </Link>
            ))}
          </div>

          {/* Stats section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-effect p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.users.toLocaleString()}
                  </p>
                </div>
                <FaUsers className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="glass-effect p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.products.toLocaleString()}
                  </p>
                </div>
                <FaBox className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="glass-effect p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">المنتجات المعلقة</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.pendingProducts.toLocaleString()}
                  </p>
                </div>
                <FaClock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="glass-effect p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">المدونات</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.blogs.toLocaleString()}
                  </p>
                </div>
                <FaBlog className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
