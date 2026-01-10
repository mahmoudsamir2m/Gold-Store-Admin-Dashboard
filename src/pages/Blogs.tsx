import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { toast } from "sonner";
import api from "../services/api";

interface BlogContent {
  id?: number;
  blog_title_id?: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

interface BlogTitle {
  id?: number;
  blog_id?: number;
  title: string;
  type: string;
  contents: BlogContent[];
  created_at?: string;
  updated_at?: string;
}

interface Blog {
  id: number;
  name: string;
  image_path: string;
  titles: BlogTitle[];
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  imageFile: File | null;
  image_path: string;
  titles: BlogTitle[];
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    imageFile: null,
    image_path: "",
    titles: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get("/blogs");
      setBlogs(response.data);
    } catch (error) {
      toast.error("فشل في تحميل المدونات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه المدونة؟")) return;

    try {
      await api.delete(`/blogs/${id}`);
      toast.success("تم حذف المدونة بنجاح");
      fetchBlogs();
    } catch (error) {
      toast.error("فشل في حذف المدونة");
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setEditingBlogId(null);
    setFormData({
      name: "",
      imageFile: null,
      image_path: "",
      titles: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setIsEditing(true);
    setEditingBlogId(blog.id);
    setFormData({
      name: blog.name,
      imageFile: null,
      image_path: blog.image_path,
      titles: blog.titles.map((title) => ({
        ...title,
        contents: title.contents.map((content) => ({
          content: content.content,
        })),
      })),
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    try {
      const response = await api.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          image_path: response.data.data.path,
        }));
        toast.success("تم رفع الصورة بنجاح");
      }
    } catch (error) {
      toast.error("فشل في رفع الصورة");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      handleImageUpload(file);
    }
  };

  const addTitle = () => {
    setFormData((prev) => ({
      ...prev,
      titles: [
        ...prev.titles,
        { title: "", type: "content", contents: [{ content: "" }] },
      ],
    }));
  };

  const removeTitle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      titles: prev.titles.filter((_, i) => i !== index),
    }));
  };

  const updateTitle = (
    index: number,
    field: keyof BlogTitle,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      titles: prev.titles.map((title, i) =>
        i === index ? { ...title, [field]: value } : title
      ),
    }));
  };

  const addContent = (titleIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      titles: prev.titles.map((title, i) =>
        i === titleIndex
          ? { ...title, contents: [...title.contents, { content: "" }] }
          : title
      ),
    }));
  };

  const removeContent = (titleIndex: number, contentIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      titles: prev.titles.map((title, i) =>
        i === titleIndex
          ? {
              ...title,
              contents: title.contents.filter((_, j) => j !== contentIndex),
            }
          : title
      ),
    }));
  };

  const updateContent = (
    titleIndex: number,
    contentIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      titles: prev.titles.map((title, i) =>
        i === titleIndex
          ? {
              ...title,
              contents: title.contents.map((content, j) =>
                j === contentIndex ? { ...content, content: value } : content
              ),
            }
          : title
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم المدونة");
      return;
    }
    if (!formData.image_path) {
      toast.error("يرجى رفع صورة");
      return;
    }
    if (formData.titles.length === 0) {
      toast.error("يرجى إضافة على الأقل قسم واحد");
      return;
    }
    for (const title of formData.titles) {
      if (title.title.includes("\n")) {
        toast.error("عنوان القسم يجب أن يكون في سطر واحد فقط");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        image_path: formData.image_path,
        titles: formData.titles.map((title) => ({
          title: title.title,
          type: title.type,
          contents: title.contents.map((content) => ({
            content: content.content,
          })),
        })),
      };

      if (isEditing && editingBlogId) {
        await api.put(`/blogs/${editingBlogId}/complete`, payload);
        toast.success("تم تحديث المدونة بنجاح");
      } else {
        await api.post("/blogs/complete", payload);
        toast.success("تم إنشاء المدونة بنجاح");
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (error) {
      toast.error("فشل في حفظ المدونة");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">إدارة المدونات</h2>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button
                onClick={handleCreate}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FaPlus className="ml-2" />
                إنشاء مدونة جديدة
              </button>
              <Link
                to="/"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FaArrowLeft className="ml-2" />
                العودة للرئيسية
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {blog.name}
                    </h3>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="text-yellow-500 hover:text-yellow-600 p-2"
                        title="تعديل"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-900 p-2"
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {blog.image_path && (
                    <div className="mb-4">
                      <img
                        src={`https://gold-stats.com/storage/${blog.image_path}`}
                        alt={blog.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>عدد الأقسام:</strong> {blog.titles.length}
                    </p>
                    <p>
                      <strong>تاريخ الإنشاء:</strong>{" "}
                      {new Date(blog.created_at).toLocaleDateString("ar-EG")}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      الأقسام:
                    </h4>
                    <div className="space-y-1">
                      {blog.titles.slice(0, 3).map((title) => (
                        <div key={title.id} className="text-xs text-gray-600">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              title.type === "header"
                                ? "bg-blue-100 text-blue-800"
                                : title.type === "content"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {title.type === "header"
                              ? "مقدمة"
                              : title.type === "content"
                              ? "محتوى"
                              : "خاتمة"}
                          </span>{" "}
                          {title.title}
                        </div>
                      ))}
                      {blog.titles.length > 3 && (
                        <p className="text-xs text-gray-500">
                          ... و {blog.titles.length - 3} أقسام أخرى
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد مدونات</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? "تعديل المدونة" : "إنشاء مدونة جديدة"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    اسم المدونة
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    صورة المدونة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full"
                  />
                  {formData.image_path && (
                    <img
                      src={`https://gold-stats.com/api/${formData.image_path}`}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الأقسام
                  </label>
                  {formData.titles.map((title, titleIndex) => (
                    <div
                      key={titleIndex}
                      className="border border-gray-200 rounded p-4 mb-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-medium">
                          القسم {titleIndex + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeTitle(titleIndex)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          عنوان القسم
                        </label>
                        <input
                          type="text"
                          value={title.title}
                          onChange={(e) =>
                            updateTitle(titleIndex, "title", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          نوع القسم
                        </label>
                        <select
                          value={title.type}
                          onChange={(e) =>
                            updateTitle(titleIndex, "type", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="header">مقدمة</option>
                          <option value="content">محتوى</option>
                          <option value="footer">خاتمة</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المحتويات
                        </label>
                        {title.contents.map((content, contentIndex) => (
                          <div
                            key={contentIndex}
                            className="flex items-center mb-2"
                          >
                            <textarea
                              value={content.content}
                              onChange={(e) =>
                                updateContent(
                                  titleIndex,
                                  contentIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 mr-2"
                              rows={3}
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeContent(titleIndex, contentIndex)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addContent(titleIndex)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          إضافة محتوى
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTitle}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                  >
                    إضافة قسم
                  </button>
                </div>
                <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
