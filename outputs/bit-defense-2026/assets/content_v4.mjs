export const deckMeta = {
  title: "高速端到端视觉避障的时序状态空间建模与流式部署一致性研究",
  subtitle: "北京理工大学硕士学位论文答辩",
  school: "北京理工大学",
  schoolEn: "Beijing Institute of Technology",
  institute: "自动化学院",
  major: "控制工程",
  advisor: "甘明刚教授",
  author: "戴英特",
  date: "2026年6月",
  mainSlideCount: 18,
  slideCount: 23,
};

export const theme = {
  bitRed: "#7A1E22",
  bitGreen: "#1F5A45",
  ink: "#161616",
  warmWhite: "#F7F5F2",
  warmPanel: "#E9E4DD",
  copper: "#B88A3B",
  muted: "#6F665F",
  line: "#CFC7BD",
  softGreen: "#E6F0EB",
  softRed: "#F4E9EA",
  softCopper: "#F3EBDD",
};

const fig11 = "Image/图1-1_高速端到端视觉避障应用场景与共性挑战_v2.png";

export const slideDeck = [
  {
    id: "cover",
    type: "cover",
    kicker: "硕士学位论文答辩",
    title: "高速端到端视觉避障的时序状态空间建模与流式部署一致性研究",
    subtitle: "围绕时序建模、状态一致性与风险补分布构建高速视觉避障系统。",
    image: fig11,
    heroMode: "wide",
    heroCaption: "时序建模 · 状态一致性 · 风险补分布",
    logo: "Helper_manual/HelperSection/figures/BIT.jpg",
    details: [
      "答辩人：戴英特",
      "专业：控制工程",
      "学院：自动化学院",
      "指导教师：甘明刚 教授",
      "北京理工大学",
      "2026年6月",
    ],
    figures: [],
    speakerNotes:
      "各位老师好，我的论文题目是《高速端到端视觉避障的时序状态空间建模与流式部署一致性研究》。这版汇报我会先讲每一章的方法，再讲对应实验结果。全文主要回答三个问题：高速时序决策怎么建模，序列策略怎么可靠流式部署，以及视觉骨干升级后如何定位并修复风险状态瓶颈。",
  },
  {
    id: "agenda",
    type: "agenda",
    title: "汇报提纲",
    sections: ["背景问题", "方法设计", "关键实验", "总结展望"],
    figures: [],
    speakerNotes:
      "主汇报共18页，后面5页作为备份页。汇报顺序是先说明背景和问题定义，再按第3章、第4章、第5章分别介绍方法和实验，最后总结贡献、局限和未来工作。这里的重点是让方法逻辑先出现，再用结果证明方法有效。",
  },
  {
    id: "intro",
    type: "merged-intro",
    kicker: "Part 1 / Problem",
    title: "高速视觉避障是部分可观测的实时闭环控制问题",
    image: fig11,
    metric: {
      label: "闭环反应窗口被压缩",
      value: "50 ms × 10–12 m/s = 0.5–0.6 m",
    },
    io: [
      "输入：深度图 D_t + 轻量状态 s_t=[q_t, v_target]",
      "输出：世界坐标系三维速度指令 v_t=[v_x, v_y, v_z]",
    ],
    challenges: [
      "单帧观测不足：必须利用历史信息抑制噪声、遮挡和运动模糊",
      "训练与部署语义不同：batch 训练，streaming 闭环递推",
      "实时闭环约束：模型准确性、平滑性与推理延迟必须共同满足",
    ],
    footer: "本文方法线索：策略怎么学、状态怎么部署、骨干升级后瓶颈怎么修复。",
    figures: [
      { figure: "图1.1", page: "p26", source: `主视觉：${fig11}` },
      { figure: "正文推导", page: "第1章", source: "50 ms 延迟与 10–12 m/s 决策盲区量化说明" },
    ],
    speakerNotes:
      "这一页先把问题讲清楚。高速视觉避障不是单帧图像分类，而是部分可观测的实时闭环控制问题。输入是前视深度图和轻量状态，输出是世界坐标系下的三维速度指令。在10到12米每秒时，50毫秒延迟就对应0.5到0.6米的决策盲区，所以单帧噪声、状态估计误差和控制延迟都会被快速放大。本文后面的三章分别对应三个层面：第3章解决策略怎么学，第4章解决学到的序列策略怎么正确部署，第5章解决视觉骨干升级后性能瓶颈如何定位和修复。",
  },
  {
    id: "route-protocol",
    type: "route-protocol",
    kicker: "Research Route",
    title: "全文方法路线：策略学习、流式一致性、架构演进三条线并行推进",
    chains: [
      {
        label: "第3章 策略学习链",
        steps: ["ViT spatial encoder", "Temporal Mamba", "BC", "DAgger", "RACS"],
        caption: "先构建端到端策略，再用闭环数据和部署约束增强稳定性。",
      },
      {
        label: "第4章 部署一致性链",
        steps: ["Batch–Streaming equivalence", "episode lifecycle", "runtime guardrails"],
        caption: "把序列状态管理从经验实现变成可验证工程约束。",
      },
      {
        label: "第5章 架构演进链",
        steps: ["MambaVision replacement", "controlled ablation", "risk-set distillation", "Omega-event fix"],
        caption: "先排除混淆变量，再定位风险状态覆盖不足并定向修复。",
      },
    ],
    protocol:
      "统一评测协议：Flightmare；Spheres 训练，Spheres/Trees 测试；3/5/7/9/12 m/s；每档 10 次；基础指标为 Collision Rate / Count / Jerk / Inference，第5章补充 Mean Vx 与 CPM。",
    footer: "后续每章都按“方法设计 → 控制变量 → 实验验证”的顺序展开。",
    figures: [
      { figure: "图3.2 / 图1.8", page: "p62 / p37", source: "三条方法链来自论文系统架构与技术路线" },
      { figure: "表2.4 / 指标定义", page: "第2章", source: "主汇报压缩评测协议；完整口径见 Backup A" },
    ],
    speakerNotes:
      "这一页是总方法路线。第3章是策略学习链：ViT 负责空间编码，Temporal Mamba 负责历史聚合，再通过 BC、DAgger 和 RACS 完成训练到部署的闭环。第4章是部署一致性链：定义 Batch–Streaming 等价性，再提出 episode 级状态生命周期和运行时防护。第5章是架构演进链：在固定时序模块和评测协议的前提下迁移到 MambaVision，通过逐步消融定位瓶颈，再用风险状态蒸馏和 Omega-event 修复。底部是全文统一评测口径，详细指标放在备份页。下面进入第3章方法。",
  },
  {
    id: "ch3-network-method",
    type: "network-method",
    kicker: "Chapter 3 Method",
    title: "第 3 章方法：用 ViT 负责空间编码，用 Mamba 负责时序聚合",
    image: "tmp/slides/bit-defense-2026-v2/generated/fig3_2.png",
    flow: [
      { title: "Depth D_t", caption: "60×90 深度图" },
      { title: "2-stage ViT", caption: "单帧空间编码" },
      { title: "concat state", caption: "f_vis ; q_t ; v_target" },
      { title: "Projection", caption: "d_model = 192" },
      { title: "4-layer Mamba", caption: "流式时序状态聚合" },
      { title: "Control Head", caption: "v_raw=[v_x,v_y,v_z]" },
    ],
    points: [
      "输入：深度图 D_t + 姿态四元数 q_t + 目标速度 v_target",
      "输出：世界坐标系三维速度指令 v_t=[v_x,v_y,v_z]",
      "核心设计：ViT 提取空间结构，Mamba 在状态中聚合历史观测",
      "对比设置：LSTM 基线只替换时序模块，其余配置保持一致",
    ],
    control: "公平性控制：Same ViT encoder / same training protocol / similar parameters / only temporal module changes",
    footer: "第 3 章首先验证：在相同空间编码和训练协议下，Mamba 是否真正贡献高速时序建模能力。",
    figures: [
      { figure: "图3.2", page: "p62", source: "主图：策略网络总体架构" },
      { figure: "表3.1 / 结构描述", page: "第3章", source: "流程节点：ViT、d_model=192、4-layer Temporal Mamba、控制头" },
    ],
    speakerNotes:
      "第3章的问题是高速避障中单帧观测不足，策略需要利用历史信息。我的方法是构建空间编码—时序聚合—控制输出的端到端策略网络。第一层用轻量化 ViT 将 60×90 深度图编码为视觉特征；第二层把视觉特征和姿态、目标速度拼接后投影到 192 维；第三层输入 4 层 Temporal Mamba，在流式状态中聚合历史观测；最后由线性控制头输出三维速度指令。关键控制变量是：与 ViT+LSTM 基线使用相同 ViT 编码器、相近参数量和相同训练协议，只替换时序模块。下一页说明训练和部署链路。",
  },
  {
    id: "ch3-train-deploy-method",
    type: "train-deploy-method",
    kicker: "Chapter 3 Method",
    title: "第 3 章方法：用 DAgger 修正分布偏移，用 RACS 约束部署输出",
    train: ["Expert trajectories", "BC pretraining R0", "Student rollout", "Expert relabeling", "Dataset aggregation", "R1 → R2 → R3"],
    trainCaptions: ["专家轨迹", "建立基础策略", "闭环采样", "重新标注", "聚合风险状态", "迭代训练"],
    deploy: ["v_raw from policy", "RACS projection", "v_cmd to controller"],
    deployCaptions: ["策略原始输出", "限制相邻指令变化", "发布速度指令"],
    bcFormula: "L_BC = mean ||v_pred - v_expert||_2^2",
    bcCaption: "学习专家轨迹上的基础避障行为。",
    racsFormula: "min ||v_cmd-v_raw||^2\ns.t. ||v_cmd-v_prev|| <= δ_t",
    racsCaption: "部署侧后处理，不改变训练目标。",
    footer: "DAgger 解决训练—部署分布偏移，RACS 解决部署输出平滑性；二者作用层面不同。",
    figures: [
      { figure: "表3.6 / 算法描述", page: "第3章", source: "DAgger 轮次、学生 rollout、专家标注与数据聚合流程" },
      { figure: "RACS 定义", page: "第3章", source: "RACS 投影约束与 <0.1 ms 部署开销" },
    ],
    speakerNotes:
      "第3章不只提出网络结构，还要处理训练分布和部署输出。仅靠行为克隆会遇到训练分布和部署分布不一致的问题：高速段中，学生策略一旦轻微偏离，就可能进入专家轨迹覆盖不足的状态。DAgger 的作用是让学生在闭环中采集这些偏离状态，再由专家重新标注并聚合到训练集。RACS 则不参与训练，它只在部署侧把原始速度指令投影到速率受限的可行域内，限制相邻速度指令变化。简单说，DAgger 修正数据分布，RACS 约束控制输出。下一页用实验验证 Mamba 时序模块本身的贡献。",
  },
  {
    id: "main-result",
    type: "main-evidence",
    kicker: "Chapter 3 Result",
    title: "受控对比表明：Mamba 时序聚合在高速段和 OOD 环境下优于 LSTM",
    mainImage: "Image/图3-1_ViT加Mamba与ViT加LSTM多指标对比.png",
    stripImage: "Image/图3-4_控制循环周期Δt分布统计.png",
    control: "公平对比：Same ViT / same protocol / similar parameters / LSTM → Mamba",
    bullets: [
      "主图读法：重点看 7 / 9 / 12 m/s 的高速段趋势",
      "图3.6 说明控制循环周期稳定，排除时钟抖动伪差异",
    ],
    stats: [
      ["Spheres 9 m/s", "7.82% → 2.49%\n9.0 → 2.3"],
      ["Trees 7 m/s", "7.37% → 2.25%\n8.4 → 2.3"],
    ],
    figures: [
      { figure: "图3.5", page: "p73", source: "主图：ViT+Mamba vs ViT+LSTM 多指标对比" },
      { figure: "图3.6", page: "p74", source: "底部证据条：控制循环周期一致性" },
      { figure: "表3.8 / 表3.9", page: "第3章", source: "右侧数字卡：Spheres 9 m/s 与 Trees 7 m/s" },
    ],
    speakerNotes:
      "这一页验证第3章第一个方法判断：在控制变量一致时，Mamba 是否比 LSTM 更适合高速时序聚合。这里同一套 ViT 编码器、相近参数量、相同训练协议和部署协议都保持一致，唯一主要变化是 LSTM 换成 Mamba。左侧图3.5看整体趋势，重点看中高速段。右侧两个数字来自论文表格：Spheres 9米每秒碰撞率从7.82%降到2.49%，碰撞次数从9.0降到2.3；Trees 7米每秒碰撞率从7.37%降到2.25%，碰撞次数从8.4降到2.3。底部图3.6说明控制循环周期稳定，所以结果不是实现节拍差异造成的。下一页验证 DAgger 和 RACS 的系统补强作用。",
  },
  {
    id: "dagger-racs-result",
    type: "dagger-racs-result",
    kicker: "Chapter 3 Result",
    title: "DAgger 与 RACS 分别提升训练稳定性和部署平滑性",
    daggerImage: "Image/图3-5_DAgger轮次碰撞事件次数曲线.png",
    racsImage: "Image/图3-2_不同方法指令Jerk随速度趋势.png",
    table: {
      columns: [
        { label: "模块", width: 0.9 },
        { label: "解决的问题", width: 1.4 },
        { label: "结果含义", width: 1.7 },
      ],
      rows: [
        ["DAgger", "训练—部署分布偏移", "少量闭环数据让高速段碰撞方差收敛"],
        ["RACS", "速度指令剧烈跳变", "<0.1 ms 开销降低 Command Jerk"],
      ],
    },
    footer: "共同作用：一个修正训练数据分布，一个约束部署输出，不混为同一种改进。",
    figures: [
      { figure: "图3.7", page: "p75", source: "DAgger 轮次碰撞事件次数" },
      { figure: "图3.15", page: "p79", source: "RACS / 不同方法 Command Jerk 随速度趋势" },
      { figure: "表3.6 / 正文", page: "第3章", source: "54 条增量轨迹、约 9.2% 数据增量、RACS <0.1 ms 开销" },
    ],
    speakerNotes:
      "这一页把第3章的两个系统补强结果放在一起，但要强调它们解决的问题不同。DAgger 解决训练—部署分布偏移，新增数据只有54条，约为BC数据的9.2%，但这些数据来自学生策略闭环诱导出的偏离状态，因此能让高速段碰撞事件和方差收敛。RACS 解决部署输出平滑性，它不改变策略训练目标，只在推理阶段限制相邻速度指令变化。右下表格说明二者作用层面不同：一个修正数据分布，一个约束控制输出。第3章到这里说明了策略怎么学，下面进入第4章，说明学到的序列策略如何正确流式部署。",
  },
  {
    id: "stream-method",
    type: "stream-method",
    kicker: "Chapter 4 Method",
    title: "第 4 章方法：把流式部署正确性形式化为 Batch–Streaming 等价性",
    equivalence: "y_t^batch = y_t^stream,  ∀t",
    conditions: {
      columns: [
        { label: "条件", width: 0.8 },
        { label: "含义", width: 2 },
      ],
      rows: [
        ["C1", "初始化一致：同一初始状态与 Warmup"],
        ["C2", "回合内状态连续传播：episode 内 keep state"],
        ["C3", "输入内容与时间顺序一致"],
      ],
    },
    lifecycle: {
      columns: [
        { label: "阶段", width: 1 },
        { label: "状态动作", width: 2 },
      ],
      rows: [
        ["Start/Warmup", "reset h_0；允许状态更新但屏蔽输出"],
        ["Run/Terminate", "回合内持续传播；仅 episode 边界 reset"],
      ],
    },
    footer: "第 4 章贡献：把序列模型部署正确性变成可验证、可审计、可阻断的工程约束。",
    figures: [
      { figure: "图4.3 / 图4.4", page: "p90", source: "状态生命周期状态机与 Batch / Stream / Reset 时间轴" },
      { figure: "正文定义", page: "第4章", source: "Batch–Streaming 等价性、C1/C2/C3 条件、Δv_t 单测口径" },
    ],
    speakerNotes:
      "第4章的问题是：训练阶段的 batch 前向和部署阶段的 streaming 前向语义不同，如果内部状态管理错了，序列模型结论会被污染。我的方法是定义 Batch–Streaming 等价性：对于同一输入序列，batch 输出和 streaming 输出在每个时刻应该一致。等价成立依赖三个条件：初始状态一致，回合内状态连续传播，输入内容和顺序一致。状态生命周期协议对应这个定义：episode 开始时初始化，Warmup 阶段更新状态但屏蔽输出，Run 阶段持续 keep state，Terminate 后才重置。下一页展示如果破坏 C2 条件会发生什么。",
  },
  {
    id: "state-trap",
    type: "trap-evidence",
    kicker: "Chapter 4 Result",
    title: "违反 C2 连续传播条件会把序列模型退化为“无记忆策略”",
    leftImage: "Image/图4-1_状态重置与保持漂移对比.png",
    stripImage: "tmp/slides/bit-defense-2026-v2/generated/fig4_7.png",
    condition: "同一权重，唯一变量为状态管理方式；Spheres 7 m/s",
    table: {
      columns: [
        { label: "指标", width: 1.2 },
        { label: "KeepState", width: 1 },
        { label: "ResetState", width: 1 },
      ],
      rows: [
        ["Collision Rate", "2.72%", "90.0%"],
        ["Mean Y Drift", "0.022 m", "0.770 m"],
        ["Mean Jerk", "0.56", "1.06"],
      ],
    },
    note: "这组实验验证了第 4 章方法页中的 C2 条件：一旦回合内状态传播被中断，序列模型会退化为无记忆策略。",
    figures: [
      { figure: "图4.5", page: "p96", source: "主图：轨迹漂移对比" },
      { figure: "表4.1 / 图4.6", page: "第4章 / p96", source: "KeepState vs ResetState 指标表" },
      { figure: "图4.7", page: "p97", source: "底部证据条：重置频率消融" },
    ],
    speakerNotes:
      "这一页验证上一页的 C2 条件。实验使用同一模型权重、同一 Spheres 环境、同一7米每秒速度，唯一变量是 streaming 部署时是否保持内部状态。左侧轨迹图显示 ResetState 会快速出现横向漂移；右侧表格给出量化后果：碰撞率从2.72%升到90.0%，平均横向漂移从0.022米升到0.770米，Command Jerk 也从0.56升到1.06。底部重置频率消融说明，重置越频繁，退化越严重。因此第4章的结论不是简单修一个 bug，而是证明状态生命周期是序列策略成立的必要条件。下面进入第5章，讲视觉骨干升级后的方法学。",
  },
  {
    id: "ablation-method",
    type: "ablation-method",
    kicker: "Chapter 5 Method",
    title: "第 5 章方法：用单变量消融定位 MambaVision 的真实瓶颈",
    steps: [
      "Step 0 归一化口径锁定",
      "Step 1 ViT → MambaVision",
      "Step 2 分辨率 60×90 → 128×192",
      "Step 3 Stage-3 解冻",
      "Step 4 FC-Pool / ActionKD",
      "Step 5 风险状态补分布蒸馏",
    ],
    variables: {
      columns: [
        { label: "始终保持不变", width: 1.4 },
        { label: "逐步改变", width: 1.6 },
      ],
      rows: [
        ["Temporal Mamba / 控制头 / KeepState 部署协议", "视觉骨干"],
        ["训练数据基准 / 评测环境 / 速度档", "输入分辨率"],
        ["统一指标：安全、效率、延迟共同判断", "骨干训练状态 / 结构 / 风险数据分布"],
      ],
    },
    logic: {
      columns: [
        { label: "现象", width: 1.3 },
        { label: "速度效率", width: 1 },
        { label: "判断", width: 1.5 },
      ],
      rows: [
        ["碰撞下降", "速度不降", "保留为有效变量"],
        ["碰撞恶化", "速度不升", "判定避障能力退化"],
        ["碰撞下降", "速度显著下降", "警惕“降速换安全”"],
      ],
    },
    footer: "第 5 章不是一次模型替换实验，而是先排除混淆变量，再定位瓶颈，最后针对瓶颈修复。",
    figures: [
      { figure: "图5.19", page: "p137", source: "逐步消融路线总览" },
      { figure: "第5章控制变量表", page: "第5章", source: "固定模块、变化变量和安全—效率—延迟共同判断逻辑" },
    ],
    speakerNotes:
      "第5章的问题是：把视觉骨干替换为 MambaVision 后，性能瓶颈到底来自模型容量、输入分辨率还是数据分布。我的方法不是直接看最终结果，而是逐步消融验证。每一阶段只改变一个变量，先锁定归一化口径，再验证分辨率，再尝试 Stage-3 解冻、FC-Pool 和 ActionKD。始终保持不变的是 Temporal Mamba、控制头、KeepState 部署协议、训练数据基准和评测环境。判断标准也不是单看碰撞率，而是结合速度效率和延迟。当前几条路线未稳定改善时，我再结合尾部风险分析，把瓶颈定位到风险状态覆盖不足。",
  },
  {
    id: "ssm-bottleneck",
    type: "ssm-bottleneck",
    kicker: "Chapter 5 Result",
    title: "消融结果把瓶颈指向风险状态覆盖，而不是简单模型容量",
    topImage: "tmp/slides/bit-defense-2026-v2/generated/fig5_19.png",
    stats: [
      ["分辨率有效", "26.3%–72.9%", "60×90 → 128×192 后，5/9/12 m/s 碰撞次数均值下降。"],
      ["解冻失败", "53%–135% ↑", "Stage-3 解冻后碰撞次数反而上升，简单增加容量不可靠。"],
    ],
    table: {
      columns: [
        { label: "路线", width: 1 },
        { label: "观察", width: 1.35 },
        { label: "结论", width: 1.65 },
      ],
      rows: [
        ["分辨率", "收益明确", "先补足空间信息密度"],
        ["解冻 / FC-Pool / ActionKD", "未稳定改善", "不是简单调容量或结构"],
        ["风险尾部", "失败集中", "转向风险状态补分布"],
      ],
    },
    footer: "在当前数据规模与训练设置下，主要瓶颈指向风险状态覆盖，而不是简单增加模型容量。",
    figures: [
      { figure: "图5.19", page: "p137", source: "主图：第5章迭代路径总览" },
      { figure: "图5.4 / 正文", page: "p112 / 第5章", source: "分辨率提升后碰撞次数下降 26.3%–72.9%" },
      { figure: "图5.5 / 正文", page: "p115 / 第5章", source: "Stage-3 解冻失败，碰撞次数增加 53%–135%" },
      { figure: "图5.6 / 图5.7", page: "p118 / p121", source: "结构/KD 失败路线与高速尾部风险" },
    ],
    speakerNotes:
      "这一页是第5章逐步消融的结果。首先，分辨率确实有效，输入从60×90提升到128×192后，5、9、12米每秒的碰撞次数均值下降26.3%到72.9%，说明空间信息密度是一个真变量。但 Stage-3 解冻反而使碰撞次数上升，说明简单增加可训练容量并不可靠。FC-Pool 和 ActionKD 也没有形成稳定收益。结合高速段尾部风险暴露，我把主要瓶颈定位为风险状态覆盖不足。这个结论自然引出下一页的方法：风险状态蒸馏与 Omega-event 低速补强。",
  },
  {
    id: "risk-method",
    type: "risk-method",
    kicker: "Chapter 5 Method",
    title: "第 5 章方法：用风险状态蒸馏修复闭环中的稀有危险状态",
    flow: [
      { title: "Student rollout", caption: "学生闭环飞行" },
      { title: "Risk window detection", caption: "检测近碰撞窗口" },
      { title: "Teacher relabeling", caption: "专家重新标注" },
      { title: "Weighted fine-tuning", caption: "加权微调学生" },
      { title: "Refined MV+Mamba", caption: "修复后的策略" },
    ],
    loss: "w_x : w_y : w_z = 0.1 : 1.0 : 1.0",
    lossCaption: "重点约束横向/竖向避障动作，而不是强行模仿前向速度。",
    omega: "Ω_t = sqrt(v_y^2 + v_z^2)",
    omegaCaption: "教师横竖向合速度峰值 ≈ 真正的转向关键帧。",
    versions: {
      columns: [
        { label: "版本", width: 0.8 },
        { label: "做法", width: 1.8 },
        { label: "作用", width: 1.4 },
      ],
      rows: [
        ["V_mid", "高速风险蒸馏", "中高速收益，低速退化"],
        ["V_fail", "低速 d_min 触发补强", "更平滑但更危险"],
        ["V_final", "教师 Omega-event 触发", "修复低速，保留高速收益"],
      ],
    },
    footer: "风险蒸馏不是全量模仿教师，而是定向修复闭环中最危险、最稀有、最缺覆盖的状态。",
    figures: [
      { figure: "图5.8 / 图5.9", page: "p125", source: "风险蒸馏迭代效果" },
      { figure: "图5.10 / 图5.11", page: "p127", source: "低速失败与 Omega-event 修复依据" },
      { figure: "正文公式", page: "第5章", source: "Weighted Huber loss 与 Omega_t 触发定义" },
    ],
    speakerNotes:
      "风险状态蒸馏和普通动作蒸馏不同。普通动作蒸馏试图在所有状态上模仿教师，但教师和学生的视觉骨干、输入分辨率不同，容易引入系统性偏差。风险状态蒸馏只关注闭环中最危险的稀有状态：学生先 rollout，系统检测近碰撞风险窗口，再由教师重新标注这些窗口内的关键动作，最后用加权 Huber 损失微调学生策略。损失中横向和竖向速度权重更高，因为这些分量更直接对应避障机动。低速阶段最初使用 d_min 触发失败，最终改用教师横竖向合速度峰值 Omega-event，定位真正的转向关键帧。",
  },
  {
    id: "distillation",
    type: "distill-evidence",
    kicker: "Chapter 5 Result",
    title: "V_mid / V_fail / V_final 验证了风险补分布与 Omega-event 的必要性",
    stages: [
      { name: "V_mid", metric: "5 m/s CR 32.50%", caption: "高速风险蒸馏带来中高速收益，但低速段开始退化。" },
      { name: "V_fail", metric: "39.50% / Jerk 0.01", caption: "d_min 低速触发让输出更平滑，却让碰撞率继续上升。" },
      { name: "V_final", metric: "0.56%", caption: "Omega-event 定位教师转向峰值，修复低速失败。" },
    ],
    formula: "Omega_t = sqrt(v_y^2 + v_z^2)",
    formulaCaption: "用教师策略横竖向合速度峰值定位真正的转向决策关键帧。",
    table: {
      columns: [
        { label: "对比", width: 1.25 },
        { label: "Jerk", width: 0.8 },
        { label: "碰撞率", width: 1 },
      ],
      rows: [
        ["V_mid → V_fail", "0.08 → 0.01", "32.50% → 39.50%"],
        ["V_mid → V_final", "0.08 → 0.05", "32.50% → 0.56%"],
      ],
    },
    bullets: [
      "风险状态蒸馏修复的是闭环中的稀有危险状态，而不是全量模仿教师。",
      "Omega-event 用动作峰值触发风险窗口，避免 d_min 在低速段过度触发。",
    ],
    footer: "第5章的突破来自“数据分布修复 + 失败模式补偿”，而不是单纯追求更平滑的输出。",
    figures: [
      { figure: "图5.8 / 图5.9", page: "p125", source: "风险蒸馏碰撞率与速度效率迭代" },
      { figure: "图5.10 / 图5.11", page: "p127", source: "低速碰撞率失败与 Jerk 失败模式" },
      { figure: "正文公式", page: "第5章", source: "Omega-event 触发流程" },
    ],
    speakerNotes:
      "这一页用结果验证上一页的方法设计。V_mid 经过高速风险蒸馏后，中高速段已经有收益，但低速风险窗口没有被覆盖，5米每秒碰撞率仍达到32.50%。随后使用最小深度 d_min 做低速补强，得到 V_fail。这个版本的 Jerk 从0.08降到0.01，看起来更平滑，但碰撞率却从32.50%升到39.50%，说明更平滑不等于更安全。最终 V_final 使用教师策略的 Omega-event 触发风险窗口，5米每秒碰撞率降到0.56%。这说明最终提升来自风险数据分布修复和失败模式补偿。下一页展示最终模型的综合性能。",
  },
  {
    id: "final-result",
    type: "final-evidence",
    kicker: "Chapter 5 Result",
    title: "MV+Mamba 最终版在 OOD 高速段实现更优安全—效率平衡",
    table: {
      columns: [
        { label: "场景 / 速度", width: 1.25 },
        { label: "ViT+Mamba", width: 1 },
        { label: "MV+Mamba", width: 1 },
        { label: "结论", width: 1.4 },
      ],
      rows: [
        ["Spheres 12 m/s", "3.01%", "1.34%", "碰撞率下降 55.5%"],
        ["Trees 7 m/s", "2.25%", "0.99%", "OOD 中速下降 56%"],
        ["Trees 9 m/s", "4.24%", "0.68%", "OOD 高速下降 84%"],
        ["Trees 12 m/s", "3.30%", "1.04%", "OOD 高速下降 68%"],
      ],
    },
    caveat: "边界：Trees 3/5 m/s 低速段仍有残余退化，后续需继续补强。",
    bullets: ["第3章约 6 ms 指网络侧单步前向；第5章 21–23 ms 是最终模型在评测口径下的推理统计。"],
    figures: [
      { figure: "表5.9 / 图5.12", page: "p130 / 第5章", source: "Spheres 12 m/s 碰撞率 3.01% → 1.34%" },
      { figure: "表5.10 / 图5.17", page: "p134 / 第5章", source: "Trees 7/9/12 m/s 碰撞率与低速 OOD 边界" },
      { figure: "图5.18 / 表5.8", page: "p135 / 第5章", source: "最终模型推理延迟 21–23 ms" },
      { figure: "图5.15 / 正文", page: "p132 / 第5章", source: "OOD 高速段 Mean Vx 提升约 40%–45%" },
    ],
    speakerNotes:
      "这一页收束第5章最终结果。表格第一行是同分布 Spheres，12米每秒碰撞率从3.01%降到1.34%，说明最终模型在高速 ID 环境中没有牺牲安全性。接下来三行是 Trees OOD 的中高速段，7、9、12米每秒分别从2.25%降到0.99%、4.24%降到0.68%、3.30%降到1.04%。右侧补充两个口径：OOD 高速段 Mean Vx 提升约40%到45%，说明不是靠降速换安全；最终模型推理延迟21到23毫秒，仍低于50毫秒闭环阈值。这里也主动说明边界：Trees 低速3和5米每秒仍有残余退化。下一页总结三项创新点。",
  },
  {
    id: "innovation-summary",
    type: "conclusion",
    kicker: "Contributions",
    title: "三项创新点回答三个核心问题",
    leftTitle: "三个回答",
    rightTitle: "对应方法链",
    footer: "第 16 页收束贡献，第 17 页单独交代边界与下一步工作。",
    conclusions: [
      "能不能建模？ViT+Mamba 验证高速时序聚合优势",
      "能不能可靠部署？Batch–Streaming 约束状态生命周期",
      "能不能继续演进？MambaVision 迁移需要风险状态补分布",
    ],
    future: [
      "第3章：策略网络 + BC / DAgger / RACS",
      "第4章：等价性定义 + 生命周期协议 + 硬防护",
      "第5章：逐步消融 + 风险蒸馏 + Omega-event",
    ],
    figures: [],
    speakerNotes:
      "全文贡献可以用三个问题来概括。第一，能不能更好地建模高速时序决策？可以，ViT+Mamba 在受控协议下相对 ViT+LSTM 降低了高速段和 OOD 段碰撞风险。第二，能不能可靠部署序列策略？可以，但前提是显式管理状态生命周期，Batch–Streaming 等价性把部署正确性变成可测试约束。第三，能不能继续向 SSM 主导的空间—时间架构演进？可以，但不能只换骨干，需要通过逐步消融定位风险状态覆盖不足，再用风险蒸馏和低速补强修复。下一页说明当前工作的局限和后续计划。",
  },
  {
    id: "limitations",
    type: "limitations",
    kicker: "Limitations",
    title: "局限与未来工作：当前结论仍需向真实、动态和形式化安全扩展",
    limits: [
      "当前实验仍以 Flightmare 仿真为主，尚未完成真实飞行验证",
      "障碍环境主要为静态场景，动态障碍和多智能体干扰尚未覆盖",
      "感知输入以单一深度模态为主，对真实传感噪声和失效模式覆盖有限",
      "RACS 与风险触发仍带有启发式成分，Trees 低速 OOD 仍有残余退化",
    ],
    future: [
      "开展 Sim-to-Real：域随机化、系统辨识、真实传感噪声建模",
      "扩展动态障碍与多模态融合：深度、惯性、事件或语义信息",
      "引入更形式化的安全约束：控制屏障函数、可达性或在线监测",
      "面向低速 OOD 建立更细粒度风险状态采样与验证协议",
    ],
    footer: "当前工作给出仿真闭环下的方法和证据，真实部署仍需要系统安全验证。",
    figures: [],
    speakerNotes:
      "当前工作的边界也需要明确说明。首先，本文结论严格限定在 Flightmare 仿真环境，还没有完成真实飞行验证。其次，当前障碍主要是静态场景，真实应用中动态障碍、多智能体干扰和复杂传感噪声还需要进一步覆盖。第三，RACS 和风险触发仍带有启发式成分，虽然工程上有效，但未来可以引入控制屏障函数、可达性分析或在线安全监测等更形式化的方法。最后，Trees 低速 OOD 仍有残余退化，后续需要更细粒度的低速风险状态采样和验证协议。下面进入 Q&A。",
  },
  {
    id: "thanks",
    type: "thanks",
    kicker: "Q & A",
    title: "谢谢各位老师！",
    subtitle: "敬请批评指正",
    image: fig11,
    logo: "Helper_manual/HelperSection/figures/BIT.jpg",
    figures: [],
    speakerNotes:
      "我的主汇报结束，谢谢各位老师的聆听，恳请各位老师批评指正。后面准备了五页备份材料，包括完整评测协议、DAgger/RACS 补充验证、状态重置消融、MambaVision 失败路线和风险蒸馏补充证据，方便在问答时展开。",
  },
  {
    id: "backup-protocol",
    type: "appendix-protocol",
    kicker: "Backup A",
    title: "Backup A · 完整评测协议与指标口径",
    table: {
      columns: [
        { label: "项目", width: 1 },
        { label: "设置 / 定义", width: 2.4 },
      ],
      rows: [
        ["平台与环境", "Flightmare；训练 Spheres；测试 Spheres / Trees；Trees 不参与训练"],
        ["速度档与重复", "3 / 5 / 7 / 9 / 12 m/s；每档 10 次重复试验"],
        ["基础指标", "Collision Rate、Collision Count、Command Jerk、Inference"],
        ["第5章补充", "Mean Vx 与 CPM，用于排除“降速换安全”的伪改进"],
      ],
    },
    notes: [
      "Command Jerk 是相邻速度指令差的 L2 均值，不是物理三阶 jerk。",
      "第3章约 6 ms 偏网络侧单步前向；第5章 21–23 ms 为最终模型评测口径下推理统计。",
    ],
    footer: "主汇报中压缩协议，本页用于回答实验公平性和指标口径追问。",
    figures: [
      { figure: "表2.4 / 指标定义", page: "第2章", source: "评测协议、指标定义、Command Jerk 计算口径" },
      { figure: "第5章指标体系", page: "第5章", source: "Mean Vx 与 CPM 补充指标" },
    ],
    speakerNotes:
      "如果老师追问实验协议或指标口径，可以用这页。需要强调 Trees 始终不参与训练，是零样本 OOD 测试。基础指标包括碰撞率、碰撞事件次数、Command Jerk 和推理延迟；第5章额外加入 Mean Vx 与 CPM，目的是避免把降速换安全误判成真实避障能力提升。",
  },
  {
    id: "backup-b",
    type: "appendix-grid5",
    kicker: "Backup B",
    title: "Backup B · DAgger / OOD / RACS 补充验证",
    images: [
      "Image/图3-8_DAgger碰撞率随速度对比.png",
      "Image/图3-9_Trees环境分布外多维指标对比.png",
      "Image/图3-10_DAgger轮次碰撞次数分布.png",
      "Image/图3-11_DAgger轮次碰撞持续时间分布.png",
      "Image/图3-3_RACS验证与基线对比_Spheres环境.png",
    ],
    labels: [
      "图3.10：DAgger 新数据只来自 Spheres，Trees 仍为零样本",
      "图3.11：Trees OOD 多维指标未退化",
      "图3.12：碰撞次数分布尾部收缩",
      "图3.13：碰撞持续时间分布同步收缩",
      "图3.14：RACS 安全—平滑权衡",
    ],
    footer: "补充说明：DAgger 解决闭环分布，RACS 解决部署平滑，二者不是同一种改进。",
    figures: [
      { figure: "图3.10", page: "p77", source: "Image/图3-8_DAgger碰撞率随速度对比.png" },
      { figure: "图3.11", page: "p77", source: "Image/图3-9_Trees环境分布外多维指标对比.png" },
      { figure: "图3.12", page: "p78", source: "Image/图3-10_DAgger轮次碰撞次数分布.png" },
      { figure: "图3.13", page: "p78", source: "Image/图3-11_DAgger轮次碰撞持续时间分布.png" },
      { figure: "图3.14", page: "p78", source: "Image/图3-3_RACS验证与基线对比_Spheres环境.png" },
    ],
    speakerNotes:
      "这页用于回答第3章补充问题。上方两张图说明 DAgger 在 ID 和 OOD 上的收益，下方两张分布图说明碰撞次数和持续时间的尾部收缩，右下图3.14用于补充 RACS 的安全—平滑权衡。",
  },
  {
    id: "backup-c",
    type: "appendix-grid4",
    kicker: "Backup C",
    title: "Backup C · 状态重置的更多消融",
    images: [
      "tmp/slides/bit-defense-2026-v2/generated/fig4_7.png",
      "tmp/slides/bit-defense-2026-v2/generated/fig4_8.png",
      "tmp/slides/bit-defense-2026-v2/generated/fig4_9.png",
      "tmp/slides/bit-defense-2026-v2/generated/fig4_10.png",
    ],
    labels: [
      "图4.7：重置频率消融（k=1 每步重置；k=∞ 等价 KeepState）",
      "图4.8：burn-in 步数消融",
      "图4.9：跨速度碰撞率，高速更暴露风险",
      "图4.10：跨速度横向漂移，高速漂移放大",
    ],
    footer: "补充说明：第4章不是单一对比实验，而是围绕 reset 频率、warmup 与跨速度做了系统消融。",
    figures: [
      { figure: "图4.7", page: "p97", source: "tmp/slides/bit-defense-2026-v2/generated/fig4_7.png" },
      { figure: "图4.8", page: "p98", source: "tmp/slides/bit-defense-2026-v2/generated/fig4_8.png" },
      { figure: "图4.9", page: "p98", source: "tmp/slides/bit-defense-2026-v2/generated/fig4_9.png" },
      { figure: "图4.10", page: "p99", source: "tmp/slides/bit-defense-2026-v2/generated/fig4_10.png" },
    ],
    speakerNotes:
      "如果老师追问第4章是否只做了 KeepState 和 ResetState 的单点对比，可以看这页。图4.7中 k=1 表示每步重置，k=∞ 可以理解为回合内持续保持状态。其余图分别补充 burn-in 和跨速度验证。",
  },
  {
    id: "backup-d",
    type: "appendix-grid5",
    kicker: "Backup D",
    title: "Backup D · MambaVision 失败路线与瓶颈定位",
    images: [
      "Image/图5-3_深度归一化口径偏移影响.png",
      "Image/图5-4_分辨率提升后碰撞与速度变化.png",
      "Image/图5-5_Stage3解冻前后安全速度权衡散点图.png",
      "Image/图5-6_不同消融阶段碰撞率分布对比.png",
      "Image/图5-7_12m每秒高速段碰撞指标箱线图.png",
    ],
    labels: [
      "图5.3：归一化口径锁定，排除输入尺度干扰",
      "图5.4：分辨率有效，碰撞次数下降 26.3%–72.9%",
      "图5.5：Stage-3 解冻失败，容量增加不等于安全",
      "图5.6：结构/KD 路线未稳定成立",
      "图5.7：高速尾部风险暴露，转向风险补分布",
    ],
    footer: "补充说明：第5章前半段的重点是逐步排除错误路线，把问题从“模型容量”定位到“风险状态覆盖”。",
    figures: [
      { figure: "图5.3", page: "p108", source: "Image/图5-3_深度归一化口径偏移影响.png" },
      { figure: "图5.4", page: "p112", source: "Image/图5-4_分辨率提升后碰撞与速度变化.png" },
      { figure: "图5.5", page: "p115", source: "Image/图5-5_Stage3解冻前后安全速度权衡散点图.png" },
      { figure: "图5.6", page: "p118", source: "Image/图5-6_不同消融阶段碰撞率分布对比.png" },
      { figure: "图5.7", page: "p121", source: "Image/图5-7_12m每秒高速段碰撞指标箱线图.png" },
    ],
    speakerNotes:
      "这页用于回答第5章是不是只做了少量替换实验。这里完整展示归一化口径锁定、分辨率验证、解冻失败、结构和知识蒸馏路线对比、高速尾部风险分析，说明第5章首先做的是系统性失败归因。",
  },
  {
    id: "backup-e",
    type: "appendix-grid4",
    kicker: "Backup E",
    title: "Backup E · 风险蒸馏与低速补强",
    images: [
      "Image/图5-8_风险蒸馏碰撞率迭代对比.png",
      "Image/图5-9_风险蒸馏速度效率迭代对比.png",
      "Image/图5-10_低速碰撞率失败对比.png",
      "Image/图5-11_低速Jerk失败对比.png",
    ],
    labels: [
      "图5.8：V_mid 高速风险蒸馏带来碰撞率收益",
      "图5.9：V_mid 速度效率未塌缩",
      "图5.10：V_fail 低速碰撞率 32.50% → 39.50%",
      "图5.11：V_fail Jerk 0.08 → 0.01，但更平滑并不更安全",
    ],
    footer: "版本定义：V_mid=高速风险蒸馏；V_fail=低速 d_min 触发补强失败；V_final=教师 Omega-event 低速修复。",
    figures: [
      { figure: "图5.8", page: "p125", source: "Image/图5-8_风险蒸馏碰撞率迭代对比.png" },
      { figure: "图5.9", page: "p125", source: "Image/图5-9_风险蒸馏速度效率迭代对比.png" },
      { figure: "图5.10", page: "p127", source: "Image/图5-10_低速碰撞率失败对比.png" },
      { figure: "图5.11", page: "p127", source: "Image/图5-11_低速Jerk失败对比.png" },
    ],
    speakerNotes:
      "这页用于回答为什么需要 Omega-event 低速补强。V_mid 是高速风险蒸馏版本，V_fail 是低速 d_min 触发补强失败版本，V_final 是教师 Omega-event 触发的最终修复版本。左上和右上展示高速收益，左下和右下展示更平滑但更撞的失败模式。",
  },
];
