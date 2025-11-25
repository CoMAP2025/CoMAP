// src/api/lessonPlan.js 或 src/api/cardGenerator.js
import api from "./index"; // 假设这是你配置好的 Axios 实例

/**
 * 调用后端 API 生成并下载教学卡片 PDF
 * @param {Object[]} nodes - 教学图谱的节点数据
 */
export const generateCardsPdf = async ({ nodes }) => {
  try {
    const response = await api.post(
      "/map/generate_cards_pdf", // 匹配后端的 PDF 卡片接口
      { nodes }, // 只发送 nodes 数据
      {
        headers: { "Content-Type": "application/json" },
        responseType: "blob", // 关键：告诉 Axios 服务器返回的是二进制数据
      }
    );

    // 检查响应是否成功
    if (response.status === 200) {
      // 从响应头中获取文件名
      const contentDisposition = response.headers["content-disposition"];
      const defaultFilename = "教学卡片.pdf"; // 默认文件名改为PDF
      let filename = defaultFilename;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // 创建一个 Blob 对象，用于生成下载链接
      const blob = new Blob([response.data], {
        type: "application/pdf", // 关键：将类型改为 PDF
      });

      // 创建一个临时的 URL 和 a 标签来触发下载
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // 设置下载文件名
      document.body.appendChild(link);
      link.click();

      // 清理：移除 a 标签并释放 URL 对象
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("教学卡片 PDF 文件已成功生成并下载！");
    } else {
      console.error("生成教学卡片失败，状态码：", response.status);
      // 如果后端返回的是错误信息，它可能不是 Blob，需要特殊处理
      const reader = new FileReader();
      reader.onload = () => {
        const errorData = JSON.parse(reader.result);
        throw new Error(errorData.error || "未知错误");
      };
      reader.readAsText(response.data);
    }
  } catch (error) {
    // 捕获网络错误、服务器错误等
    console.error("生成教学卡片时发生错误：", error);
    throw error; // 将错误抛出，以便组件中捕获并显示给用户
  }
};