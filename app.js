const D = window.DEMO_DATA;
const months = D.monthly;
const current = months[months.length - 1];
const previous = months[months.length - 2];
const priorYear = months.find(item => item.month === "2025-09");
let activePage = "intro";
let activeReport = "monthly";

const pageMeta = {
  intro: ["作品总览", "先说明为什么做、依据什么做，再进入经营分析和技术验证"],
  assumptions: ["假设与数据", "公开经营信息、Mock 业务情景、原始数据关系和指标计算原则"],
  overview: ["月度经营总览", "从销售结果到边际贡献与库存，定位抖音增长策略为什么增收不增利"],
  sku: ["销售与单品盈利", "不仅看销售规模，更看渠道与 SKU 扣除直接费用后的渠道边际贡献"],
  inventory: ["生产成本与库存", "从单位成本、库存周转和临期报损解释毛利变化"],
  expense: ["费用与预算管控", "区分直接费用与公共费用，识别预算偏差和渠道费用效率"],
  cash: ["活动现金与营运资金", "把抖音推广、低温备货和平台回款放进同一套经营现金分析"],
  report: ["专项报告与行动项", "让每一项异常都有证据、原因候选、责任人和下期复检"],
  tech: ["技术架构与代码", "输入、规则、计算、结果和修改都可检查，确保技术不是黑盒"],
};
const pageOrder = [
  { id: "intro", phase: "作品说明", step: "00 · 作品总览", eyebrow: "PROJECT OVERVIEW" },
  { id: "assumptions", phase: "作品说明", step: "01 · 假设与数据", eyebrow: "ASSUMPTIONS & SOURCE DATA" },
  { id: "overview", phase: "经营分析", step: "02 · 经营总览", eyebrow: "MONTHLY OPERATING OVERVIEW" },
  { id: "sku", phase: "经营分析", step: "03 · 销售与单品盈利", eyebrow: "PRODUCT & CHANNEL PROFITABILITY" },
  { id: "inventory", phase: "经营分析", step: "04 · 生产成本与库存", eyebrow: "PRODUCTION COST & INVENTORY" },
  { id: "expense", phase: "经营分析", step: "05 · 费用与预算管控", eyebrow: "EXPENSE & BUDGET CONTROL" },
  { id: "cash", phase: "经营分析", step: "06 · 活动现金与营运资金", eyebrow: "ACTIVITY CASH & WORKING CAPITAL" },
  { id: "report", phase: "交付与技术", step: "07 · 专项报告与行动项", eyebrow: "REPORT & ACTION TRACKING" },
  { id: "tech", phase: "交付与技术", step: "08 · 技术架构与代码", eyebrow: "VERIFIABLE TECHNOLOGY" },
];
const guideContent = {
  intro: { title: "先看公司级全局图", script: "先讲项目需要覆盖月度经营、费用、毛利和现金分析，再看悠纯公开业务结构。本作品统一为一个情景：公司用抖音推广低温酸奶，销量增长，但推广、冷链、短保报损和资金占用共同侵蚀经营质量。", tips: ["01 是项目目标，02 是公开企业与范围，03 是分析主线，04 是具体技术路线。", "50% 时效提升需要企业同范围实测。"] },
  assumptions: { title: "先情景，再数据证据", script: "本页先看供产销存＋费用＋活动现金模型和 18 份 Excel 的分类。沿边际贡献、费用、库存和现金验证为什么增收不增利，以及继续加投与备货是否可持续。", tips: ["A 类公开事实、B 类业务规则、C 类模拟数值要分清。", "公司现金与 CCC 不等于活动净现金流，抖音应收和低温库存单独下钻。"] },
  overview: { title: "先看增收不增利", script: "收入增长 6.95%，但渠道边际贡献率下降 4.47 个百分点。不要只看总销售额，要继续下钻抖音直接费用、低温备货和临期报损，验证增长策略是否真正创造利润。", tips: ["管理经营利润为负，说明渠道边际贡献不足覆盖公共费用。", "点击异常可进入对应专题页。"] },
  sku: { title: "用抖音讲透毛利与贡献", script: "抖音平均净售价 14.08 元/KG，同比 -0.93%；商品毛利率 26.95%，渠道边际贡献率却为 -11.30%。净价只是辅助因素，主要继续检查直接推广、达人、履约和渠道费用。", tips: ["净售价不与原奶采购价直接比较。", "SKU 主分析止于渠道边际贡献，不强算净利润。"] },
  inventory: { title: "备货与动销要一起讲", script: "抖音活动前低温备货偏乐观，终端动销没有同步，重点低温 SKU 临期占比 34%、报损率 3.19%。措施是按活动动销滚动补货、先到期先出和临期调拨。", tips: ["临期不等于已报损。", "补货与投放要联动复盘，不能各自调整。"] },
  expense: { title: "费用不能只看增减", script: "渠道直接费用比预算高 54.09 万元。先拆直接和公共费用，再看抖音推广、达人和低温冷链；超预算只是入口，还要复盘活动增量渠道边际贡献。", tips: ["费用增加不一定失控，减少也不一定改善。", "直接费用在利润计算中只能扣一次。"] },
  cash: { title: "把利润、备货和回款连起来", script: "公司经营现金同比下降 52.71%，CCC 升至 40.73 天，重点低温 SKU 库存增加 226.97 万元。13 周压力测试最低现金 6,659.92 万元，安全垫 584.43 万元，未发生预测缺口，但需要控制低效加投与备货。", tips: ["公司 CCC＝DIO＋DSO－DPO；抖音应收单独下钻。", "只有预测最低现金低于安全线，才称为预测资金缺口。"] },
  report: { title: "把异常变成可跟踪交付", script: "四类报告与页面使用同一指标结果。每项异常都有证据、原因候选、措施、责任人和复检，避免看板、Excel 和报告各算一套。", tips: ["50% 时效提升需要企业同范围实测。", "AI 只辅助解释，不自行生成金额。"] },
  tech: { title: "证明不是黑盒", script: "输入可查看、规则与代码可解释、结果可复核、修改可回归。重点看 SQL 防重复和 Python 分层计算，再看 13＋19 项校验与可追溯输出。", tips: ["本地作品不包装生产级平台。", "前端只展示，不另造财务口径。"] },
};

const fmt = (value, digits = 2) => Number(value).toLocaleString("zh-CN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const wan = value => fmt(value / 10000, Math.abs(value) >= 100000000 ? 0 : 2);
const pct = (value, digits = 2) => `${fmt((Math.abs(value) < 1e-9 ? 0 : value) * 100, digits)}%`;
const pp = value => `${value > 0 ? "+" : ""}${fmt(value * 100, 2)}pp`;
const signedWan = value => `${value > 0 ? "+" : ""}${wan(value)}`;
const cssClass = (value, reverse = false) => (value >= 0) !== reverse ? "positive" : "negative";
const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);

const metricLogic = window.createMetricLogic(D, { fmt, wan, pct });

function openMetricLogic(title, names) {
  const metricNames = (Array.isArray(names) ? names : [names]).filter(name => metricLogic.metrics[name]);
  if (!metricNames.length) return;
  const dialog = document.getElementById("metricDialog");
  document.getElementById("metricDialogTitle").textContent = title;
  document.getElementById("metricDialogBody").innerHTML = metricNames.map(name => {
    const item = metricLogic.metrics[name];
    return `<section class="formula-section"><h3>${escapeHtml(name)}</h3><div class="formula-label">计算公式</div><div class="formula-expression">${escapeHtml(item.formula)}</div>${item.example ? `<div class="formula-example"><span>本期代入</span><p>${escapeHtml(item.example)}</p></div>` : ""}<p class="formula-note"><b>怎么解读</b>${escapeHtml(item.note)}</p><div class="formula-source">数据来源：${escapeHtml(item.source)}</div></section>`;
  }).join("");
  if (!dialog.open) dialog.showModal();
}

function kpi(label, value, unit, foot, accent = "#a62f4b", footClass = "") {
  if (!metricLogic.metrics[label]) console.warn(`缺少指标计算逻辑：${label}`);
  return `<article class="kpi-card" style="--accent:${accent}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}<small>${unit}</small></div><div class="kpi-foot ${footClass}">${foot}</div><button type="button" class="metric-link kpi-metric-link" data-metric="${escapeHtml(label)}" aria-label="查看${escapeHtml(label)}计算逻辑">计算逻辑 <span>→</span></button></article>`;
}

function card(title, caption, body, tag = "", extraClass = "") {
  const logicButton = metricLogic.cards[title] ? `<button type="button" class="metric-link card-metric-link" data-card-metrics="${escapeHtml(title)}" aria-label="查看${escapeHtml(title)}指标口径">指标口径</button>` : "";
  return `<article class="card ${extraClass}"><div class="card-header"><div><h3 class="card-title">${title}</h3><div class="card-caption">${caption}</div></div><div class="card-tools">${logicButton}${tag}</div></div><div class="card-body">${body}</div></article>`;
}

