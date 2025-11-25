from llm import OpenAIClient, system_msg, user_msg, remove_json_codeblock_markers
from flask import Response
import json
import json5
from log import Logger
from typing import List, Dict, Any
import io
import os
import pypandoc 
import tempfile
import uuid
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa

logger = Logger.get_logger()


client = OpenAIClient()

class AIAgents:
    """
    封装了五个AI交互的核心逻辑，每个方法负责构建特定提示并调用LLM。
    所有方法都只返回结构化的数据，不涉及数据库操作。
    """

    @staticmethod
    def refine_agent(current_node: Dict, user_prompt: str) -> Dict:
        """
        AI细化Agent：根据用户提示，优化单个卡片的内容。
        返回一个包含更新后卡片数据的字典。
        """
        system_prompt = (
            "你是一个教学图谱智能助手，你的任务是根据用户提供的提示（prompt），"
            "对指定的教学卡片内容进行细化和优化。\n"
            "卡片的类型包括：学习者、目标、活动、资源、评价、策略。\n"
            "请严格遵循以下规则输出JSON：\n"
            "1. 仅输出一个JSON对象，其中包含`new_node`字段。\n"
            "2. `new_node`是一个字典，包含细化后的`id`, `title`, `description`, `tag`。\n"
            "3. 保持原始的`id`和`tag`不变。\n"
            "4. 细化`description`字段，使其更具体、详尽，description可以写成html格式，另外，请不要说一些空泛的废话，我更希望是可以写的而更具体、可实施。\n"
            "5. `title`一般保持不变，除非细化后的内容强烈需要更改一个更恰当的标题。\n"
            "例如：\n"
            "```json\n"
            "{\n"
            "  \"new_node\": {\n"
            "    \"id\": \"123\",\n"
            "    \"title\": \"小组实验：制作太阳能烤箱\",\n"
            "    \"description\": \"学生使用纸箱、保鲜膜、铝箔等材料，在小组中设计并测试太阳能烤箱... (细化后的内容)\",\n"
            "    \"tag\": \"活动\"\n"
            "  }\n"
            "}\n"
            "```"
        )
        
        messages = [
            system_msg(system_prompt),
            user_msg(f"当前卡片：\n{json.dumps(current_node, ensure_ascii=False, indent=2)}\n\n"
                     f"细化指令：\n{user_prompt}")
        ]
        
        response = client.chat(messages, json=True)
        cleaned = remove_json_codeblock_markers(response)
        
        try:
            return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Refine agent failed to parse JSON: {e}")
            return {"status": "failure", "message": "无法解析AI响应"}

    @staticmethod
    def correct_agent(current_node: Dict, user_prompt: str) -> Dict:
        """
        AI纠正Agent：根据用户提示，纠正单个卡片的内容。
        返回一个包含更新后卡片数据的字典。
        """
        system_prompt = (
            "你是一个教学图谱智能助手，你的任务是根据用户提供的提示（prompt），"
            "对指定的教学卡片内容进行纠错和修改。\n"
            "请严格遵循以下规则输出JSON：\n"
            "1. 仅输出一个JSON对象，其中包含`new_node`字段。\n"
            "2. `new_node`是一个字典，包含纠正后的`id`, `title`, `description`, `tag`。\n"
            "3. 保持原始的`id`和`tag`不变。\n"
            "4. `description`应根据指令进行修改，确保内容的准确性、连贯性和专业性。\n"
            "例如：\n"
            "```json\n"
            "{\n"
            "  \"new_node\": {\n"
            "    \"id\": \"123\",\n"
            "    \"title\": \"小组实验：制作太阳能烤箱\",\n"
            "    \"description\": \"... (纠正后的具体内容)\",\n"
            "    \"tag\": \"活动\"\n"
            "  }\n"
            "}\n"
            "```"
        )
        
        messages = [
            system_msg(system_prompt),
            user_msg(f"当前卡片：\n{json.dumps(current_node, ensure_ascii=False, indent=2)}\n\n"
                     f"纠正指令：\n{user_prompt}")
        ]
        
        response = client.chat(messages, json=True)
        cleaned = remove_json_codeblock_markers(response)
        
        try:
            return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Correct agent failed to parse JSON: {e}")
            return {"status": "failure", "message": "无法解析AI响应"}

    @staticmethod
    def split_agent(current_node: Dict, user_prompt: str) -> Dict:
        """
        AI分裂Agent：将一个卡片的内容拆分为多个新卡片。
        返回一个包含旧卡片ID和新卡片列表的字典。
        """
        system_prompt = (
            "你是一个教学图谱智能助手，你的任务是根据用户提供的卡片内容，"
            "将其核心概念或步骤拆分为多个更小、更具体的独立新卡片。\n"
            "请严格遵循以下规则输出JSON：\n"
            "1. 仅输出一个JSON对象，其中包含`old_node_id`和`new_nodes`字段。\n"
            "2. `old_node_id`是原始卡片的ID。\n"
            "3. `new_nodes`是一个数组，包含新生成的卡片数据。每个新卡片应包含`id`, `tag`, `title`, `description`。\n"
            "4. `tag`可以沿用原始卡片的标签，或根据新内容调整为更合适的标签，tag可选类型包括：学习者、目标、活动、资源、评价、策略。必须在这六种之中选择！\n"
            "5. `title`和`description`应具体、详细，反映新卡片的核心内容。\n"
            "6. **【重点】所有键和字符串值都必须使用双引号。**\n"
            "7. **【重点】在列表或字典的最后一个元素后面，不允许有多余的逗号。**\n"
            "例如：\n"
            "```json\n"
            "{\n"
            "  \"old_node_id\": \"123\",\n"
            "  \"new_nodes\": [\n"
            "    {\"title\": \"...\", \"description\": \"...\", \"tag\": \"...\" **此处不允许有多余的逗号**},\n"
            "    { \"title\": \"...\", \"description\": \"...\", \"tag\": \"...\" **此处不允许有多余的逗号**} **此处不允许有多余的逗号**\n"
            "  ]\n"
            "}\n"
            "```"
        )
        
        messages = [
            system_msg(system_prompt),
            user_msg(f"当前卡片：\n{json.dumps(current_node, ensure_ascii=False, indent=2)}\n\n"
                     f"分裂指令：\n{user_prompt}")
        ]
        
        response = client.chat(messages, json=True)
        cleaned = remove_json_codeblock_markers(response)
        
        try:
            # 优先使用标准的 json 库进行解析
            return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Refine agent failed to parse with json: {e}. Retrying with json5.")
            try:
                # 如果标准解析失败，尝试使用 json5 库
                return json5.loads(cleaned)
            except Exception as e2:
                logger.error(f"Refine agent failed to parse with json5: {e2}. Giving up.")
                # 如果 json5 也失败，则返回失败信息
                return {"status": "failure", "message": "无法解析AI响应"}

    @staticmethod
    def sync_agent(current_node: Dict, connected_nodes: List[Dict], user_prompt: str) -> Dict:
        """
        AI同步Agent：根据一组相连卡片的内容，综合性地更新当前卡片。
        返回一个包含更新后卡片数据的字典。
        """
        system_prompt = (
            "你是一个教学图谱智能助手，你的任务是根据相连的其他卡片内容，"
            "修改当前卡片，使得当前卡片的信息与其他卡片内容同步\n"
            "请严格遵循以下规则输出JSON：\n"
            "1. 仅输出一个JSON对象，其中包含`new_node`字段。\n"
            "2. `new_node`是一个字典，包含同步后的`id`, `title`, `description`, `tag`。\n"
            "3. `id`和`tag`保持原始卡片的不变。\n"
            "4. `title`和`description`应逻辑一致、相互对照\n"
            "5. **【重点】所有键和字符串值都必须使用双引号。**\n"
            "6. **【重点】在列表或字典的最后一个元素后面，不允许有多余的逗号。**\n"
            "例如：\n"
            "```json\n"
            "{\n"
            "  \"new_node\": {\n"
            "    \"id\": \"123\",\n"
            "    \"title\": \"题目\",\n"
            "    \"description\": \"详细描述，以html的格式如<p>内容xxx</p>\",\n"
            "    \"tag\": \"策略\"\n **此处不允许有多余的逗号**"   
            "  }\n"
            "}\n"
            "```"
        )

        connected_nodes_str = json.dumps(connected_nodes, ensure_ascii=False, indent=2)
        messages = [
            system_msg(system_prompt),
            user_msg(f"当前卡片：\n{json.dumps(current_node, ensure_ascii=False, indent=2)}\n\n"
                     f"相连卡片：\n{connected_nodes_str}\n\n"
                     f"同步指令：\n{user_prompt}")
        ]
        
        response = client.chat(messages, json=True)
        cleaned = remove_json_codeblock_markers(response)
        
        try:
            return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Sync agent failed to parse JSON: {e}")
            return {"status": "failure", "message": "无法解析AI响应"}
            
    @staticmethod
    def influence_agent(current_node: Dict, connected_nodes: List[Dict], user_prompt: str) -> Dict:
        """
        AI影响Agent：根据当前卡片的内容，影响和修改一组相连的卡片。
        返回一个包含更新后相连卡片列表的字典。
        """
        system_prompt = (
            "你是一个教学图谱智能助手，你的任务是根据一个核心卡片（当前卡片）的内容，"
            "影响并修改一组相连的卡片，使其内容与核心卡片更紧密地关联、拓展或深化。\n"
            "请严格遵循以下规则输出JSON：\n"
            "1. 仅输出一个JSON对象，其中包含`new_nodes`字段。\n"
            "2. `new_nodes`是一个数组，包含所有被影响的卡片数据。每个卡片应包含`id`, `title`, `description`, `tag`。\n"
            "3. 保持原始的`id`和`tag`不变。\n"
            "4. `title`和`description`应根据核心卡片内容和用户指令进行相应调整和更新。\n"

            "例如：\n"
            "```json\n"
            "{\n"
            "  \"new_nodes\": [\n"
            "    {\"id\": \"456\", \"title\": \"... (更新后的标题)\", \"description\": \"... (更新后的描述)\", \"tag\": \"...\"},\n"
            "    {\"id\": \"789\", \"title\": \"... (更新后的标题)\", \"description\": \"... (更新后的描述)\", \"tag\": \"...\"}\n"
            "  ]\n"
            "}\n"
            "```"
        )
        
        connected_nodes_str = json.dumps(connected_nodes, ensure_ascii=False, indent=2)
        messages = [
            system_msg(system_prompt),
            user_msg(f"核心卡片：\n{json.dumps(current_node, ensure_ascii=False, indent=2)}\n\n"
                     f"相连卡片：\n{connected_nodes_str}\n\n"
                     f"影响指令：\n{user_prompt}")
        ]
        
        response = client.chat(messages, json=True)
        cleaned = remove_json_codeblock_markers(response)
        
        try:
            return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Influence agent failed to parse JSON: {e}")
            return {"status": "failure", "message": "无法解析AI响应"}


