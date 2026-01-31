import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaLink } from "react-icons/fa";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../services/api";

const linkSchema = z.object({
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .max(255, "الاسم يجب أن يكون أقل من 255 حرف"),
  value: z.string().url("الرابط يجب أن يكون صحيحاً").min(1, "الرابط مطلوب"),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface LinkItem {
  id: number;
  name: string;
  value: string;
  type: string | null;
  created_at: string;
  updated_at: string;
}

const SocialLinks = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  const fetchLinks = async () => {
    try {
      const response = await api.get("/outside-links?per_page=15&page=1");
      setLinks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast.error("فشل في تحميل اللينكات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const onSubmit = async (data: LinkFormData) => {
    setSubmitting(true);
    const payload = { ...data, type: "social" as const };
    try {
      if (editingLink) {
        await api.put(`/outside-links/${editingLink.id}`, payload);
        toast.success("تم تحديث اللينك بنجاح");
      } else {
        await api.post("/outside-links", payload);
        toast.success("تم إضافة اللينك بنجاح");
      }
      setModalOpen(false);
      setEditingLink(null);
      reset();
      fetchLinks();
    } catch (error: any) {
      console.error("Error saving link:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("فشل في حفظ اللينك");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (link: LinkItem) => {
    setEditingLink(link);
    setValue("name", link.name);
    setValue("value", link.value);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا اللينك؟")) return;

    try {
      await api.delete(`/outside-links/${id}`);
      toast.success("تم حذف اللينك بنجاح");
      fetchLinks();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("فشل في حذف اللينك");
    }
  };

  const openAddModal = () => {
    const socialLinksCount = links.filter(
      (link) => link.type === "social",
    ).length;
    if (socialLinksCount >= 5) {
      toast.error("لا يمكن إضافة أكثر من 5 لينكات تواصل اجتماعي");
      return;
    }
    setEditingLink(null);
    reset();
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gold-text mb-2">
              إدارة اللينكات التواصل الاجتماعي
            </h1>
            <p className="text-gray-400">
              إضافة وتعديل وحذف اللينكات التواصل الاجتماعي
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-gold hover:shadow-2xl"
          >
            <FaPlus className="h-5 w-5" />
            إضافة لينك جديد
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) =>
            link.type !== "social" ? null : (
              <div
                key={link.id}
                className="glass-effect p-6 rounded-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <FaLink className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{link.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(link)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <a
                  href={link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 text-sm break-all"
                >
                  {link.value}
                </a>
              </div>
            ),
          )}
        </div>

        {links.length === 0 && (
          <div className="text-center py-12">
            <FaLink className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد لينكات بعد</p>
            <button
              onClick={openAddModal}
              className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto transition-all duration-300"
            >
              <FaPlus className="h-5 w-5" />
              إضافة أول لينك
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingLink ? "تعديل اللينك" : "إضافة لينك جديد"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الرابط
                </label>
                <input
                  type="url"
                  {...register("value")}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
                {errors.value && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.value.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? "جاري الحفظ..."
                    : editingLink
                      ? "تحديث"
                      : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialLinks;