function trendChart() {
  const w = 760, h = 260, left = 48, right = 18, top = 20, bottom = 34;
  const pw = w - left - right, ph = h - top - bottom;
  const maxRevenue = Math.max(...months.map(d => d.net_revenue)) * 1.12;
  const minMargin = Math.min(...months.map(d => d.gross_margin)) * 0.82;
  const maxMargin = Math.max(...months.map(d => d.gross_margin)) * 1.08;
  const x = i => left + i * pw / months.length + pw / months.length / 2;
  const yRevenue = value => top + ph - value / maxRevenue * ph;
  const yMargin = value => top + (maxMargin - value) / (maxMargin - minMargin) * ph;
  let svg = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="近13个月收入与毛利率趋势">`;
  for (let i = 0; i <= 4; i++) {
    const y = top + ph * i / 4;
    const value = maxRevenue * (4 - i) / 4;
    svg += `<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="#e8edf2"/><text x="${left-8}" y="${y+3}" text-anchor="end" font-size="9" fill="#8a99a7">${wan(value)}</text>`;
  }
  const barWidth = Math.min(28, pw / months.length * 0.56);
  months.forEach((d, i) => {
    const y = yRevenue(d.net_revenue), bh = top + ph - y;
    const isCurrent = d.month === current.month;
    svg += `<rect x="${x(i)-barWidth/2}" y="${y}" width="${barWidth}" height="${bh}" rx="3" fill="${isCurrent ? "#a62f4b" : "#e5c3ca"}"><title>${d.month} 净收入 ${wan(d.net_revenue)}万元</title></rect>`;
    if (i % 2 === 0 || i === months.length - 1) svg += `<text x="${x(i)}" y="${h-12}" text-anchor="middle" font-size="9" fill="#7f909f">${d.month.slice(2)}</text>`;
  });
  const points = months.map((d, i) => `${x(i)},${yMargin(d.gross_margin)}`).join(" ");
  svg += `<polyline points="${points}" fill="none" stroke="#4f7f72" stroke-width="2.5" stroke-linejoin="round"/>`;
  months.forEach((d, i) => { svg += `<circle cx="${x(i)}" cy="${yMargin(d.gross_margin)}" r="3.5" fill="#fff" stroke="#4f7f72" stroke-width="2"><title>${d.month} 毛利率 ${pct(d.gross_margin)}</title></circle>`; });
  svg += `<text x="${left}" y="12" font-size="9" fill="#8797a5">净收入（万元）</text><text x="${w-right}" y="12" text-anchor="end" font-size="9" fill="#4f7f72">毛利率 ${pct(current.gross_margin)}</text></svg>`;
  return svg;
}

function waterfallChart() {
  const directExpenses = current.total_expenses - current.public_expenses;
  const cogs = current.net_revenue - current.gross_profit;
  const steps = [
    { label: "净收入", value: current.net_revenue, type: "total" },
    { label: "销售成本", value: -cogs, type: "delta" },
    { label: "商品毛利", value: current.gross_profit, type: "subtotal" },
    { label: "直接费用", value: -directExpenses, type: "delta" },
    { label: "渠道边际贡献", value: current.contribution_2, type: "subtotal" },
    { label: "公共费用", value: -current.public_expenses, type: "delta" },
    { label: "经营利润", value: current.management_operating_profit, type: "subtotal" },
  ];
  const w = 530, h = 272, left = 14, right = 14, top = 22, bottom = 42;
  const pw = w-left-right, ph = h-top-bottom, max = current.net_revenue * 1.04;
  const y = value => top + ph - Math.max(0, value) / max * ph;
  const zero = y(0), stepWidth = pw / steps.length;
  let cumulative = 0, svg = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="利润瀑布图">`;
  svg += `<line x1="${left}" y1="${zero}" x2="${w-right}" y2="${zero}" stroke="#cdd8e2"/>`;
  steps.forEach((step, i) => {
    let start, end;
    if (step.type === "total") { start = 0; end = step.value; cumulative = step.value; }
    else if (step.type === "subtotal") { start = 0; end = step.value; cumulative = step.value; }
    else { start = cumulative; end = cumulative + step.value; cumulative = end; }
    const topY = Math.min(y(start), y(end)), height = Math.max(2, Math.abs(y(start)-y(end)));
    const color = step.type === "delta" ? "#e47b83" : step.type === "subtotal" ? "#3fa69c" : "#a62f4b";
    const x = left + i * stepWidth + 7, bw = stepWidth - 14;
    svg += `<rect x="${x}" y="${topY}" width="${bw}" height="${height}" rx="3" fill="${color}"><title>${step.label} ${signedWan(step.value)}万元</title></rect>`;
    svg += `<text x="${x+bw/2}" y="${Math.max(12, topY-5)}" text-anchor="middle" font-size="8.5" fill="${step.value < 0 ? "#d9535f" : "#40586c"}">${wan(step.value)}</text>`;
    svg += `<text x="${x+bw/2}" y="${h-22}" text-anchor="middle" font-size="9" fill="#6c8192">${step.label}</text>`;
    if (i < steps.length - 1) svg += `<line x1="${x+bw}" y1="${y(cumulative)}" x2="${x+stepWidth+7}" y2="${y(cumulative)}" stroke="#b8c5d0" stroke-dasharray="2 2"/>`;
  });
  return svg + `</svg>`;
}

function channelBars(limit = 8) {
  const rows = [...D.channels].sort((a,b) => b.net_revenue-a.net_revenue).slice(0, limit);
  const max = Math.max(...rows.map(row => row.net_revenue));
  return `<div class="channel-list">${rows.map(row => `<div class="channel-row"><span class="channel-name">${row.channel_name}</span><div class="bar-track"><div class="bar-fill" style="width:${row.net_revenue/max*100}%"></div></div><span class="channel-value ${row.contribution_2 < 0 ? "negative" : "positive"}" title="边际贡献 ${wan(row.contribution_2)}万元">${pct(row.contribution_margin_2, 1)}</span></div>`).join("")}</div>`;
}

function anomalyItems(limit = 4) {
  const targetPages = {A01:"sku", A02:"inventory", A03:"expense", A04:"cash"};
  return `<div class="anomaly-list">${D.actions.slice(0, limit).map(action => `<div class="anomaly-item" data-target="${targetPages[action["行动编号"]]}"><span class="anomaly-index">${action["行动编号"].slice(1)}</span><div><h4>${action["异常"]}</h4><p>${action["指标证据"]}</p></div><span class="anomaly-arrow">›</span></div>`).join("")}</div>`;
}

function renderOverview() {
  return `
    <div class="kpi-grid">
      ${kpi("管理净销售收入", wan(current.net_revenue), "万元", `同比 <b class="positive">+${pct(current.revenue_yoy)}</b> · 环比 ${pct(current.revenue_mom)}`, "#a62f4b")}
      ${kpi("商品毛利率", pct(current.gross_margin), "", `同比 <b class="negative">${pp(current.gross_margin_yoy_pp)}</b>`, "#4f7f72")}
      ${kpi("渠道边际贡献", wan(current.contribution_2), "万元", `渠道边际贡献率 ${pct(current.contribution_margin_2)} · 同比 <b class="negative">${pp(current.contribution_margin_yoy_pp)}</b>`, "#7758c8")}
      ${kpi("管理经营利润", wan(current.management_operating_profit), "万元", `渠道边际贡献 − 公共费用 ${wan(current.public_expenses)} 万元`, "#d9535f", "negative")}
      ${kpi("总费用率", pct(current.total_expense_rate), "", `直接费用＋公共费用`, "#c88424")}
      ${kpi("重点低温 SKU 临期占比", pct(D.inventory.low_near_ratio), "", `报损金额率 ${pct(D.inventory.low_loss_rate)} · 备货与动销核查`, "#c88424")}
    </div>
    <div class="grid two">
      ${card("收入与商品毛利率趋势", "近 13 个完整月份 · 柱：净收入 / 线：商品毛利率", trendChart(), `<div class="legend"><span><i style="background:#a62f4b"></i>净收入</span><span><i style="background:#4f7f72"></i>毛利率</span></div>`)}
      ${card("本月利润瀑布", "从净收入到管理经营利润 · 万元", waterfallChart(), `<span class="tag red">利润承压</span>`)}
    </div>
    <div class="grid two">
      ${card("渠道收入与渠道边际贡献率", "条形长度代表收入规模，右侧为渠道边际贡献率", channelBars(), `<span class="tag">规模 × 质量</span>`)}
      ${card("优先异常与下钻", "点击异常进入对应分析页面", anomalyItems(4), `<span class="tag red">4 项待核实</span>`)}
    </div>
    <div class="insight-line"><strong>本月结论：</strong>抖音推广低温酸奶带来收入同比增长 ${pct(current.revenue_yoy)}，但渠道边际贡献率下降 ${fmt(Math.abs(current.contribution_margin_yoy_pp)*100,2)} 个百分点。下一步沿直接推广与达人费用、低温备货和临期报损，验证为什么增收不增利。</div>`;
}

function skuScatter() {
  const rows = D.skus, w = 760, h = 290, left = 56, right = 20, top = 20, bottom = 42;
  const pw = w-left-right, ph = h-top-bottom;
  const maxX = Math.max(...rows.map(r => r.net_revenue))*1.1;
  const minY = Math.min(...rows.map(r => r.contribution_margin_2), 0)*1.3;
  const maxY = Math.max(...rows.map(r => r.contribution_margin_2))*1.2;
  const x = value => left + value/maxX*pw, y = value => top+(maxY-value)/(maxY-minY)*ph;
  const midX = [...rows].sort((a,b)=>a.net_revenue-b.net_revenue)[Math.floor(rows.length/2)].net_revenue;
  const colors = {"常温白奶":"#a62f4b","特种奶":"#7758c8","低温白奶":"#4f7f72","低温酸奶":"#16846b","乳饮品":"#c88424","客制化产品":"#7a8b9b"};
  let svg = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="SKU收入与渠道边际贡献率散点图">`;
  for(let i=0;i<=4;i++){const yy=top+ph*i/4, value=maxY-(maxY-minY)*i/4;svg+=`<line x1="${left}" y1="${yy}" x2="${w-right}" y2="${yy}" stroke="#e8edf2"/><text x="${left-8}" y="${yy+3}" text-anchor="end" font-size="9" fill="#8a99a7">${pct(value,0)}</text>`;}
  svg += `<line x1="${x(midX)}" y1="${top}" x2="${x(midX)}" y2="${h-bottom}" stroke="#cbd6df" stroke-dasharray="4 4"/><line x1="${left}" y1="${y(0)}" x2="${w-right}" y2="${y(0)}" stroke="#d9535f" stroke-dasharray="4 4"/>`;
  rows.forEach(row => {
    const radius = 5 + row.net_revenue/maxX*7;
    svg += `<circle cx="${x(row.net_revenue)}" cy="${y(row.contribution_margin_2)}" r="${radius}" fill="${colors[row["品类"]] || "#a62f4b"}" fill-opacity=".82" stroke="#fff" stroke-width="1.5"><title>${row["SKU名称"]}\n收入 ${wan(row.net_revenue)}万元\n渠道边际贡献率 ${pct(row.contribution_margin_2)}</title></circle>`;
    if (["SKU001","SKU003","SKU011"].includes(row.sku_id)) svg += `<text x="${x(row.net_revenue)+9}" y="${y(row.contribution_margin_2)-8}" font-size="9" fill="#52697c">${row.sku_id}</text>`;
  });
  svg += `<text x="${left}" y="${h-12}" font-size="9" fill="#8192a0">管理净销售收入（万元）→</text><text x="12" y="${top+5}" font-size="9" fill="#8192a0">渠道边际贡献率</text></svg>`;
  return svg;
}