def generate_graph_response(user_input: str, concept_map: List[Dict], history: List[Dict] = None) -> Dict:
    client = OpenAIClient()

    system_prompt = (
        "你是一个教育智能专家，擅长以模块化方式逐步构建教学图谱。一般的设计顺序是分析学习者-设定教学目标-选择教学策略-设计资源和活动-设计评估，请你每次不要推理和思考，不要回复太多内容\n"
        "对于用户的教学设计请求，你应当像在对话中一样，一步步给出你的建议。模仿 Cursor 的风格,不把动作一次性吐出，而是分段讲清楚每一步设计意图 + 动作 JSON\n"
        "每一段建议后面附上相应的 JSON 结构，用```json包裹，字段为英文，内容为中文。在JSON中尽量详细的描写，在对话文本的部分尽量简略的表达\n"
        "输出风格应当自然、有引导性，可以包含多个JSON actions 块\n"
        "每个 JSON 结构应包含 actions 字段，但无需在对话中提及json结构的事情，因为你的对话对象是师范生和教师，他们不一定了解代码，例如：\n "
        "```json\n"
        "{\n"
        "  \"actions\": [ { \"option\": \"add\", \"type\": \"活动\", \"title\": \"...\", \"description\": \"...\" }, \n"
        " {  \"option\": \"modify\", \"card_id\":\"111\" \"type\": \"活动\", \"title\": \"...\", \"description\": \"...\"}]"
        "}\n"
        "```"
        "字段名包括 option、title、description、type、card_id（仅在修改时需要）。option包括add和modify两种，修改时需要指定修改的card_id，并且写出修改后的卡片内容\n"
        "注意：\n"
        "- 每个 action 是一个新增或修改的教学图谱元素，type类型包括：学习者、目标、活动、资源、评价、策略。title 和 description 应具体、可执行,description一定要非常详细才行"
        "- 在对话的开头请回应用户的输入，例如肯定用户的想法、总结、分析、阐述，可以加入一些emoji表情。\n"
        "- 在对话的结尾请你稍作总结，并给出下一步你可以帮助用户做的事情，让用户选择下一步做什么。"
        "- 非常建议你每次总是用JSON Action给用户一些选择，而不是使用纯文本对话的形式，这样可能使用户感到枯燥和无从下手"
        "- 对于上述六个元素如果有你不了解的内容，请不要胡乱猜测，而是给出一些action供用户选择。\n"
        "- 下面是一些提示，帮助你更好地理解每个元素的含义：\n"
        "- 目标应当具体、可测量，目标的标题应当是对目标描述的简明概括，不使用‘目标1’这类名称，可以在标题上标注出该目标属于知识与技能、过程与方法还是情感态度与价值观，也可以考虑标注一下学科。\n"
        "- 资源应当具体、可获得，最好给出具体的书籍、网站名称和链接。不能说的很宽泛，必须指定具体的事件、模型、网站名称，否则就是废话。\n"
        "- 评价方式可以为自评、他评、小组互评、教师评价、测验、汇报、展示等，应当给出具体的评价量表，并且应当和目标、活动相关联\n"
        "- 策略指的是具体的教学策略，如项目式学习、探究式学习等，应当具体说明， 你也可以给出更具创新性和前沿的教学策略建议。\n"
        "- 学习者指的是面向的学习者群体的特征，一般需要包括起点水平、学习风格、普遍认知特点、学习兴趣等"
        "- 在描述教学活动时，title请写为类似活动一：具体活动名称Xxx的风格，帮助教师了解活动的顺序，并且最好能够在标题上写明该活动所需要的时间"


    )

    
    map_str = json.dumps(concept_map, ensure_ascii=False, indent=2)
    messages = [
        user_msg(f"{system_prompt}\n\n当前图谱：\n{map_str}\n\n历史记录：{history}\n用户输入：{user_input}\n")
    ]
    response = client.chat(messages, json=False)
    return response.strip()
    
        
