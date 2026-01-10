import { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaSearch, FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import api from "../services/api";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  metal: string;
  category: string;
  product_type: string;
  karat: string;
  weight: string;
  price: string;
  label: string;
  images: string[];
  description: string;
  is_active: boolean;
  is_approved: boolean;
  average_rating: number;
  reviews_count: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  city: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const Products = () => {
  const goldKarats = [
    { value: "24", label: "24 عيار" },
    { value: "22", label: "22 عيار" },
    { value: "21", label: "21 عيار" },
    { value: "18", label: "18 عيار" },
  ];

  const silverKarats = [
    { value: "925", label: "925" },
    { value: "900", label: "900" },
    { value: "800", label: "800" },
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  // Filter states
  const [search, setSearch] = useState("");
  const [metal, setMetal] = useState("");
  const [category, setCategory] = useState("");
  const [karat, setKarat] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [productType, setProductType] = useState("");
  const [city, setCity] = useState("");

  const getAvailableKarats = () => {
    if (metal === "gold") {
      return goldKarats;
    } else if (metal === "silver") {
      return silverKarats;
    } else {
      return [...goldKarats, ...silverKarats];
    }
  };

  useEffect(() => {
    const availableKarats = getAvailableKarats();
    if (karat && !availableKarats.some((k) => k.value === karat)) {
      setKarat("");
    }
  }, [metal]);

  const fetchProducts = async (
    page = 1,
    filterType = filter,
    currentSearch = search,
    currentMetal = metal,
    currentCategory = category,
    currentKarat = karat,
    currentMinPrice = minPrice,
    currentMaxPrice = maxPrice,
    currentProductType = productType,
    currentCity = city
  ) => {
    try {
      let url = `/admin/products?page=${page}&per_page=12`;
      if (filterType === "approved") {
        url += "&is_approved=1";
      } else if (filterType === "pending") {
        url += "&is_approved=0";
      }

      // Add filters to URL
      if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
      if (currentMetal) url += `&metal=${encodeURIComponent(currentMetal)}`;
      if (currentCategory)
        url += `&category=${encodeURIComponent(currentCategory)}`;
      if (currentKarat) url += `&karat=${encodeURIComponent(currentKarat)}`;
      if (currentMinPrice) url += `&min_price=${currentMinPrice}`;
      if (currentMaxPrice) url += `&max_price=${currentMaxPrice}`;
      if (currentProductType)
        url += `&product_type=${encodeURIComponent(currentProductType)}`;
      if (currentCity) url += `&city=${encodeURIComponent(currentCity)}`;

      const response = await api.get(url);
      setProducts(response.data.data);
      setTotalPages(response.data.meta.last_page);
      setCurrentPage(page);
    } catch (error) {
      toast.error("فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/products/${id}/approve`);
      toast.success("تم الموافقة على المنتج بنجاح");
      fetchProducts(currentPage, filter);
    } catch (error) {
      toast.error("فشل في الموافقة على المنتج");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.post(`/admin/products/${id}/reject`);
      toast.success("تم رفض المنتج بنجاح");
      fetchProducts(currentPage, filter);
    } catch (error) {
      toast.error("فشل في رفض المنتج");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse-gold text-xl text-yellow-400">
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="mb-8">
          <h2 className="text-3xl font-bold gold-text mb-2">إدارة المنتجات</h2>
          <p className="text-gray-400">عرض وإدارة جميع منتجات الذهب</p>
        </div>
        <Link
          to="/"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FaArrowLeft className="ml-2" />
          العودة للرئيسية
        </Link>
      </div>

      <>
        <div className="mb-6">
          <div className="flex space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "all"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "approved"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              المعتمدة
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              المعلقة
            </button>
          </div>
        </div>

        {/* Filters Form */}
        <div className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold gold-text flex items-center">
              <FaSearch className="ml-2 text-yellow-600" />
              فلاتر البحث المتقدمة
            </h3>
            <div className="text-sm text-gray-600">
              ابحث وصف المنتجات بسهولة
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                بحث عام
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
                placeholder="ابحث في العنوان أو الوصف..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                المعدن
              </label>
              <select
                value={metal}
                onChange={(e) => setMetal(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
              >
                <option value="">جميع المعادن</option>
                <option value="gold">ذهب</option>
                <option value="silver">فضة</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                الفئة
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
              >
                <option value="">جميع الفئات</option>
                <option value="jewelry">مجوهرات</option>
                <option value="bullion">سبائك</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                العيار
              </label>
              <select
                value={karat}
                onChange={(e) => setKarat(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
              >
                <option value="">جميع العيارات</option>
                {getAvailableKarats().map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                السعر الأدنى
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                السعر الأعلى
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
                placeholder="10000"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                نوع المنتج
              </label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
                placeholder="خاتم، قلادة، إلخ..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                المدينة
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white"
                placeholder="القاهرة، الإسكندرية..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setLoading(true);
                setCurrentPage(1);
                fetchProducts(
                  1,
                  filter,
                  search,
                  metal,
                  category,
                  karat,
                  minPrice,
                  maxPrice,
                  productType,
                  city
                );
              }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FaSearch className="ml-3 text-xl" />
              تطبيق الفلاتر والبحث
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.title}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_approved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.is_approved ? "معتمد" : "معلق"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>المعدن:</strong> {product.metal}
                  </p>
                  <p>
                    <strong>الفئة:</strong> {product.category}
                  </p>
                  <p>
                    <strong>النوع:</strong> {product.product_type}
                  </p>
                  <p>
                    <strong>العيار:</strong> {product.karat}
                  </p>
                  <p>
                    <strong>الوزن:</strong> {product.weight} جرام
                  </p>
                  <p>
                    <strong>السعر:</strong> {product.price} {product.label}
                  </p>
                  <p>
                    <strong>المدينة:</strong> {product.city}
                  </p>
                  <p>
                    <strong>اسم الاتصال:</strong> {product.contact_name}
                  </p>
                  <p>
                    <strong>هاتف الاتصال:</strong> {product.contact_phone}
                  </p>
                </div>

                {product.images.length > 0 && (
                  <div className="mt-4">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}

                {filter === "pending" && (
                  <div className="mt-4 flex space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => handleApprove(product.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                    >
                      <FaCheck className="ml-2" />
                      موافقة
                    </button>
                    <button
                      onClick={() => handleReject(product.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                    >
                      <FaTimes className="ml-2" />
                      رفض
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => fetchProducts(page, filter)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? "z-10 bg-yellow-50 border-yellow-500 text-yellow-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </nav>
          </div>
        )}
      </>
    </div>
  );
};

export default Products;