function skuTable() {
  const rows = [...D.skus].sort((a,b) => a.contribution_2-b.contribution_2);
  return `<table class="data-table wide"><thead><tr><th>SKU / 品类</th><th>净收入</th><th>毛利率</th><th>渠道边际贡献</th><th>渠道边际贡献率</th></tr></thead><tbody>${rows.map(row => `<tr><td><strong>${row.sku_id}</strong> · ${row["SKU名称"]}<br><span class="muted">${row["品类"]} / ${row["温层"]}</span></td><td>${wan(row.net_revenue)}</td><td>${pct(row.gross_margin)}</td><td class="${row.contribution_2<0?"negative":"positive"}">${wan(row.contribution_2)}</td><td class="${row.contribution_margin_2<0?"negative":"positive"}">${pct(row.contribution_margin_2)}</td></tr>`).join("")}</tbody></table>`;
}

function channelPriceTable() {
  const rows = [...D.channelPrices].sort((a,b) => a.current_price-b.current_price);
  return `<table class="data-table wide"><thead><tr><th>渠道</th><th>本期平均净售价</th><th>去年同期</th><th>同比</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${row.channel_name}</td><td>${fmt(row.current_price)} 元/KG</td><td>${fmt(row.prior_price)} 元/KG</td><td class="${row.yoy<0?"negative":"positive"}">${pct(row.yoy)}</td></tr>`).join("")}</tbody></table>`;
}

function priceExplanation() {
  const row = D.channelPrices.find(item => item.channel_id === "DOUYIN");
  return `<div class="price-equation"><span>抖音管理净销售收入 × 10,000 ÷ 抖音有效销量 KG</span><strong>= ${fmt(row.current_price)}<small>元 / KG</small></strong><p>${wan(row.current_revenue)} 万元 × 10,000 ÷ ${fmt(row.current_effective_qty)} KG</p></div><ul class="price-points"><li><b>同比：</b>${fmt(row.prior_price)} → ${fmt(row.current_price)} 元/KG，变化 ${pct(row.yoy)}；先作为促销净价与结构信号。</li><li><b>边界：</b>不与原奶采购价直接比较；跨渠道比较还要结合产品与规格结构。</li><li><b>联动：</b>净价不是最终盈利结论，继续结合渠道边际贡献率 ${pct(D.channels.find(c=>c.channel_id==="DOUYIN").contribution_margin_2)} 和直接费用分析。</li></ul>`;
}

function renderSku() {
  const totalRevenue = sum(D.skus,"net_revenue"), totalContribution = sum(D.skus,"contribution_2");
  const negativeCount = D.skus.filter(row => row.contribution_2<0).length;
  return `<div class="kpi-grid">
    ${kpi("管理净销售收入",wan(totalRevenue),"万元","12 个代表 SKU","#a62f4b")}
    ${kpi("有效销量",fmt(current.effective_qty_kg/1000),"吨","销售数量扣除退款与无效数量","#526f8c")}
    ${kpi("抖音平均净售价",fmt(D.channelPrices.find(row=>row.channel_id==="DOUYIN").current_price),"元 / KG",`同比 ${pct(D.channelPrices.find(row=>row.channel_id==="DOUYIN").yoy)} · 评估促销净价`,"#4f7f72")}
    ${kpi("渠道边际贡献",wan(totalContribution),"万元",`公司渠道边际贡献率 ${pct(totalContribution/totalRevenue)}`,"#7758c8")}
    ${kpi("负贡献 SKU",negativeCount,"个","天山奶啤需优先核查","#d9535f")}
    ${kpi("抖音渠道边际贡献率",pct(D.channels.find(c=>c.channel_id==="DOUYIN").contribution_margin_2),"","毛利率仍为正，费用后转负","#c88424")}
  </div>
  <div class="grid two">
    ${card("SKU 规模 × 边际贡献矩阵", "X：净收入 / Y：渠道边际贡献率 / 颜色：品类", skuScatter(), `<span class="tag">四象限诊断</span>`)}
    ${card("渠道边际贡献对比", "抖音与 KA 出现负贡献，经销接近盈亏平衡", channelBars(), `<span class="tag red">费用后视角</span>`)}
  </div>
  <div class="grid price-grid">
    ${card("渠道平均净售价", "本期、去年同期与同比 · 先看渠道，再看净价与结构", channelPriceTable(), `<span class="tag">净价 × 结构</span>`)}
    ${card("平均净售价怎么计算", "公式、代入值与解读放在同一视线内", priceExplanation(), `<span class="tag green">可照着讲</span>`)}
  </div>
  ${card("SKU 盈利明细", "按渠道边际贡献 从低到高排序 · 金额单位：万元", skuTable(), `<button class="btn secondary" id="exportSku">导出 CSV</button>`)}
  <div class="insight-line"><strong>分析重点：</strong>抖音商品毛利率为 ${pct(D.channels.find(c=>c.channel_id==="DOUYIN").gross_margin)}，渠道边际贡献率却为 ${pct(D.channels.find(c=>c.channel_id==="DOUYIN").contribution_margin_2)}。问题主要发生在毛利之后，应继续核查直接推广与达人佣金，而不是简单砍掉渠道。</div>`;
}

function costStructure() {
  const rows = [{name:"直接材料",value:D.production.raw_material,color:"#a62f4b"},{name:"直接人工",value:D.production.direct_labor,color:"#4f7f72"},{name:"制造费用",value:D.production.overhead,color:"#7758c8"}];
  const total = sum(rows,"value");
  return `<div class="channel-list">${rows.map(row=>`<div class="channel-row"><span class="channel-name">${row.name}</span><div class="bar-track"><div class="bar-fill" style="width:${row.value/total*100}%;background:${row.color}"></div></div><span class="channel-value">${pct(row.value/total,1)}</span></div>`).join("")}</div><div class="insight-line">直接材料是最大成本项，采购价格变化会继续传导到单位生产成本和商品毛利。</div>`;
}

function inventoryStatus() {
  const rows = [{name:"正常库存",value:D.inventory.normal_cost,color:"#a62f4b"},{name:"临期库存",value:D.inventory.near_expiry_cost,color:"#c88424"},{name:"冻结库存",value:D.inventory.frozen_cost,color:"#d9535f"}];
  const total = sum(rows,"value");
  return `<div class="channel-list">${rows.map(row=>`<div class="channel-row"><span class="channel-name">${row.name}</span><div class="bar-track"><div class="bar-fill" style="width:${row.value/total*100}%;background:${row.color}"></div></div><span class="channel-value">${wan(row.value)} 万</span></div>`).join("")}</div><div class="insight-line"><strong>重点低温 SKU：</strong>临期占比 ${pct(D.inventory.low_near_ratio)}，报损金额率 ${pct(D.inventory.low_loss_rate)}。临期不等于已报损，但需要立即复核补货和终端周转。</div>`;
}

function renderInventory() {
  const costYoy = D.inventory.pure_unit_now/D.inventory.pure_unit_prior-1;
  return `<div class="kpi-grid">
    ${kpi("基础白奶单位生产成本",fmt(D.inventory.pure_unit_now),"元 / KG",`同比 <b class="negative">+${pct(costYoy)}</b>`,"#d9535f")}
    ${kpi("原奶采购均价",fmt(D.supply.raw_milk_price),"元 / KG",`同比 +${pct(D.supply.raw_milk_price/D.supply.raw_milk_price_prior-1)} · 次品率 ${pct(D.supply.defect_rate)}`,"#c88424")}
    ${kpi("模拟产能利用率",pct(D.supply.capacity_utilization),"",`产量 ${fmt(D.supply.total_output/1000,1)} 吨 / 月产能 ${fmt(D.supply.monthly_capacity/1000,1)} 吨`,"#526f8c")}
    ${kpi("期末库存成本",wan(current.ending_inventory),"万元",`较期初 +${wan(current.ending_inventory-current.beginning_inventory)} 万元`,"#a62f4b")}
    ${kpi("存货周转天数 DIO",fmt(current.dio,1),"天",`上年同期 ${fmt(priorYear.dio,1)} 天`,"#c88424")}
    ${kpi("重点低温 SKU 报损率",pct(D.inventory.low_loss_rate),"",`临期占比 ${pct(D.inventory.low_near_ratio)}`,"#d9535f")}
  </div>
  <div class="grid equal">
    ${card("生产成本结构", "2026 年 9 月 · 材料 / 人工 / 制造费用", costStructure(), `<span class="tag">成本驱动</span>`)}
    ${card("库存状态", "正常、临期与冻结库存 · 金额单位：万元", inventoryStatus(), `<span class="tag amber">短保风险</span>`)}
  </div>
  <div class="grid two">
    ${card("库存与现金占用", "期末库存增加会提前占用采购和生产资金", `<div class="metric-strip"><div class="mini-metric"><span>期初库存</span><strong>${wan(current.beginning_inventory)}</strong><small>万元</small></div><div class="mini-metric"><span>期末库存</span><strong>${wan(current.ending_inventory)}</strong><small>万元</small></div><div class="mini-metric"><span>库存增加</span><strong class="negative">+${wan(current.ending_inventory-current.beginning_inventory)}</strong><small>万元</small></div><div class="mini-metric"><span>本月报损</span><strong>${wan(D.inventory.spoilage_cost)}</strong><small>万元</small></div></div>`, `<span class="tag amber">资金占用</span>`)}
    ${card("处理闭环", "异常不是结论，必须进入动作与复检", `<table class="data-table wide"><tbody><tr><td>采购与成本</td><td>供应商比价、采购批量优化、复核促销净价</td></tr><tr><td>低温库存</td><td>滚动预测、先到期先出、临期调拨促销</td></tr><tr><td>复检指标</td><td>单位成本、DIO、临期占比、报损金额率</td></tr></tbody></table>`, `<span class="tag green">行动项</span>`)}
  </div>`;
}

function expenseComparison() {
  const rows = D.expenses;
  const max = Math.max(...rows.flatMap(row => [row["实际金额"],row["预算金额"]]));
  return `<div class="channel-list">${rows.map(row=>`<div style="display:grid;grid-template-columns:105px 1fr 85px;gap:10px;align-items:center"><span class="channel-name">${row["费用类型"]}</span><div><div class="bar-track" style="margin-bottom:4px"><div class="bar-fill" style="width:${row["实际金额"]/max*100}%"></div></div><div class="bar-track"><div class="bar-fill" style="width:${row["预算金额"]/max*100}%;background:#c8d4df"></div></div></div><span class="channel-value ${row["实际金额"]>row["预算金额"]?"negative":"positive"}">${row["实际金额"]>row["预算金额"]?"+":""}${wan(row["实际金额"]-row["预算金额"])}</span></div>`).join("")}</div><div class="legend" style="margin-top:14px"><span><i style="background:#4d8cf7"></i>实际</span><span><i style="background:#c8d4df"></i>预算</span><span>右侧为差异（万元）</span></div>`;
}

function publicExpenseTable() {
  return `<table class="data-table wide"><thead><tr><th>部门</th><th>实际</th><th>预算</th><th>差异</th></tr></thead><tbody>${D.publicExpenses.map(row=>`<tr><td>${row["部门"]}</td><td>${wan(row["实际金额"])}</td><td>${wan(row["预算金额"])}</td><td class="${row["实际金额"]>row["预算金额"]?"negative":"positive"}">${signedWan(row["实际金额"]-row["预算金额"])}</td></tr>`).join("")}</tbody></table>`;
}

function channelExpenseTable() {
  const rows = [...D.channelExpenseRates].sort((a,b) => b.expense_rate-a.expense_rate);
  return `<table class="data-table wide"><thead><tr><th>渠道</th><th>直接费用</th><th>净销售收入</th><th>直接费用率</th><th>预算差异</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${row.channel_name}</td><td>${wan(row.direct_expense)}</td><td>${wan(row.net_revenue)}</td><td class="${row.expense_rate>0.2?"negative":""}">${pct(row.expense_rate)}</td><td class="${row.budget_variance>0?"negative":"positive"}">${signedWan(row.budget_variance)}</td></tr>`).join("")}</tbody></table>`;
}

