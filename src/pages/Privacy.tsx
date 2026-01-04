import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import api from "../services/api";

type PrivacyForm = {
  title: string;
  list: string[];
};

/* ================= Component ================= */

const Privacy = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrivacyForm>({
    defaultValues: {
      title: "سياسة الخصوصية",
      list: ["نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية."],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: "list",
  });

  /* ================= Fetch Data ================= */

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await api.get("/privacy");
        console.log("API Response:", response.data); // Debug log

        const data = response.data.data || response.data; // Handle different response structures
        const { title, list } = data;

        console.log("Extracted title:", title, "list:", list); // Debug log

        const safeList = Array.isArray(list) ? list : [];
        const finalTitle = title || "سياسة الخصوصية";
        const finalList =
          safeList.length > 0
            ? safeList
            : ["نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية."];

        console.log("Final title:", finalTitle, "Final list:", finalList); // Debug log

        // Reset the entire form to ensure proper update
        reset({ title: finalTitle, list: finalList });
      } catch (error) {
        console.error("Error fetching privacy:", error); // Debug log
        toast.error("فشل في تحميل سياسة الخصوصية");

        reset({
          title: "سياسة الخصوصية",
          list: ["نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية."],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  /* ================= Submit ================= */

  const onSubmit = async (data: PrivacyForm) => {
    setSaving(true);
    try {
      const filteredList = data.list.filter((item) => item.trim() !== "");

      if (filteredList.length === 0) {
        toast.error("يجب إضافة نقطة واحدة على الأقل");
        return;
      }

      await api.post("/privacy", {
        title: data.title,
        list: filteredList,
      });

      toast.success("تم حفظ سياسة الخصوصية بنجاح");
    } catch (error) {
      toast.error("فشل في حفظ سياسة الخصوصية");
    } finally {
      setSaving(false);
    }
  };

  /* ================= Loading ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-700">جاري التحميل...</div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">سياسة الخصوصية</h2>

            <Link
              to="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FaArrowLeft className="ml-2" />
              العودة للرئيسية
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* ===== Title ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  العنوان
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className="mt-1 block w-full text-gray-500 bg-white border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* ===== List ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  النقاط
                </label>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <input
                        {...register(`list.${index}`)}
                        className="flex-1 text-gray-500 bg-white border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-900 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => append("نقطة جديدة" as any)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-yellow-500"
                >
                  <FaPlus className="ml-2" />
                  إضافة نقطة
                </button>
              </div>

              {/* ===== Save ===== */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