def stream_graph_response(user_input: str, concept_map: List[Dict], history: List[Dict] = None) -> Response:
    """一个 Flask 路由函数，返回一个流式响应"""
    return Response(
        generate_graph_response(user_input, concept_map, history),
        mimetype='text/event-stream'
    )

def generate_markdown_text(nodes: List[Dict], edges: List[Dict]) -> str:
    """
    根据教学图谱数据，调用大模型生成包含 Markdown 表格的教案文本。
    """
    client = OpenAIClient()
    system_prompt = (
        "你是一位经验丰富的教育专家和教学设计师。\n"
        "你的任务是将用户提供的教学图谱（包括卡片及其连接关系），转化为一份格式清晰、逻辑严谨的教案。\n"
        "请严格遵守以下要求来编写教案内容：\n"
        "- 教案应包括教学主题、教学目标、学习者分析、教学活动、教学策略、教学资源和评价方式等核心部分。\n"
        "- 请根据卡片的标签（type）来归类内容。\n"
        "- 请利用卡片之间的连接关系（edges）来组织教学活动的逻辑顺序。\n"
        "- **【关键】对于“教学活动”部分，请使用 Markdown 表格来呈现。表格必须包含以下三列：`教师活动`、`学生活动`和`设计意图`**。\n"
        "- 文本应流畅、自然，避免直接罗列卡片内容，而是将它们整合、阐述。\n"
        "- 请直接输出完整的 Markdown 格式文本，不要包含任何额外对话或代码块。\n"
        "- 使用Markdown标题（#、##）来组织教案结构，使用列表（-）来罗列具体内容。\n"
        "示例格式：\n"
        "# 教学主题：[请你根据卡片内容总结]\n"
        "## 一、教学目标\n"
        "- 具体目标1\n"
        "...\n"
        "## 三、教学活动\n"
        "| 教师活动 | 学生活动 | 设计意图 |\n"
        "| :--- | :--- | :--- |\n"
        "| 活动1 - 教师操作 | 活动1 - 学生参与 | 活动1 - 意图描述 |\n"
        "全部教案请通过英文输出，包括标题、文字和表格"
    )
    
    map_str = json.dumps({
        "nodes": nodes,
        "edges": edges
    }, ensure_ascii=False, indent=2)

    messages = [
        user_msg(f"{system_prompt}\n\n以下是教学图谱数据：\n{map_str}\n\n请根据以上数据，生成一份完整的 Markdown 格式教案。")
    ]
    
    print("正在调用大模型生成教案...")
    return client.chat(messages, json=False).strip()