function renderExpense() {
  const actual = sum(D.expenses,"实际金额"), budget = sum(D.expenses,"预算金额"), publicActual = sum(D.publicExpenses,"实际金额"), publicBudget = sum(D.publicExpenses,"预算金额");
  return `<div class="kpi-grid four">
    ${kpi("总期间费用",wan(current.total_expenses),"万元",`直接 ${wan(current.total_expenses-current.public_expenses)}＋公共 ${wan(current.public_expenses)}`,"#a62f4b")}
    ${kpi("总费用率",pct(current.total_expense_rate),"","费用增长需与收入匹配","#c88424")}
    ${kpi("渠道费用预算差异",`+${wan(actual-budget)}`,"万元",`实际 ${wan(actual)} / 预算 ${wan(budget)}`,"#d9535f")}
    ${kpi("公共费用预算差异",`+${wan(publicActual-publicBudget)}`,"万元",`实际 ${wan(publicActual)} / 预算 ${wan(publicBudget)}`,"#7758c8")}
  </div>
  <div class="grid two">
    ${card("渠道直接费用：实际与预算", "抖音推广、达人及华南低温履约是主要超支来源", expenseComparison(), `<span class="tag red">超支 ${wan(actual-budget)} 万</span>`)}
    ${card("公共期间费用", "按部门汇总 · 金额单位：万元", publicExpenseTable(), `<span class="tag">不重复扣费</span>`)}
  </div>
  ${card("渠道直接费用率", "直接费用÷渠道净销售收入 · 金额单位：万元", channelExpenseTable(), `<span class="tag amber">渠道效率对比</span>`)}
  ${card("费用与预算管控纪律", "金额、费率和业务动作必须一起判断", `<div class="metric-strip"><div class="mini-metric"><span>费用金额增加</span><strong>≠ 必然失控</strong></div><div class="mini-metric"><span>费用金额减少</span><strong>≠ 必然改善</strong></div><div class="mini-metric"><span>直接费用</span><strong>进入边际贡献</strong></div><div class="mini-metric"><span>公共费用</span><strong>公司层扣除</strong></div></div><div class="insight-line">超预算只是异常入口。下一步应复盘活动增量渠道边际贡献，区分价格、销量、一次性活动与持续效率问题。</div>`, `<span class="tag green">结论 → 行动</span>`)}`;
}

function cashTrend() {
  const rows = months.slice(-8), w=760,h=250,left=52,right=18,top=18,bottom=34,pw=w-left-right,ph=h-top-bottom;
  const values = rows.flatMap(row=>[row.management_operating_profit,row.operating_net_cash]);
  const min=Math.min(...values)*1.25,max=Math.max(...values)*1.15,range=max-min;
  const x=i=>left+i*pw/(rows.length-1),y=value=>top+(max-value)/range*ph;
  let svg=`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="管理经营利润与经营现金对比">`;
  for(let i=0;i<=4;i++){const yy=top+ph*i/4,value=max-range*i/4;svg+=`<line x1="${left}" y1="${yy}" x2="${w-right}" y2="${yy}" stroke="#e8edf2"/><text x="${left-8}" y="${yy+3}" text-anchor="end" font-size="9" fill="#8a99a7">${wan(value)}</text>`;}
  const series=[{key:"management_operating_profit",name:"管理经营利润",color:"#7758c8"},{key:"operating_net_cash",name:"经营现金净流入",color:"#4f7f72"}];
  series.forEach(s=>{const points=rows.map((row,i)=>`${x(i)},${y(row[s.key])}`).join(" ");svg+=`<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`;rows.forEach((row,i)=>{svg+=`<circle cx="${x(i)}" cy="${y(row[s.key])}" r="3" fill="#fff" stroke="${s.color}" stroke-width="2"><title>${row.month} ${s.name} ${wan(row[s.key])}万元</title></circle>`;});});
  rows.forEach((row,i)=>{if(i%2===0||i===rows.length-1)svg+=`<text x="${x(i)}" y="${h-12}" text-anchor="middle" font-size="9" fill="#8192a0">${row.month.slice(2)}</text>`;});
  return svg+`</svg>`;
}

function agingBars(channelName = "") {
  const rows = [...D.receivables].filter(row => !channelName || row.channel_name === channelName).sort((a,b)=>b["期末余额"]-a["期末余额"]);
  return `<div class="channel-list">${rows.map(row=>{const total=row["期末余额"];return `<div style="display:grid;grid-template-columns:75px 1fr 60px;gap:10px;align-items:center"><span class="channel-name">${row.channel_name}</span><div style="display:flex;height:11px;border-radius:5px;overflow:hidden;background:#edf2f6"><i style="width:${row["未到期金额"]/total*100}%;background:#72a2ef" title="未到期"></i><i style="width:${row["逾期1至30天"]/total*100}%;background:#e6b65c" title="逾期1-30天"></i><i style="width:${row["逾期31至60天"]/total*100}%;background:#dc8655" title="逾期31-60天"></i><i style="width:${row["逾期60天以上"]/total*100}%;background:#d9535f" title="逾期60天以上"></i></div><span class="channel-value">${wan(total)}</span></div>`;}).join("")}</div><div class="legend" style="margin-top:14px"><span><i style="background:#72a2ef"></i>未到期</span><span><i style="background:#e6b65c"></i>1–30</span><span><i style="background:#dc8655"></i>31–60</span><span><i style="background:#d9535f"></i>60+</span></div>`;
}

function forecastChart() {
  const scenarios = [...new Set(D.forecast.map(row=>row["情景"]))],w=760,h=245,left=52,right=18,top=18,bottom=32,pw=w-left-right,ph=h-top-bottom;
  const values=D.forecast.flatMap(row=>[row["期末现金"],row["安全资金线"]]),min=Math.min(...values)*.9,max=Math.max(...values)*1.03;
  const x=i=>left+i*pw/12,y=value=>top+(max-value)/(max-min)*ph;
  let svg=`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="13周现金预测">`;
  for(let i=0;i<=3;i++){const yy=top+ph*i/3,value=max-(max-min)*i/3;svg+=`<line x1="${left}" y1="${yy}" x2="${w-right}" y2="${yy}" stroke="#e8edf2"/><text x="${left-8}" y="${yy+3}" text-anchor="end" font-size="9" fill="#8a99a7">${wan(value)}</text>`;}
  const safety=D.forecast[0]["安全资金线"];svg+=`<line x1="${left}" y1="${y(safety)}" x2="${w-right}" y2="${y(safety)}" stroke="#d9535f" stroke-dasharray="5 4"/><text x="${w-right}" y="${y(safety)-6}" text-anchor="end" font-size="9" fill="#d9535f">安全资金线</text>`;
  const colors=["#4f7f72","#c88424"];
  scenarios.forEach((scenario,index)=>{const rows=D.forecast.filter(row=>row["情景"]===scenario).sort((a,b)=>a["周序号"]-b["周序号"]);const points=rows.map((row,i)=>`${x(i)},${y(row["期末现金"])}`).join(" ");svg+=`<polyline points="${points}" fill="none" stroke="${colors[index]}" stroke-width="2.5"/>`;rows.forEach((row,i)=>{svg+=`<circle cx="${x(i)}" cy="${y(row["期末现金"])}" r="2.7" fill="${colors[index]}"><title>${scenario} 第${row["周序号"]}周 ${wan(row["期末现金"])}万元</title></circle>`;});});
  for(let i=0;i<13;i+=2)svg+=`<text x="${x(i)}" y="${h-10}" text-anchor="middle" font-size="9" fill="#8192a0">W${i+1}</text>`;
  return svg+`</svg>`;
}

