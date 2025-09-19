// src/api/lessonPlan.js
import api from "./index" // 假设这是你配置好的 Axios 实例

/**
 * 调用后端 API 生成并下载教案
 * @param {Object[]} nodes - 教学图谱的节点数据
 * @param {Object[]} edges - 教学图谱的连接数据
 */
export const generateLessonPlan = async ({ nodes, edges }) => {
  try {
    const response = await api.post(
      "/map/map-lesson-plan",
      { nodes, edges },
      {
        headers: { "Content-Type": "application/json" },
        responseType: "blob", // 关键：告诉 Axios 服务器返回的是二进制数据
      }
    )

    // 检查响应是否成功
    if (response.status === 200) {
      // 从响应头中获取文件名，后端设置的 download_name 对应于 Content-Disposition
      // 格式通常是 attachment; filename="教学设计教案.docx"
      const contentDisposition = response.headers["content-disposition"]
      const defaultFilename = "教学设计教案.docx"
      let filename = defaultFilename

      if (contentDisposition) {
        // 使用正则表达式从响应头中提取文件名
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/)
        if (filenameMatch && filenameMatch.length > 1) {
          filename = decodeURIComponent(filenameMatch[1])
        }
      }

      // 创建一个 Blob 对象，用于生成下载链接
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })

      // 创建一个临时的 URL 和 a 标签来触发下载
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename) // 设置下载文件名
      document.body.appendChild(link)
      link.click()

      // 清理：移除 a 标签并释放 URL 对象
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log("教案文件已成功生成并下载！")
    } else {
      console.error("生成教案失败，状态码：", response.status)
      // 如果后端返回的是错误信息，它可能不是 Blob，需要特殊处理
      const reader = new FileReader()
      reader.onload = () => {
        const errorData = JSON.parse(reader.result)
        throw new Error(errorData.error || "未知错误")
      }
      reader.readAsText(response.data)
    }
  } catch (error) {
    // 捕获网络错误、服务器错误等
    console.error("生成教案时发生错误：", error)
    throw error // 将错误抛出，以便组件中捕获并显示给用户
  }
}