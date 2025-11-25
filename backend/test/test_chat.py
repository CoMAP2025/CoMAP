import requests
import json
from uuid import uuid4

# 定义后端API的URL基础地址
BASE_URL = "http://localhost:5000/chat"

def test_chat_interface():
    """
    测试聊天接口的完整流程：创建会话 -> 发送消息。
    """
    print("--- 开始测试后端聊天接口 ---")

    # 1. 测试创建会话接口
    create_session_url = f"{BASE_URL}/create"
    user_id_to_test = str("testuser") # 使用一个随机生成的user_id进行测试
    
    create_payload = {
        "user_id": user_id_to_test
    }

    print(f"步骤1：正在调用创建会话接口 -> {create_session_url}")
    print(f"请求数据：{json.dumps(create_payload, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(create_session_url, json=create_payload)
        response.raise_for_status() # 如果状态码不是2xx，将抛出异常
        
        session_data = response.json()
        session_id = session_data.get("session_id")
        
        if session_id:
            print(f"✔ 成功创建会话！获取到的 session_id: {session_id}")
        else:
            print(f"❌ 创建会话失败：无法从响应中获取 session_id。响应内容：{response.text}")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ 创建会话请求失败，请确保后端服务已在 {BASE_URL} 运行。错误：{e}")
        return

    # 2. 测试发送聊天消息接口
    generate_url = f"{BASE_URL}/chat"
    user_question = "你好，请自我介绍一下。"
    
    generate_payload = {
        "session_id": session_id,
        "question": user_question,
    }
    
    print(f"\n步骤2：正在发送聊天请求 -> {generate_url}")
    print(f"请求数据：{json.dumps(generate_payload, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(generate_url, json=generate_payload)
        response.raise_for_status()
        
        reply_data = response.json()
        reply = reply_data.get("reply")
        
        if reply:
            print(f"✔ 成功获取到AI回复！")
            print(f"AI回复内容：\n{reply}")
        else:
            print(f"❌ 获取回复失败：无法从响应中获取 reply。响应内容：{response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ 聊天请求失败，请检查后端服务日志。错误：{e}")

if __name__ == "__main__":
    test_chat_interface()