function renderCash() {
  const cashYoy=current.operating_net_cash/priorYear.operating_net_cash-1;
  const douyinAr=D.receivables.find(row=>row.channel_name==="抖音电商");
  const pressure=D.forecast.filter(row=>row["情景"]==="活动加投与备货压力情景");
  const minPressureRow=pressure.reduce((min,row)=>row["期末现金"]<min["期末现金"]?row:min,pressure[0]);
  const minPressure=minPressureRow["期末现金"],safetyLine=pressure[0]["安全资金线"],pressureBuffer=minPressure-safetyLine;
  const lowInventoryChange=D.inventory.low_ending_cost-D.inventory.low_beginning_cost;
  const pressureConclusion=pressureBuffer>=0?`未跌破安全线，安全垫收窄至 ${wan(pressureBuffer)} 万元`:`低于安全线 ${wan(Math.abs(pressureBuffer))} 万元，出现预测资金缺口`;
  return `<div class="kpi-grid">
    ${kpi("销售回款",wan(current.sales_receipts),"万元","公司管理口径 · 含平台结算回款","#a62f4b")}
    ${kpi("经营现金净流入",wan(current.operating_net_cash),"万元",`公司管理口径 · 同比 <b class="negative">${pct(cashYoy)}</b>`,"#4f7f72")}
    ${kpi("现金转换周期 CCC",fmt(current.ccc,1),"天",`公司整体 · 上年同期 ${fmt(priorYear.ccc,1)} 天`,"#c88424")}
    ${kpi("重点低温 SKU 库存占用",wan(D.inventory.low_ending_cost),"万元",`SKU006/007 · 较期初 +${wan(lowInventoryChange)} 万元`,"#c88424")}
    ${kpi("抖音应收余额",wan(douyinAr["期末余额"]),"万元",`渠道模拟 DSO ${fmt(douyinAr["模拟周转天数"],0)} 天`,"#526f8c")}
    ${kpi("期末可用资金",wan(current.ending_cash),"万元",`W${minPressureRow["周序号"]} 压力最低 ${wan(minPressure)} / 安全线 ${wan(safetyLine)} 万元`,"#16846b")}
  </div>
  <div class="grid two">
    ${card("管理经营利润 vs 经营现金", "近 8 个月 · 公司管理口径，观察活动背景下的利润与收付差异", cashTrend(), `<div class="legend"><span><i style="background:#7758c8"></i>经营利润</span><span><i style="background:#4f7f72"></i>经营现金</span></div>`)}
    ${card("活动营运资金拆解", "公司 DIO＋DSO－DPO＝CCC，低温库存与抖音应收单独下钻", `<div class="metric-strip"><div class="mini-metric"><span>DIO 库存天数</span><strong>${fmt(current.dio,1)}</strong><small>天</small></div><div class="mini-metric"><span>DSO 应收天数</span><strong>${fmt(current.dso,1)}</strong><small>天</small></div><div class="mini-metric"><span>DPO 应付天数</span><strong>${fmt(current.dpo,1)}</strong><small>天</small></div><div class="mini-metric"><span>CCC 转换周期</span><strong class="negative">${fmt(current.ccc,1)}</strong><small>天</small></div></div><div class="insight-line"><strong>活动资金占用：</strong>公司应收增加 ${wan(current.ending_ar-current.beginning_ar)} 万元，重点低温 SKU 库存增加 ${wan(lowInventoryChange)} 万元。推广、备货和回款节奏必须联动，而不能只看销售增长。</div>`, `<span class="tag amber">备货与回款</span>`)}
  </div>
  <div class="grid two">
    ${card("抖音应收账龄", "平台应收未到期与逾期结构 · 金额单位：万元", agingBars("抖音电商"), `<span class="tag red">回款核查</span>`)}
    ${card("未来 13 周活动现金预测", "基准按近 3 个月收付；压力情景额外增支用于极限测试，不是建议预算", forecastChart()+`<div class="insight-line"><strong>压力结果：</strong>W${minPressureRow["周序号"]} 最低现金 ${wan(minPressure)} 万元，安全线 ${wan(safetyLine)} 万元；${pressureConclusion}。</div>`, `<div class="legend"><span><i style="background:#4f7f72"></i>活动基准</span><span><i style="background:#c88424"></i>加投与备货压力</span></div>`)}
  </div>
  ${card("活动现金行动与复检", "把预测转成投放、补货、回款和付款安排", `<div class="metric-strip"><div class="mini-metric"><span>投放与补货</span><strong>按活动贡献和现金安全线联动</strong></div><div class="mini-metric"><span>库存去化</span><strong>先到期先出＋临期调拨</strong></div><div class="mini-metric"><span>回款与付款</span><strong>平台对账＋供应商付款错峰</strong></div><div class="mini-metric"><span>复检指标</span><strong>CCC、经营现金、预测最低现金</strong></div></div><div class="insight-line"><strong>决策闭环：</strong>当前压力测试${pressureConclusion}。应控制低效加投、加快临期库存去化并协调平台回款与供应商付款；若后续滚动预测低于安全线，则暂停新增低效投入。</div>`, `<span class="tag green">可执行措施</span>`)}
  <div class="insight-line"><strong>口径说明：</strong>销售回款、经营现金和 CCC 是公司管理口径；重点低温 SKU 指 SKU006/007，抖音应收单独列示，不能把公司总额当成活动净现金流。本页不替代法定现金流量表。</div>`;
}

function reportContent(type) {
  const douyin=D.channels.find(row=>row.channel_id==="DOUYIN");
  const pressure=D.forecast.filter(row=>row["情景"]==="活动加投与备货压力情景");
  const minPressure=Math.min(...pressure.map(row=>row["期末现金"])),safetyLine=pressure[0]["安全资金线"];
  const forecastResult=minPressure>=safetyLine?`压力测试最低现金 ${wan(minPressure)} 万元，高于安全线 ${wan(safetyLine)} 万元，未发生预测资金缺口`:`压力测试最低现金 ${wan(minPressure)} 万元，低于安全线 ${wan(safetyLine)} 万元，需控制资金缺口`;
  const common={
    monthly:{title:"2026 年 9 月月度经营分析报告",subtitle:"月度经营 · 管理口径 · Mock 数据",conclusion:`本月净销售收入 ${wan(current.net_revenue)} 万元，同比增长 ${pct(current.revenue_yoy)}；渠道边际贡献 ${wan(current.contribution_2)} 万元，渠道边际贡献率同比下降 ${fmt(Math.abs(current.contribution_margin_yoy_pp)*100,2)} 个百分点。抖音推广低温酸奶带来增长，但推广、冷链和短保报损共同侵蚀渠道边际贡献。`,action:"按 SKU 和活动设置投放利润闸门，联动调整低温补货与临期处置，下期复检渠道边际贡献率、费用率和报损。"},
    profit:{title:"单品与渠道盈利专项报告",subtitle:"毛利与边际贡献 · 管理口径 · Mock 数据",conclusion:`抖音商品毛利率为 ${pct(douyin.gross_margin)}，渠道边际贡献率为 ${pct(douyin.contribution_margin_2)}；天山奶啤边际贡献为负。说明仅看收入和商品毛利会高估渠道与产品表现。`,action:"按 SKU 和投放活动复核直接推广、达人佣金与履约费用，暂停持续负贡献投放。"},
    expense:{title:"费用专项分析报告",subtitle:"实际与预算 · 直接与公共 · Mock 数据",conclusion:`渠道直接费用实际 ${wan(sum(D.expenses,"实际金额"))} 万元，预算 ${wan(sum(D.expenses,"预算金额"))} 万元，超支 ${wan(sum(D.expenses,"实际金额")-sum(D.expenses,"预算金额"))} 万元；公共费用也高于预算。`,action:"拆解抖音推广、达人和低温冷链费用，复盘活动增量渠道边际贡献并联动调整投放与补货预算。"},
    cash:{title:"活动现金与营运资金专项报告",subtitle:"公司资金观察＋活动下钻 · 非法律报表现金流 · Mock 数据",conclusion:`公司经营现金净流入 ${wan(current.operating_net_cash)} 万元，同比下降 ${pct(1-current.operating_net_cash/priorYear.operating_net_cash)}；公司应收增加 ${wan(current.ending_ar-current.beginning_ar)} 万元，重点低温 SKU 库存增加 ${wan(D.inventory.low_ending_cost-D.inventory.low_beginning_cost)} 万元，公司 CCC 为 ${fmt(current.ccc,1)} 天。${forecastResult}。`,action:"控制低效加投，推动低温库存去化，协调平台回款与供应商付款错峰；滚动复检经营现金、CCC、预测最低现金与安全垫。"},
  };
  return common[type];
}