def convert_markdown_to_docx(markdown_text: str) -> io.BytesIO:
    """
    将 Markdown 文本解析并转换为 Word 文档。
    此版本彻底修复了列表和表格的解析问题，采用更健壮的单次遍历和状态管理。
    """
    try:
        # 使用 pypandoc 将 Markdown 文本直接转换为 .docx 格式的字节流
        # to='docx' 指定输出格式为 Word
        # format='markdown_strict' 指定输入格式，确保兼容性
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp_file:
            temp_file_path = tmp_file.name

        # 调用 pypandoc，并指定 outputfile 为临时文件的路径
        pypandoc.convert_text(
            markdown_text,
            to='docx',
            format='gfm',
            outputfile=temp_file_path
        )
        
        # 将临时文件的内容读取到 BytesIO 内存流中
        with open(temp_file_path, 'rb') as f:
            docx_bytes = f.read()
        
        # 删除临时文件，确保不留下任何垃圾文件
        os.unlink(temp_file_path)

        output_stream = io.BytesIO(docx_bytes)
        output_stream.seek(0)
        
        return output_stream
        
    except FileNotFoundError:
        raise RuntimeError("Pandoc is not installed. Please install Pandoc to enable document conversion.")
    except Exception as e:
        # 确保即使出错，临时文件也会被删除
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise RuntimeError(f"Error converting Markdown to Word: {e}")


