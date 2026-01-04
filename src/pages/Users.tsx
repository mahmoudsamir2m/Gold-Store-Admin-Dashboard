import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import api from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  city: string | null;
  country: string | null;
  status: string;
  phone: string | null;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      // الـ API يُرجع: { status, code, message, data: [...] }
      // لذا نستخدم response.data.data
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("تم حذف المستخدم بنجاح");
      fetchUsers(); // إعادة التحميل بعد الحذف
    } catch (error) {
      toast.error("فشل في حذف المستخدم");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="mb-8">
        <h2 className="text-3xl font-bold gold-text mb-2">إدارة المستخدمين</h2>
        <p className="text-gray-400">عرض وإدارة جميع المستخدمين في النظام</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="البحث بالايميل او اسم المستخدم"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      {user.city && user.country
                        ? `${user.city}, ${user.country}`
                        : "غير محدد"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.phone || "غير محدد"}
                    </p>
                    <span
                      className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === "onboarding"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 p-2"
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-8 text-center text-gray-500">
              لا يوجد مستخدمين
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Users;