function renderReport() {
  const report=reportContent(activeReport);
  const tabs=[["monthly","月度经营"],["profit","单品盈利"],["expense","费用专项"],["cash","活动现金"]];
  return `<div class="report-tabs">${tabs.map(([id,label])=>`<button class="report-tab ${id===activeReport?"active":""}" data-report="${id}">${label}</button>`).join("")}<button class="btn secondary" id="downloadReport" style="margin-left:auto">下载 Markdown</button></div>
  <div class="grid two">
    <article class="card"><div class="report-document"><h2>${report.title}</h2><div class="report-meta">${report.subtitle} ｜ 数据版本 MOCK-2026.09 ｜ 待财务复核</div><h3>一、核心结论</h3><p>${report.conclusion}</p><h3>二、指标证据 <span class="muted">（点击指标名称看计算逻辑）</span></h3><table class="data-table wide"><tbody><tr><td><button class="table-metric" data-metric="管理净销售收入">管理净销售收入</button></td><td>${wan(current.net_revenue)} 万元</td><td>同比 ${pct(current.revenue_yoy)}</td></tr><tr><td><button class="table-metric" data-metric="渠道边际贡献">渠道边际贡献</button></td><td>${wan(current.contribution_2)} 万元</td><td>渠道边际贡献率 ${pct(current.contribution_margin_2)}</td></tr><tr><td><button class="table-metric" data-metric="管理经营利润">管理经营利润</button></td><td class="negative">${wan(current.management_operating_profit)} 万元</td><td>公共费用 ${wan(current.public_expenses)} 万元</td></tr><tr><td><button class="table-metric" data-metric="经营现金净流入">经营现金净流入</button></td><td>${wan(current.operating_net_cash)} 万元</td><td>CCC ${fmt(current.ccc,1)} 天</td></tr><tr><td><button class="table-metric" data-metric="重点低温 SKU 临期占比">重点低温 SKU 临期占比</button></td><td>${pct(D.inventory.low_near_ratio)}</td><td>报损率 ${pct(D.inventory.low_loss_rate)}</td></tr></tbody></table><h3>三、原因候选与待核实事项</h3><p>抖音推广与达人费用、低温备货和临期报损是本期优先核查项，需验证增长策略是否真正创造渠道边际贡献。以上为 Mock 预设原因候选，真实结论需经业务与财务共同验证。</p><h3>四、建议动作</h3><p>${report.action}</p><div class="report-callout"><strong>复核声明：</strong>所有金额来自同一指标层；本报告不替代法定财务报表，不包含悠纯真实经营结论。</div></div></article>
    <div>${card("行动项与复检", "每项异常均需责任人和下期验证", `<div class="action-grid">${D.actions.map(action=>`<div class="action-card"><div class="action-head"><strong>${action["行动编号"]} · ${action["异常"]}</strong><span class="tag amber">待核实</span></div><p><b>证据：</b>${action["指标证据"]}</p><p><b>措施：</b>${action["措施"]}</p><div class="action-foot"><span>${action["责任角色"]}</span><span>${action["建议完成日期"]}</span></div></div>`).join("")}</div>`, `<span class="tag green">闭环管理</span>`)}</div>
  </div>`;
}

function renderIntro() {
  return `<section class="hero"><p class="eyebrow">COMPANY-LEVEL FINANCE BP · INDEPENDENT RESEARCH PROJECT</p><h2>悠纯公司级<em>供产销存＋费用＋活动现金</em><br>经营分析 BI</h2><p>这是一个基于悠纯公开业务资料的独立研究型 BI 作品。企业业务结构来自公开经营信息，经营数值为 Mock。作品围绕“抖音推广低温酸奶”这一增长情景，把采购、生产、库存、销售、费用和活动资金放在同一个公司级经营分析模型中。</p><div class="hero-meta"><span>公开企业信息</span><span>供产销存分析</span><span>费用与预算管控</span><span>低温库存与报损</span><span>活动现金与安全垫</span><span>标准化 BI＋专项报告</span></div></section>
  <div class="section-intro"><h2>01 / 项目背景：为什么做这套经营分析</h2><p>目标不是简单整理报表，而是把月度经营、毛利、费用和现金流分析做成标准、及时、可复核的经营交付。</p></div>
  <div class="callout"><b>项目目标：</b>围绕月度经营、毛利、费用、库存和活动现金建立统一分析视图，让销售增长能够继续追溯到渠道贡献、短保库存和现金占用，并形成可执行的经营措施。</div>
  <div class="scenario-grid" style="margin-top:13px">
    <div class="scenario-card"><div class="step-no">月度经营</div><h3>本月结果和异常是什么</h3><p>统一收入、毛利、渠道边际贡献和同比/环比，先定位增收不增利的问题。</p></div>
    <div class="scenario-card"><div class="step-no">费用与毛利</div><h3>哪些渠道和 SKU 真正赚钱</h3><p>不仅看收入与商品毛利，还看直接费用后的边际贡献和预算差异。</p></div>
    <div class="scenario-card"><div class="step-no">低温库存</div><h3>备货是否与动销匹配</h3><p>通过临期、报损、DIO 和库存结构解释增长策略的库存代价。</p></div>
    <div class="scenario-card"><div class="step-no">标准交付</div><h3>怎样每月复用并缩短工时</h3><p>同一指标结果驱动看板、导出和专项报告；50% 需企业同范围实测。</p></div>
  </div>
  <div class="section-intro" style="margin-top:20px"><h2>02 / 业务与范围：悠纯公开经营情况与作品边界</h2><p>以下企业事实来自公开资料，用于设计业务结构，不用来推断真实财务结果。</p></div>
  <table class="data-table wide"><thead><tr><th>公开经营维度</th><th>公开信息</th><th>对 BI 设计的影响</th></tr></thead><tbody>
    <tr><td>公司与品牌</td><td>2016 年成立、总部位于上海，拥有“悠纯”“认养”品牌</td><td>设置公司总部、品牌和自有产品维度</td></tr>
    <tr><td>产品</td><td>纯牛奶、特种奶、0 添加酸奶等 60 多个品种，常低温并存</td><td>按品类、温层、SKU、保质期和报损分析</td></tr>
    <tr><td>生产与 OEM</td><td>官网列出贵阳修文、无锡、射阳生产基地，并提供多品类 OEM 服务</td><td>分析单位生产成本、产能、库存和 OEM 账期</td></tr>
    <tr><td>渠道与区域</td><td>线下商超、经销、平台电商、社区电商、私域并存，覆盖 20 多个省市</td><td>按区域、渠道和客户类型比较净价、渠道边际贡献和回款</td></tr>
    <tr><td>国际与新基地</td><td>官网有国际业务；金昌基地 2026 年 10 月公开投产</td><td>国际仅小额模拟；金昌仅作 2026Q4 独立情景</td></tr>
  </tbody></table>
  <div class="grid two" style="margin-top:15px">
    <div class="card"><div class="card-body"><h3 style="margin-top:0">本作品范围</h3><p>全公司月度经营、单品盈利、生产成本与库存、费用、现金、专项报告和技术验证；抖音只是其中一个渠道。</p></div></div>
    <div class="card"><div class="card-body"><h3 style="margin-top:0">明确不做</h3><p>不做消费者订单级对账、自动凭证、法定合并报表或完整 ERP；不把 Mock 结论当成悠纯真实经营结论。</p></div></div>
  </div>
  <div class="section-intro" style="margin-top:20px"><h2>03 / 分析主线：供产销存＋费用＋活动现金</h2><p>沿“抖音推广低温酸奶”情景，先看销售增长，再看直接费用和短保库存怎样侵蚀渠道边际贡献，最后检验资金占用是否支持继续加投与备货。</p></div>
  <div class="pipeline"><div class="pipeline-item"><strong>供 · 采购</strong><span>采购价格/供应商/应付</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>产 · 生产</strong><span>材料/人工/制造费用</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>存 · 库存</strong><span>周转/临期/报损</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>销 · 销售</strong><span>区域/渠道/SKU</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>费用</strong><span>渠道边际贡献/预算</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>活动现金</strong><span>回款/库存/CCC/预测</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>报告与行动</strong><span>证据/措施/复检</span></div></div>
  <div class="insight-line"><strong>阅读顺序：</strong>经营总览发现增收不增利 → 单品与渠道定位 → 成本库存和费用解释 → 活动现金检验 → 专项报告跟踪措施 → 技术验证计算过程。</div>
  <div class="section-intro" style="margin-top:20px"><h2>04 / 技术验证：具体实现路线与检查点</h2><p>不是只写“用了 Python 和 SQL”，而是说明数据在哪里、如何计算、怎样防错。</p></div>
  <table class="data-table wide"><thead><tr><th>技术层</th><th>具体实现</th><th>验证与控制</th></tr></thead><tbody>
    <tr><td>Excel 原始层</td><td>18 个 Mock 工作簿，按销售批次、生产批次和业务键连接</td><td>文件、字段、粒度、MOCK 标识和行数可检查</td></tr>
    <tr><td>Python / pandas</td><td>生成数据、计算净收入、销售成本、毛利、边际贡献和营运指标</td><td>固定规则可复现；零分母返回空；金标准手算比对</td></tr>
    <tr><td>SQLite / SQL</td><td>费用先按销售批次聚合，再连接销售；SQL 视图统一汇总</td><td>防止一对多连接放大收入；检查连接前后控制总额</td></tr>
    <tr><td>Streamlit / Plotly</td><td>00—08 页面、筛选、图表、明细和专项报告</td><td>页面、导出和报告共用指标结果，不另造口径</td></tr>
    <tr><td>质量与回归</td><td>生成器＋独立 reopen Excel 校验</td><td>13 项＋19 项通过；修改规则后重新运行</td></tr>
  </tbody></table>
  <div class="insight-line"><strong>公开来源：</strong><a href="https://www.youchunruye.com/about-us/" target="_blank">公司介绍</a> · <a href="https://www.youchunruye.com/products/" target="_blank">产品中心</a> · <a href="https://www.youchunruye.com/oem/" target="_blank">代工生产</a> · <a href="https://gansu.gansudaily.com.cn/system/2026/10/24/031449247.shtml" target="_blank">金昌投产报道</a></div>`;
}

