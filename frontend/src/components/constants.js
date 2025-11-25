// constants/index.js

import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';
import TourIcon from '@mui/icons-material/Tour';
import CategoryIcon from '@mui/icons-material/Category';
import GradeIcon from '@mui/icons-material/Grade';

export const TAG_OPTIONS = [
    { label: "学习者", value: "学习者", icon: SchoolIcon, color: "#4CAF50" },
    { label: "目标", value: "目标", icon: TourIcon, color: "#9C27B0" },
    { label: "策略", value: "策略", icon: LightbulbIcon, color: "#FFC107" },
    { label: "活动", value: "活动", icon: SportsHandballIcon, color: "#2196F3" },
    
    { label: "资源", value: "资源", icon: CategoryIcon, color: "#FF5722" },
    { label: "评价", value: "评价", icon: GradeIcon, color: "#795548" },
];

export const PRESET_LEARNER_FEATURES = [
    { title: "新建学习者卡片", description: "请根据实际情况填写学习者的特点。" },
    { title: "小学阶段学习者", description: "主要特点：好奇心强，注意力集中时间短，喜欢通过游戏和具体操作学习，对抽象概念理解能力较弱。" },
    { title: "初中阶段学习者", description: "主要特点：抽象思维开始发展，对同伴关系和自我认同敏感，能够进行逻辑推理，但情绪波动较大。" },
    { title: "高中阶段学习者", description: "主要特点：思维高度抽象化，具备较强的逻辑分析和独立思考能力，面临升学压力，有较强的自我规划意识。" },
    { title: "成年学习者", description: "主要特点：通常有明确的学习动机和目标，拥有丰富的经验，更注重学习内容的实用性和相关性，自主学习能力强。" },
];
export const PRESET_STRATEGIES = [
    {
        category: "空白卡片",
        items: [
            { title: "新建策略卡片", description: "请根据实际情况填写策略的名称和描述。" },
        ]
    },
    {
        category: "混合策略",
        items: [
            { title: "多元智能教学", description: "基于霍华德·加德纳的多元智能理论，设计多样化的教学活动，满足不同学生的智能类型（如语言智能、逻辑数学智能、空间智能、音乐智能、身体运动智能、人际智能、自我认知智能、自然观察智能），以促进全面发展。" },
            { title: "差异化教学", description: "根据学生的兴趣、能力和学习风格，调整教学内容、过程和评价方式，提供个性化的学习体验，确保每个学生都能在适合自己的方式中取得进步。" },
        ]
    },
    {
        category: "建构主义策略",
        items: [
            { title: "项目式学习 (PBL)", description: "以真实、复杂的问题或挑战为核心，引导学生进行长期、跨学科的自主探究与协作，通过创建最终产品来构建深度知识和高阶思维能力。" },
            { title: "探究式学习", description: "以学生的好奇心为驱动，通过提出问题、形成假设、收集和分析数据、得出结论等步骤，引导学生主动发现和理解知识，培养批判性思维和科学探究精神。" },
        ]
    },
    {
        category: "行为主义策略",
        items: [
            { title: "直接教学", description: "教师主导的、高度结构化的教学模式。通过清晰的讲解、示范、有指导的练习和即时反馈，帮助学生高效掌握基础知识和基本技能。适用于概念性或操作性技能的初次学习。" },
        ]
    },
    {
        category: "认知主义策略",
        items: [
            { title: "支架式教学", description: "教师通过提供结构化支持，如提示、工具或简化任务，帮助学生完成他们独立无法完成的任务，然后逐步撤销支持，让学生最终掌握技能。适用于复杂概念的教学。" },
        ]
    },
    {
        category: "合作学习策略",
        items: [
            { title: "合作学习", description: "组织学生以小组为单位，共同完成学习任务。强调小组成员间的积极互赖、面对面互动和个人责任，以实现共同的学习目标。适用于提升团队协作和社交技能。" },
        ]
    },
    {
        category: "情境化学习策略",
        items: [
            { title: "案例教学", description: "通过分析真实或虚构的案例，让学生在情境中应用知识、分析问题并做出决策，从而培养解决实际问题的能力。适用于商业、法律、医学等学科。" },
        ]
    },
];
export const PRESET_ACTIVITIES = [
    {
        title:"新建活动卡片",
        description: "请根据实际情况填写活动的名称和描述。",
        tag: "空白卡片",
    },
    // 互动式学习活动
    {
        title: "头脑风暴",
        description: " \n活动步骤：\n1. 教师提出核心问题或主题。\n2. 学生自由、快速地提出想法，不进行评判。\n3. 记录所有想法。\n4. 分类、筛选并评估想法。\n",
        tag: "互动学习",
    },
    {
        title: "问答接力",
        description: " \n活动步骤：\n1. 教师提出一个问题，指定一名学生回答。\n2. 该学生回答后，向另一名同学提出一个新问题。\n3. 依次进行，直到所有关键问题被覆盖。\n",
        tag: "互动学习",
    },
    
    // 合作学习活动
    {
        title: "六人圆桌",
        description: " \n活动步骤：\n1. 学生围绕一个主题进行小组讨论。\n2. 每位小组成员轮流发言，每次发言不超过一分钟。\n3. 确保所有成员都有贡献，并对发言内容进行记录。\n",
        tag: "合作学习",
    },
    {
        title: "拼图法",
        description: " \n活动步骤：\n1. 将一个大主题分解为几个小主题。\n2. 分配不同学生（或小组）负责研究一个小主题。\n3. 汇集所有学生，让他们互相分享各自的研究成果，拼凑出完整的知识图景。\n",
        tag: "合作学习",
    },
    
    // 探究式学习活动
    {
        title: "项目式学习",
        description: " \n活动步骤：\n1. 提出一个真实世界的挑战或问题。\n2. 学生以小组为单位，进行长时间的自主探究和创作。\n3. 最终以产品、报告或演示等形式展示成果。\n",
        tag: "探究学习",
    },
    {
        title: "案例分析",
        description: " \n活动步骤：\n1. 教师提供一个真实的案例情境。\n2. 学生分析案例中的问题、人物、背景等要素。\n3. 讨论并提出可能的解决方案和决策。\n",
        tag: "探究学习",
    },
    
    // 实践与应用活动
    {
        title: "模拟操作",
        description: " \n活动步骤：\n1. 设置一个接近真实环境的虚拟或物理情境。\n2. 学生在情境中进行操作，学习技能或解决问题。\n3. 教师提供即时反馈，帮助学生掌握要领。\n",
        tag: "实践应用",
    },
    {
        title: "概念图构建",
        description: " \n活动步骤：\n1. 教师给出核心概念。\n2. 学生通过连接关键术语和概念，构建可视化的知识结构图。\n3. 讨论不同连接方式的逻辑和含义。\n",
        tag: "实践应用",
    },
    
    // 评价与反思活动
    {
        title: "小组互评",
        description: " \n活动步骤：\n1. 学生完成任务后，以小组为单位互相分享成果。\n2. 成员根据既定标准，互相提供建设性的反馈。\n3. 教师引导学生学习如何进行有效评价。\n",
        tag: "评价反思",
    },
    {
        title: "反思日志",
        description: " \n活动步骤：\n1. 学生定期（或在某个活动后）撰写个人日志。\n2. 日志内容包括：我学到了什么？遇到了什么困难？我将如何改进？\n3. 教师可以批阅并提供个性化反馈。\n",
        tag: "评价反思",
    },
];

