import { useState, useEffect } from "react";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import api from "../services/api";
import { Link } from "react-router-dom";

interface TitleData {
  title: string;
  subTitle1: string;
  title2: string;
  subTitle2: string;
  title3: string;
  subTitle3: string;
}

const Titles = () => {
  const [titles, setTitles] = useState<TitleData>({
    title: "",
    subTitle1: "",
    title2: "",
    subTitle2: "",
    title3: "",
    subTitle3: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const titleIds = {
    title: 9,
    subTitle1: 10,
    title2: 11,
    subTitle2: 12,
    title3: 13,
    subTitle3: 14,
  };

  const fetchTitles = async () => {
    try {
      const response = await api.get("https://gold-stats.com/api/app-content");
      const data = response.data.data;
      setTitles({
        title: data.title || "",
        subTitle1: data.subTitle1 || "",
        title2: data.title2 || "",
        subTitle2: data.subTitle2 || "",
        title3: data.title3 || "",
        subTitle3: data.subTitle3 || "",
      });
    } catch (error) {
      toast.error("فشل في تحميل العناوين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  const handleSave = async (key: keyof TitleData) => {
    setSaving(key);
    try {
      await api.put(`https://gold-stats.com/api/app-content/${titleIds[key]}`, {
        value: titles[key],
      });
      toast.success("تم حفظ التغيير بنجاح");
    } catch (error) {
      toast.error("فشل في حفظ التغيير");
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (key: keyof TitleData, value: string) => {
    setTitles((prev) => ({
      ...prev,
      [key]: value,
    }));
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
          <h2 className="text-3xl font-bold gold-text mb-2">إدارة العناوين</h2>
          <p className="text-gray-400">تعديل عناوين ووصف التطبيق</p>
        </div>
        <Link
          to="/"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FaArrowLeft className="ml-2" />
          العودة للرئيسية
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(titles).map(([key, value]) => (
          <div
            key={key}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {key === "title" && "العنوان الرئيسي"}
                {key === "subTitle1" && "الوصف الفرعي الرئيسي"}
                {key === "title2" && "العنوان الثاني"}
                {key === "subTitle2" && "الوصف الفرعي الثاني"}
                {key === "title3" && "العنوان الثالث"}
                {key === "subTitle3" && "الوصف الفرعي الثالث"}
              </h3>
              <button
                onClick={() => handleSave(key as keyof TitleData)}
                disabled={saving === key}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50"
              >
                {saving === key ? (
                  "جاري الحفظ..."
                ) : (
                  <>
                    <FaSave className="ml-2" />
                    حفظ
                  </>
                )}
              </button>
            </div>
            <textarea
              value={value}
              onChange={(e) =>
                handleChange(key as keyof TitleData, e.target.value)
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white resize-none"
              rows={key.startsWith("title") ? 2 : 4}
              placeholder={`أدخل ${key === "title" ? "العنوان" : "الوصف"} هنا...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Titles;
