import { useState, useEffect } from "react";
import { FaVideo, FaUpload, FaPlay } from "react-icons/fa";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";

interface VideoData {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

const Videos = () => {
  const { token } = useAuthStore();
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentVideo = async () => {
    try {
      const response = await fetch("https://gold-stats.com/api/app-content/1", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setCurrentVideo(data.data);
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("فشل في تحميل الفيديو الحالي");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentVideo();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast.error("يرجى اختيار ملف فيديو صالح");
        return;
      }

      // Validate file size (22000 kilobytes = 22MB)
      const maxSize = 30000 * 1024;
      if (file.size > maxSize) {
        toast.error("حجم الملف يجب أن يكون أقل من 30000 كيلوبايت");
        return;
      }

      setSelectedFile(file);
      toast.success("تم اختيار الملف بنجاح");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف فيديو أولاً");
      return;
    }

    setIsUploading(true);
    try {
      // First, upload the video to the upload endpoint
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(
        "https://gold-stats.com/api/upload/video",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("فشل في رفع الفيديو");
      }

      const uploadData = await uploadResponse.json();
      const newVideoPath = uploadData.path || uploadData.data?.path;

      if (!newVideoPath) {
        throw new Error("لم يتم الحصول على مسار الفيديو الجديد");
      }

      // Then, update the app content with the new video path
      const updateResponse = await fetch(
        "https://gold-stats.com/api/app-content/1",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: newVideoPath,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("فشل في تحديث الفيديو");
      }

      const updateData = await updateResponse.json();
      setCurrentVideo(updateData.data);
      setSelectedFile(null);
      toast.success("تم رفع الفيديو بنجاح");

      // Reset file input
      const fileInput = document.getElementById(
        "video-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل في رفع الفيديو");
    } finally {
      setIsUploading(false);
    }
  };

  const getVideoUrl = (value: string) => {
    return `https://gold-stats.com/storage/${value}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gold-text mb-2">
            إدارة الفيديوهات
          </h1>
          <p className="text-gray-400">رفع وإدارة فيديو المقدمة</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Video Section */}
          <div className="glass-effect p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
              <FaVideo className="ml-2" />
              الفيديو الحالي
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : currentVideo ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={getVideoUrl(currentVideo.value)}
                  >
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                </div>
                <div className="text-sm text-gray-400">
                  <p>المعرف: {currentVideo.id}</p>
                  <p>المفتاح: {currentVideo.key}</p>
                  <p>
                    تم التحديث:{" "}
                    {new Date(currentVideo.updated_at).toLocaleDateString(
                      "ar-EG"
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPlay className="text-yellow-400" />
                  <a
                    href={getVideoUrl(currentVideo.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 underline"
                  >
                    عرض الفيديو في نافذة جديدة
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                لا يوجد فيديو حالي
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="glass-effect p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
              <FaUpload className="ml-2" />
              رفع فيديو جديد
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="video-upload"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  اختر ملف الفيديو
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الحد الأقصى لحجم الملف: 30000 كيلوبايت
                </p>
              </div>

              {selectedFile && (
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-300">
                    الملف المختار: {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    الحجم: {(selectedFile.size / 1024).toFixed(2)} كيلوبايت
                  </p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    رفع الفيديو
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;