export const PRESET_EVALUATIONS = [
    {
        category: "空白卡片",
        items: [
            { title: "新建评价卡片", description: "请根据实际情况填写评价的名称和描述。" },
        ]
    },
    {
        category: "形成性评价",
        items: [
            { title: "一分钟小结", description: "在课程结束时，让学生用一分钟写下学到的一个重要知识点和仍有的一个疑问。用于即时反馈。" },
            { title: "课堂提问与观察", description: "通过观察学生的课堂参与度和回答，评估学生的理解程度。非正式，贯穿教学始终。" },
            { title: "同伴互评", description: "学生根据评价标准，互相评价作业或表现。可培养批判性思维和反思能力。" },
        ]
    },
    {
        category: "总结性评价",
        items: [
            { title: "期末考试", description: "在教学单元或课程结束后进行，用于衡量最终的学习成果和知识掌握程度。" },
            { title: "项目报告/展示", description: "要求学生完成一个项目并提交报告或进行展示，评估其综合应用知识和解决问题的能力。" },
            { title: "作品集评价", description: "通过学生在一段时间内收集的作品，全面评估其学习过程和进步。" },
        ]
    },
];

// constants/index.js

// ... (其他常量和类别保持不变)

export const PRESET_GOALS = [
    {
        category: "空白卡片",
        items: [
            { title: "新建目标卡片", description: "请根据实际情况填写教学目标的名称和描述。" },
        ]
    },
    {
        category: "基于核心素养的教学目标四要素模板",
        items: [
            {
                type: "template",
                title: "模板1：基础知识与技能目标",
                description: "【行为主体】学生\n【行为条件】通过[具体学习活动，如：阅读课本、观看视频]\n【行为动词】能够[描述具体行为，如：背诵、列举、概括]\n【达成程度】[明确的量化标准，如：准确无误地、至少说出三点]。",
            },
            {
                type: "template",
                title: "模板2：问题解决与实践目标",
                description: "【行为主体】学生\n【行为条件】在[具体情境，如：小组合作、利用实验工具]下\n【行为动词】能够[描述解决问题的行为，如：设计、分析、论证]\n【达成程度】[明确的成果标准，如：形成一份完整的报告、方案]。",
            },
            {
                type: "template",
                title: "模板3：价值观与情感目标",
                description: "【行为主体】学生\n【行为条件】在[具体情境，如：讨论历史事件、阅读文学作品]后\n【行为动词】能够[描述外显行为，如：表达、反思、评价]\n【达成程度】[可观察的表现，如：能够客观评价、能提出自己的独到见解]。",
            },
        ]
    }
];