function renderAssumptions() {
  return `<section class="section-intro"><h2>分析模型：供产销存＋费用＋活动现金</h2><p>围绕“抖音推广低温酸奶”情景，用同一批业务事实回答“成本如何形成、产品如何销售、直接费用如何侵蚀渠道边际贡献、短保库存和平台回款怎样进一步影响现金”。这是管理分析模型，不替代法定合并报表。</p></section>
  <table class="data-table wide"><thead><tr><th>模型模块</th><th>原始业务事实</th><th>核心指标</th><th>经营问题</th></tr></thead><tbody>
    <tr><td><b>供 · 采购供应</b></td><td>原奶、包装、辅料采购价格与供应商账期</td><td>采购单价、次品率、DPO</td><td>采购变化怎样影响成本与付款</td></tr>
    <tr><td><b>产 · 生产成本</b></td><td>材料、直接人工、制造费用、生产批次与合格产量</td><td>单位生产成本、成本结构、产能利用率</td><td>毛利为什么被生产成本挤压</td></tr>
    <tr><td><b>存 · 库存批次</b></td><td>期初、生产入库、销售出库、报损、期末和剩余保质期</td><td>DIO、临期占比、报损金额率</td><td>低温备货是否与终端动销匹配</td></tr>
    <tr><td><b>销 · 销售经营</b></td><td>区域、渠道、SKU 的收入、折让、退款、销量和出库成本</td><td>净收入、有效销量、渠道平均净售价、毛利、渠道边际贡献</td><td>哪些渠道和产品真正赚钱</td></tr>
    <tr><td><b>费用 · 直接＋公共</b></td><td>履约、平台、推广、达人及公共部门费用与预算</td><td>费用率、预算差异、渠道直接费用率</td><td>利润在哪一层被费用侵蚀</td></tr>
    <tr><td><b>资金 · 公司＋活动下钻</b></td><td>应收应付、现金流水、抖音应收、重点低温库存与周预测</td><td>经营现金、CCC、安全垫</td><td>加投与备货的现金是否可持续</td></tr>
  </tbody></table>
  <div class="insight-line"><strong>两种顺序不冲突：</strong>模型按业务流“供→产→存→销→费用→资金”理解；页面按经营诊断顺序“总览→销售→成本库存→费用→活动现金→报告→技术”展开，先发现结果，再追查原因并形成决策闭环。</div>
  <div class="scenario-grid" style="margin-top:13px">
    <div class="scenario-card"><div class="step-no">A / 公开事实</div><h3>业务结构</h3><p>品牌、代表产品、渠道类型和生产基地，保留公开来源。</p></div>
    <div class="scenario-card"><div class="step-no">B / 业务规则</div><h3>Mock 生成规则</h3><p>低温短保、渠道价差、OEM 账期、新厂爬坡。</p></div>
    <div class="scenario-card"><div class="step-no">C / 模拟数值</div><h3>经营结果</h3><p>收入、成本、费用、利润、库存和现金，全部标记 MOCK。</p></div>
    <div class="scenario-card"><div class="step-no">默认边界</div><h3>33 个月 · 12 SKU · 8 渠道</h3><p>6 个国内区域、3 个既有基地；金昌只进入 Q4 独立情景。</p></div>
  </div>
  <div class="section-intro" style="margin-top:20px"><h2>18 份原始 Excel：每类数据为什么存在</h2><p>每份文件都有明确粒度、业务键和指标用途，不是为页面单独编一套结果表。</p></div>
  <table class="data-table wide"><thead><tr><th>分类</th><th>数量</th><th>文件</th><th>支持的分析</th></tr></thead><tbody>
    <tr><td>主数据</td><td>3</td><td>D_产品、D_渠道区域客户、D_工厂供应商</td><td>品牌、温层、保质期、客户、工厂和账期</td></tr>
    <tr><td>供应与生产</td><td>2</td><td>F_采购订单、F_原材料出库及生产成本宽表</td><td>采购价格、材料人工制造费用、单位生产成本</td></tr>
    <tr><td>销售与履约</td><td>3</td><td>F_销售订单汇总、F_产成品销售出库、F_售后退款</td><td>净收入、销量、销售成本、退款与退货冲回</td></tr>
    <tr><td>库存</td><td>1</td><td>F_产成品库存批次</td><td>库存勾稽、DIO、临期与报损</td></tr>
    <tr><td>费用</td><td>2</td><td>F_渠道费用、F_期间费用与预算</td><td>边际贡献、直接与公共费用、预算差异</td></tr>
    <tr><td>资金</td><td>3</td><td>F_应收应付核销、F_银行现金流水、F_现金流预测</td><td>收付、账龄、CCC 和 13 周预测</td></tr>
    <tr><td>情景与行动</td><td>2</td><td>F_金昌投产情景、F_经营行动项</td><td>新厂独立情景、异常措施与复检</td></tr>
    <tr><td>说明与结果</td><td>2</td><td>00_数据字典与分析地图、99_指标结果与勾稽校验</td><td>字段公式说明、指标结果和自动校验证据</td></tr>
  </tbody></table>
  <div class="insight-line"><strong>关键连接：</strong>销售汇总批次号连接销售、出库、售后和渠道费用；生产批次号连接生产成本与库存；客户/供应商连接应收应付。销售一行是月度财务汇总，不是消费者订单。</div>
  <div class="section-intro" style="margin-top:20px"><h2>一个情景怎样贯穿 BI 监控与异常行动</h2><p>假设 2026 年 9 月公司用抖音推广低温酸奶，活动带来收入增长，同时直接投放、达人、冷链和临期报损增加。BI 要验证的不只是“增长是否创造渠道边际贡献”，还要看“应收和备货占用是否支持继续投入”。</p></div>
  <table class="data-table wide"><thead><tr><th>情景环节</th><th>BI 监控指标</th><th>发现的异常</th><th>措施与复检</th></tr></thead><tbody>
    <tr><td>抖音推广带来收入增长</td><td>渠道平均净售价、渠道边际贡献率、直接费用和预算差异</td><td>抖音渠道边际贡献率 −11.30%；渠道费用超预算 54.09 万元</td><td>按 SKU/活动设投放利润闸门，复检渠道边际贡献率</td></tr>
    <tr><td>活动前低温备货与动销不匹配</td><td>DIO、临期占比、报损率、重点低温库存增加</td><td>临期占比 34.00%；报损率 3.19%；重点低温库存增加 226.97 万元</td><td>按活动动销滚动补货、先到期先出、临期调拨与去化</td></tr>
    <tr><td>应收与备货占用资金</td><td>公司经营现金、CCC、抖音应收、预测最低现金与安全垫</td><td>经营现金同比 −52.71%；CCC 40.73 天；压力安全垫收窄至 584.43 万元</td><td>控制低效加投、去化与回款付款错峰；滚动复检现金和安全垫</td></tr>
  </tbody></table>
  <div class="grid two" style="margin-top:16px">
    ${card("指标手算样例", "从原始字段到渠道边际贡献 · 万元", `<table class="data-table wide"><tbody><tr><td>净销售收入</td><td>100 − 3 − 2</td><td><b>95</b></td></tr><tr><td>销售成本</td><td>62 − 1</td><td><b>61</b></td></tr><tr><td>商品毛利</td><td>95 − 61</td><td><b>34</b></td></tr><tr><td>渠道边际贡献</td><td>34 − 4 − 3 − 1 − 5 − 2</td><td><b>19</b></td></tr></tbody></table><div class="insight-line"><b>公司层：</b>渠道边际贡献 − 公共期间费用＝管理经营利润。公司毛利率必须用总毛利÷总收入。</div>`, `<span class="tag green">公式可解释</span>`)}
    ${card("BI 如何支持分析", "不是只展示结果，而是形成处理闭环", `<ol class="list-clean" style="padding-left:18px"><li><b>监控：</b>按月份、区域、渠道、SKU 和工厂计算指标</li><li><b>发现：</b>识别同比、环比、预算和结构异常</li><li><b>下钻：</b>回到采购、生产、库存、费用和资金证据</li><li><b>行动：</b>措施、责任人、期限和复检指标进入报告</li></ol>`, `<span class="tag">业务闭环</span>`)}
  </div>`;
}