def generate_lesson_plan_with_tables(nodes: List[Dict], edges: List[Dict]) -> io.BytesIO:
    """主函数，调用生成和转换功能"""
    markdown_text = generate_markdown_text(nodes, edges)
    return convert_markdown_to_docx(markdown_text)



def render_cards_to_pdf_with_xhtml2pdf(card_list: List[Dict]) -> io.BytesIO:
    """
    使用 xhtml2pdf 将 HTML 模板渲染为 PDF。
    """
    # 1. 渲染 HTML 模板
    # 假设 card_template.html 在当前目录下
    env = Environment(loader=FileSystemLoader('.'))
    template = env.get_template('card_template.html')
    html_content = template.render(card_list=card_list)

    # 2. 将渲染的 HTML 转换为 PDF
    output_stream = io.BytesIO()
    
    # 使用 pisa.pisaDocument 将 HTML 内容写入 PDF
    # encoding='utf-8' 确保中文字符正确显示
    pisa_status = pisa.CreatePDF(
        html_content.encode('utf-8'),
        dest=output_stream,
        encoding='utf-8'
    )

    # 检查转换是否成功
    if not pisa_status.err:
        output_stream.seek(0)
        return output_stream
    else:
        # 如果转换失败，抛出异常
        raise RuntimeError("Failed to generate PDF with xhtml2pdf.")

# --- 完整的主函数调用示例 ---
def generate_printable_cards(nodes: List[Dict]) -> io.BytesIO:
    """主函数，用于整合数据和PDF生成"""
    card_list = []
    for node in nodes:
        node_info= node.get('data')
        card_list.append({
            "title": node_info.get("title", ""),
            "description": node_info.get("description", ""),
            "tag": node_info.get("tag", "")
        })
    print(card_list)
    
    # 调用新的 PDF 生成函数
    return render_cards_to_pdf_with_xhtml2pdf(card_list)

def generate_text_response_with_history(user_input: str, history: List[Dict]) -> str:
    """
    接收用户输入和完整的会话历史，生成纯文本回复。
    """
    client = OpenAIClient()
    system_prompt = "你是一个友好且乐于助人的AI助手，请以简洁明了的方式回答用户的问题。请你逐步地引导用户进行教学设计，避免一次性给出所有内容。请注意，你的回答应当是纯文本格式，不包含任何代码块或JSON结构。"
    
    # 构造发送给AI模型的完整messages列表
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_input})

    # 调用AI模型，获取纯文本回复
    response = client.chat(messages)
    return response.strip()