// 修改后的资源常量，只保留直接跳转的平台
// 修改后的资源常量，将URL合并到description中
export const PRESET_RESOURCES = [
    {
        category: "空白卡片",
        items: [
            { type: "link", title: "新建资源卡片", description: "请根据实际情况填写资源的名称和描述。" },
        ]
    },
    {
        category: "1. 视频资源",
        items: [
            { type: "link", title: "中国教育电视台", description: "官方直播与点播平台，提供海量中小学课程视频，内容权威且免费。 <a href='https://www.centv.cn/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "B站学习区", description: "国内最大的UGC知识分享社区，有大量高质量的课程、纪录片和科普视频。 <a href='https://www.bilibili.com/v/knowledge/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "油管 (YouTube)", description: "全球最大的视频平台，拥有海量国际教育内容，可能需要特殊网络环境访问。 <a href='https://www.youtube.com/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "TED Talks", description: "各领域专家的精彩演讲，激发学生思考，有中文版和字幕。 <a href='https://www.ted.com/talks' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "MOOC公开课", description: "提供了一个中文搜索引擎，可以聚合搜索国内外大学公开课视频。 <a href='https://www.icourse163.org/search.htm' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
        ]
    },
    {
        category: "2. 文档和PPT资源",
        items: [
            { type: "link", title: "国家中小学智慧教育平台", description: "官方权威教案、课件、试题库，涵盖中小学所有学科，免费且高质量。 <a href='https://basic.smartedu.cn/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "组卷网", description: "国内主流的试题资源平台，以智能组卷功能见长。 <a href='https://www.zujuan.com/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "学科网", description: "另一个常用备课平台，提供各学科教案、课件和试题库。 <a href='https://www.zxxk.com/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
        ]
    },
    {
        category: "3. 课程学习平台",
        items: [
            { type: "link", title: "中国大学MOOC", description: "集合了国内顶尖高校的在线课程，可用于教师自我提升或学生拓展学习。 <a href='https://www.icourse163.org/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "学堂在线", description: "清华大学发起，提供海量MOOC课程，覆盖文理各科。 <a href='https://www.xuetangx.com/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "网易云课堂", description: "提供多种技能培训课程，从编程到设计，可作为兴趣拓展资源。 <a href='https://study.163.com/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "可汗学院 (中文版)", description: "提供免费、互动式的数学、科学等学科课程，内容系统化。 <a href='https://zh.khanacademy.org/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
        ]
    },
    {
        category: "4. 电子书和文献平台",
        items: [
            { type: "link", title: "Z-Library (镜像)", description: "全球最大的免费电子图书馆，可下载海量图书。链接不稳定，可以自行搜索最新可用镜像。 <a href='https://zh.z-library.sk/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "Library Genesis (Libgen)", description: "另一个知名的免费文献和电子书数据库，与Z-Library互补。 <a href='https://libgen.ad/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "中国知网 (CNKI)", description: "权威学术文献数据库，可用于深入探究特定主题。 <a href='https://www.cnki.net/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
        ]
    },
    {
        category: "5. 互动工具与AI辅助",
        items: [
            { type: "link", title: "PhET 交互式模拟", description: "科罗拉多大学开发的免费科学模拟工具，让学生通过游戏式互动探索物理、化学等概念。 <a href='https://phet.colorado.edu/zh_CN/simulations/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "Kahoot!", description: "一款热门的游戏化学习平台，教师可创建趣味问答，提高课堂参与度。 <a href='https://kahoot.com/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "MindManager", description: "思维导图软件，帮助教师和学生梳理知识结构，形成可视化知识体系。 <a href='https://www.mindmanager.com/cn/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "WPS AI", description: "集成在WPS Office套件中的AI工具，可辅助生成教案、PPT大纲等。 <a href='https://ai.wps.cn/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
            { type: "link", title: "Canva", description: "强大的在线设计工具，用于制作精美课件、海报、信息图等。 <a href='https://www.canva.cn/' target='_blank' onclick='event.stopPropagation();' style='color: orange;'>访问链接</a>" },
        ]
    },
];