function renderTech() {
  return `<section class="section-intro"><h2>从业务规则到页面结果，每一层都可验证</h2><p>当前是 HTML＋JavaScript 交互原型；目标技术路线为 Python/pandas＋SQLite＋Streamlit＋Plotly。Mock 数据、指标结果和 13＋19 项校验已完成。</p></section>
  <div class="callout amber"><b>交付状态：</b>当前 HTML 原型用于评审视觉、指标和讲解路径；后续按技术开发文档转为 Streamlit＋SQLite，不把设计原型说成已运行的生产应用。</div>
  <div class="pipeline"><div class="pipeline-item"><strong>Python / pandas</strong><span>Mock 生成与确定性计算</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>SQLite / SQL</strong><span>筛选、连接和分组汇总</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>统一指标层</strong><span>页面/导出/报告共用</span></div><div class="pipeline-arrow">→</div><div class="pipeline-item"><strong>Streamlit / Plotly</strong><span>经营分析与专项报告</span></div></div>
  <div class="control-list">
    <div class="control-item"><strong>01 · 输入可查看</strong><span>公开依据、A/B/C 假设、字段、粒度和业务键均可打开检查。</span></div>
    <div class="control-item"><strong>02 · 规则与代码可解释</strong><span>指标字典固定，SQL/Python 可审阅，关键金额不由 AI 生成。</span></div>
    <div class="control-item"><strong>03 · 结果可复核</strong><span>13 项生成校验＋19 项独立复核，利润、库存、应收应付和现金对平。</span></div>
    <div class="control-item"><strong>04 · 后续可控制</strong><span>固定规则可复现，修改后自动回归，报告保留证据与人工复核。</span></div>
  </div>
  <div class="grid two" style="margin-top:16px">
    <div><div class="code-label">SQL · 先聚合费用，避免一对多连接放大收入</div><div class="code-block"><span class="kw">WITH</span> expense <span class="kw">AS</span> (
  <span class="kw">SELECT</span> sales_batch_id, expense_type,
         <span class="fn">SUM</span>(actual_amount) <span class="kw">AS</span> amount
  <span class="kw">FROM</span> fact_channel_expense
  <span class="kw">WHERE</span> month = :month
  <span class="kw">GROUP BY</span> sales_batch_id, expense_type
)
<span class="cm">-- 再按 sales_batch_id 连接销售，并检查连接前后控制总额</span></div></div>
    <div><div class="code-label">PYTHON · 分层计算与零分母处理</div><div class="code-block"><span class="kw">def</span> <span class="fn">safe_divide</span>(numerator, denominator):
    <span class="kw">if</span> denominator <span class="kw">is None or</span> denominator == 0:
        <span class="kw">return None</span>
    <span class="kw">return</span> numerator / denominator

df[<span class="cm">"gross_profit"</span>] = df[<span class="cm">"net_revenue"</span>] - df[<span class="cm">"cogs"</span>]
df[<span class="cm">"contribution_2"</span>] = (
    df[<span class="cm">"contribution_1"</span>]
    - df[<span class="cm">"direct_marketing"</span>]
    - df[<span class="cm">"influencer"</span>]
)</div></div>
  </div>
  <div class="grid two">
    ${card("验证证据", "不是只验证页面能显示", `<table class="data-table wide"><tbody><tr><td>生成器勾稽</td><td class="positive"><b>13 项通过</b></td></tr><tr><td>独立 reopen Excel</td><td class="positive"><b>19 项通过</b></td></tr><tr><td>金标准与回归</td><td>修改后重跑</td></tr><tr><td>输出一致性</td><td>SQL / Python / 页面 / 报告同源</td></tr></tbody></table>`, `<span class="tag green">可复现 · 可追溯 · 可回归</span>`)}
    ${card("源文件与边界", "可打开检查，不包装生产级平台", `<p style="font-size:11px;line-height:1.8;color:#75695d">Mock 生成器、独立校验脚本和技术文档均可查看。AI 只辅助解释；50% 时效提升需要企业同范围实测。</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="link-button" href="../mock_data/generate_mock.py" target="_blank">Mock 生成器</a><a class="link-button" href="../mock_data/validate_mock.py" target="_blank">独立校验脚本</a><a class="link-button" href="metric-logic.js" target="_blank">指标公式字典</a><a class="link-button" href="../技术开发文档_财务经营分析BI看板.md" target="_blank">技术开发文档</a></div>`, `<span class="tag amber">人工复核保留</span>`)}
  </div>`;
}

const renderers={intro:renderIntro,assumptions:renderAssumptions,overview:renderOverview,sku:renderSku,inventory:renderInventory,expense:renderExpense,cash:renderCash,report:renderReport,tech:renderTech};
let guideVisible = true;

function updateGuide(page) {
  const index = pageOrder.findIndex(item => item.id === page);
  const guide = guideContent[page];
  const next = pageOrder[index + 1];
  document.getElementById("coachContent").innerHTML = `<h2>${guide.title}</h2><div class="coach-script">${guide.script}</div><h3>提醒</h3><ul>${guide.tips.map(tip => `<li>${tip}</li>`).join("")}</ul><div class="coach-tip">${index < 2 ? "先把前提讲清楚，再进入结果。" : index < 8 ? "先结论，再证据，最后措施与复检。" : "代码只讲关键段落，不现场滚动全部文件。"}</div><div class="coach-tip">公式讲解：点击 KPI 下方“计算逻辑”、图表右上角“指标口径”或报告中的指标名称。</div>`;
  const nextButton = document.getElementById("coachNext");
  nextButton.textContent = next ? `下一步：${pageMeta[next.id][0]} →` : "导览已完成";
  nextButton.disabled = !next;
  nextButton.onclick = next ? () => setPage(next.id) : null;
}

function setGuideVisibility(visible) {
  guideVisible = visible;
  document.body.classList.toggle("guide-hidden", !visible);
  document.getElementById("guideToggle").classList.toggle("active", visible);
  document.getElementById("guideToggle").setAttribute("aria-pressed", String(visible));
}

function setPage(page) {
  if (!renderers[page]) page = "intro";
  activePage = page;
  const index = pageOrder.findIndex(item => item.id === page);
  const meta = pageOrder[index];
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  document.getElementById("pageTitle").textContent = pageMeta[page][0];
  document.getElementById("pageSubtitle").textContent = pageMeta[page][1];
  document.getElementById("pageEyebrow").textContent = meta.eyebrow;
  document.getElementById("phaseName").textContent = meta.phase;
  document.getElementById("stepName").textContent = meta.step;
  document.getElementById("pageCounter").textContent = `${String(index + 1).padStart(2, "0")} / ${String(pageOrder.length).padStart(2, "0")}`;
  document.getElementById("stepProgress").style.width = `${(index + 1) / pageOrder.length * 100}%`;
  document.getElementById("content").innerHTML = renderers[page]();
  document.getElementById("reportBtn").style.display = ["intro", "assumptions", "report", "tech"].includes(page) ? "none" : "";
  document.querySelector(".period-picker").style.visibility = ["intro", "assumptions", "tech"].includes(page) ? "hidden" : "visible";
  const previous = pageOrder[index - 1], next = pageOrder[index + 1];
  const prevButton = document.getElementById("prevPage"), nextButton = document.getElementById("nextPage");
  prevButton.disabled = !previous;
  prevButton.textContent = previous ? `← ${pageMeta[previous.id][0]}` : "← 上一步";
  nextButton.disabled = !next;
  nextButton.textContent = next ? `下一步：${pageMeta[next.id][0]} →` : "导览已完成";
  updateGuide(page);
  document.querySelectorAll(".anomaly-item").forEach(item => item.addEventListener("click", () => setPage(item.dataset.target)));
  document.querySelectorAll(".report-tab").forEach(button => button.addEventListener("click", () => { activeReport = button.dataset.report; setPage("report"); }));
  const exportButton = document.getElementById("exportSku");
  if (exportButton) exportButton.addEventListener("click", downloadSkuCsv);
  const downloadButton = document.getElementById("downloadReport");
  if (downloadButton) downloadButton.addEventListener("click", downloadMarkdown);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message) {
  const element=document.getElementById("toast");element.textContent=message;element.classList.add("show");setTimeout(()=>element.classList.remove("show"),2200);
}

function downloadSkuCsv() {
  const header=["SKU编码","SKU名称","品类","净销售收入","商品毛利率","渠道边际贡献","渠道边际贡献率"];
  const rows=D.skus.map(row=>[row.sku_id,row["SKU名称"],row["品类"],row.net_revenue,row.gross_margin,row.contribution_2,row.contribution_margin_2]);
  const csv="\ufeff"+[header,...rows].map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(",")).join("\n");
  const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));link.download="2026年9月SKU盈利明细_Mock.csv";link.click();URL.revokeObjectURL(link.href);toast("SKU 明细已导出");
}

function downloadMarkdown() {
  const report=reportContent(activeReport);
  const text=`# ${report.title}\n\n> ${report.subtitle}\n>\n> 全部经营数值为 Mock，待财务复核。\n\n## 核心结论\n\n${report.conclusion}\n\n## 指标证据\n\n- 净销售收入：${wan(current.net_revenue)} 万元，同比 ${pct(current.revenue_yoy)}。\n- 渠道边际贡献：${wan(current.contribution_2)} 万元，渠道边际贡献率 ${pct(current.contribution_margin_2)}。\n- 管理经营利润：${wan(current.management_operating_profit)} 万元。\n- 经营现金净流入：${wan(current.operating_net_cash)} 万元，CCC ${fmt(current.ccc,1)} 天。\n- 重点低温 SKU 临期占比：${pct(D.inventory.low_near_ratio)}，报损率 ${pct(D.inventory.low_loss_rate)}。\n\n## 原因候选\n\n抖音推广与达人费用、低温备货和临期报损需优先核查。\n\n## 建议动作\n\n${report.action}\n\n## 复核声明\n\n本报告不替代法定财务报表，不包含悠纯真实经营结论。\n`;
  const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([text],{type:"text/markdown;charset=utf-8"}));link.download=`${report.title}_Mock.md`;link.click();URL.revokeObjectURL(link.href);toast("专项报告已下载");
}

document.addEventListener("click", event => {
  const metricButton = event.target.closest("[data-metric]");
  if (metricButton) {
    openMetricLogic(metricButton.dataset.metric, metricButton.dataset.metric);
    return;
  }
  const cardButton = event.target.closest("[data-card-metrics]");
  if (cardButton) {
    const title = cardButton.dataset.cardMetrics;
    openMetricLogic(`${title}｜指标口径`, metricLogic.cards[title]);
  }
});
document.getElementById("metricDialogClose").addEventListener("click", () => document.getElementById("metricDialog").close());
document.getElementById("metricDialog").addEventListener("click", event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => setPage(button.dataset.page)));
document.getElementById("reportBtn").addEventListener("click", () => setPage("report"));
document.getElementById("printBtn").addEventListener("click", () => window.print());
document.getElementById("guideToggle").addEventListener("click", () => setGuideVisibility(!guideVisible));
document.getElementById("coachClose").addEventListener("click", () => setGuideVisibility(false));
document.getElementById("prevPage").addEventListener("click", () => {
  const index = pageOrder.findIndex(item => item.id === activePage);
  if (index > 0) setPage(pageOrder[index - 1].id);
});
document.getElementById("nextPage").addEventListener("click", () => {
  const index = pageOrder.findIndex(item => item.id === activePage);
  if (index < pageOrder.length - 1) setPage(pageOrder[index + 1].id);
});
document.addEventListener("keydown", event => {
  if (document.getElementById("metricDialog").open) return;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  if (event.key === "ArrowRight") document.getElementById("nextPage").click();
  if (event.key === "ArrowLeft") document.getElementById("prevPage").click();
  if (event.key.toLowerCase() === "g") setGuideVisibility(!guideVisible);
});
setPage("intro");
