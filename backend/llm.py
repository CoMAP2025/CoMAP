# llm.py

import os
import time
from dotenv import load_dotenv
from openai import OpenAI
from typing import List, Dict, Generator
from log import Logger 
import re
import json # 引入 json 模块

# Initialize logger
logger = Logger.get_logger()

class OpenAIClient:
    def __init__(self):
        load_dotenv()

        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_base = os.getenv("OPENAI_API_BASE")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", 0.7))
        self.max_retries = 3
        self.client = OpenAI(base_url=self.api_base, api_key=self.api_key)

    # 保持原有的 chat 方法，用于非流式请求
    def chat(self, messages: List[Dict[str, str]], json=False) -> str:
        attempt = 0
        while attempt < self.max_retries:
            try:
                # 你的现有 chat 实现...
                if json:
                    response = self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=self.temperature,
                        response_format={'type': 'json_object'}
                    )
                else:
                    response = self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=self.temperature
                    )
                message = response.choices[0].message.content
                logger.info(f"Response: {message}")
                return message
            except Exception as e:
                attempt += 1
                logger.error(f"Request failed. Retry attempt {attempt}... Error: {e}")
                time.sleep(2)
        return f"Request failed after {self.max_retries} attempts."

    # 新增流式 chat 方法
    def chat_stream(self, messages: List[Dict[str, str]]) -> Generator[str, None, None]:
        """
        Send messages to the OpenAI model and return a streaming response iterator.
        This function will not retry on failure; the caller should handle it.
        """
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                stream=True # 开启流式模式
            )
            for chunk in stream:
                # 确保只处理有内容的块
                if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    logger.debug(f"Streaming chunk: {content}")
                    yield content
        except Exception as e:
            logger.error(f"Streaming request failed. Error: {e}")
            yield f"Error: {e}" # 在流中发送错误信息，让前端处理
            return

def system_msg(msg: str) -> dict[str, str]:
    """Create a system role message"""
    return {
        'role': 'system',
        'content': msg
    }

def user_msg(msg: str) -> dict[str, str]:
    """Create a user role message"""
    return {
        'role': 'user',
        'content': msg
    }

def assistant_msg(msg: str) -> dict[str, str]:
    """Create an assistant role message"""
    return {
        'role': 'assistant',
        'content': msg
    }

def remove_json_codeblock_markers(input_str: str) -> str:

    """
    提取 Markdown 格式中的 ```json ... ``` 代码块内容，忽略其他内容。
    如果找不到这样的代码块，则返回原始字符串。
    """
    match = re.search(r"```json\s*(.*?)\s*```", input_str, re.DOTALL)
    if match:
        result = match.group(1).strip()
        print(f"JSON code block found: {result}")
        return result

    return input_str.strip()