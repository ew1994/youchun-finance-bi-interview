window.createMetricLogic = function(D, { fmt, wan, pct }) {
  const current = D.monthly[D.monthly.length - 1];
  const previous = D.monthly[D.monthly.length - 2];
  const priorYear = D.monthly.find(row => row.month === "2025-09");
  const douyin = D.channels.find(row => row.channel_id === "DOUYIN");
  const douyinPrice = D.channelPrices.find(row => row.channel_id === "DOUYIN");
  const douyinAr = D.receivables.find(row => row.channel_name === "抖音电商");
  const douyinExpense = D.channelExpenseRates.find(row => row["渠道编码"] === "DOUYIN");
  const pressure = D.forecast.filter(row => row["情景"] === "活动加投与备货压力情景");
  const minPressure = pressure.reduce((min, row) => row["期末现金"] < min["期末现金"] ? row : min, pressure[0]);
  const lastForecast = pressure[pressure.length - 1];
  const cash = D.cashFlow;
  const total = (rows, key) => rows.reduce((value, row) => value + Number(row[key] || 0), 0);
  const productionTotal = total(Object.values(D.production).map(value => ({ value })), "value");
  const expenseActual = total(D.expenses, "实际金额"), expenseBudget = total(D.expenses, "预算金额");
  const publicActual = total(D.publicExpenses, "实际金额"), publicBudget = total(D.publicExpenses, "预算金额");
  const negativeSkus = D.skus.filter(row => row.contribution_2 < 0).length;
  const overdue = douyinAr["逾期1至30天"] + douyinAr["逾期31至60天"] + douyinAr["逾期60天以上"];
  const logic = (formula, source, note, example = "") => ({ formula, source, note, example });
  const priceExample = `${wan(douyinPrice.current_revenue)} 万元 × 10,000 ÷ ${fmt(douyinPrice.current_effective_qty)} KG = ${fmt(douyinPrice.current_price)} 元/KG`;

  const metrics = {
    "管理净销售收入": logic("确认销售收入－销售折让－成功退款金额", "F_销售订单汇总表、F_售后退款表", "按全部销售汇总批次求和；同比为（本期－去年同期）÷去年同期。", `本期 ${wan(current.net_revenue)} 万元；同比（${wan(current.net_revenue)}－${wan(priorYear.net_revenue)}）÷${wan(priorYear.net_revenue)}＝${pct(current.revenue_yoy)}`),
    "有效销量": logic("销售数量 KG－退款数量 KG－无效数量 KG", "F_销售订单汇总表、F_售后退款表", "与净收入使用同一销售范围；元/KG 指标必须使用 KG，不是件数。", `本期 ${fmt(current.effective_qty_kg)} KG＝${fmt(current.effective_qty_kg / 1000)} 吨`),
    "商品毛利": logic("管理净销售收入－销售成本", "销售指标层", "商品毛利尚未扣除履约、推广、达人和公共费用。", `${wan(current.net_revenue)}－${wan(current.cogs)}＝${wan(current.gross_profit)} 万元`),
    "商品毛利率": logic("商品毛利÷管理净销售收入×100%", "销售指标层", "公司或渠道毛利率必须用汇总毛利÷汇总净收入，不能平均各 SKU 毛利率。", `${wan(current.gross_profit)}÷${wan(current.net_revenue)}＝${pct(current.gross_margin)}`),
    "销售成本": logic("出库实际成本－可售退货冲回成本", "F_产成品销售出库表、F_售后退款表", "与本期净收入匹配；可售退货成本冲回，不代表所有退款都能冲回。", `${wan(current.net_revenue)}－${wan(current.gross_profit)}＝${wan(current.cogs)} 万元`),
    "履约后边际贡献": logic("商品毛利－变动履约费用－渠道交易费用－报损成本", "F_渠道费用表、F_产成品库存批次", "先扣与销售和履约直接相关的变动成本，再观察推广前贡献。", `公司商品毛利 ${wan(current.gross_profit)} 万元，继续扣除履约、渠道交易与报损后形成履约后边际贡献`),
    "渠道边际贡献": logic("履约后边际贡献－直接推广费－达人佣金", "F_渠道费用表及履约后边际贡献指标层", "用于渠道和 SKU 主分析；本 Mock 将履约、渠道交易、报损、直接推广和达人设为变动成本，实际企业需复核成本性态。", `${wan(current.gross_profit)}－${wan(current.direct_expenses)}＝${wan(current.contribution_2)} 万元；贡献率 ${pct(current.contribution_margin_2)}`),
    "渠道边际贡献率": logic("渠道边际贡献÷渠道管理净销售收入×100%", "渠道指标层", "分子分母必须来自同一渠道、同一期间，不能简单平均各 SKU 贡献率。", `抖音 ${wan(douyin.contribution_2)}÷${wan(douyin.net_revenue)}＝${pct(douyin.contribution_margin_2)}`),
    "抖音渠道边际贡献率": logic("抖音渠道边际贡献÷抖音管理净销售收入×100%", "抖音销售、出库、售后、库存分配与渠道费用", "毛利为正但贡献为负，说明问题主要发生在商品毛利之后。", `${wan(douyin.contribution_2)}÷${wan(douyin.net_revenue)}＝${pct(douyin.contribution_margin_2)}`),
    "管理经营利润": logic("全公司渠道边际贡献－公共期间费用", "F_期间费用与预算及渠道贡献指标层", "这是管理口径，不称法定净利润；公共费用不强摊到 SKU。", `${wan(current.contribution_2)}－${wan(current.public_expenses)}＝${wan(current.management_operating_profit)} 万元`),
    "公共期间费用": logic("Σ各部门公共期间费用实际金额", "F_期间费用与预算", "只在公司层扣除一次，不在 SKU 层重复分摊。", `${wan(publicActual)} 万元；预算 ${wan(publicBudget)} 万元`),
    "总期间费用": logic("直接经营费用＋公共期间费用", "F_渠道费用表、F_期间费用与预算、库存报损分配", "直接经营费用含进入边际贡献的费用和报损；展示可以分类，利润只能扣一次。", `${wan(current.total_expenses - current.public_expenses)}＋${wan(current.public_expenses)}＝${wan(current.total_expenses)} 万元`),
    "总费用率": logic("总期间费用÷管理净销售收入×100%", "F_渠道费用表、F_期间费用与预算、销售指标层", "观察费用相对收入的负担，需结合活动增量贡献判断，而非只追求费用下降。", `${wan(current.total_expenses)}÷${wan(current.net_revenue)}＝${pct(current.total_expense_rate)}`),
    "重点低温 SKU 临期占比": logic("SKU006/007 临期库存成本÷SKU006/007 期末库存成本×100%", "F_产成品库存批次", "临期不等于已报损；它提示需要优先去化、调拨和复核补货。", `${wan(D.inventory.low_near_expiry_cost)}÷${wan(D.inventory.low_ending_cost)}＝${pct(D.inventory.low_near_ratio)}`),
    "重点低温 SKU 报损率": logic("SKU006/007 报损成本÷（期初库存成本＋本期生产入库成本）×100%", "F_产成品库存批次", "分母是本期可供库存成本；报损会进入边际贡献，也会造成前期资金损失。", `${wan(D.inventory.low_spoilage_cost)}÷（${wan(D.inventory.low_beginning_cost)}＋${wan(D.inventory.low_production_in_cost)}）＝${pct(D.inventory.low_loss_rate)}`),
    "抖音平均净售价": logic("抖音管理净销售收入×10,000÷抖音有效销量 KG", "F_销售订单汇总表、F_售后退款表", "用于判断促销净价与结构，不与原奶采购价直接比较；也不能仅凭净价变化解释贡献。", priceExample),
    "渠道平均净售价": logic("渠道管理净销售收入×10,000÷渠道有效销量 KG", "F_销售订单汇总表、F_售后退款表", "每个渠道先汇总收入和有效销量再相除；跨渠道比较还需考虑产品和规格结构。", priceExample),
    "平均净售价同比": logic("本期渠道平均净售价÷去年同期渠道平均净售价－1", "本期与去年同期销售汇总", "同比是净价与产品结构的综合变化，不等同于同一 SKU 的挂牌价降幅。", `抖音 ${fmt(douyinPrice.current_price)}÷${fmt(douyinPrice.prior_price)}－1＝${pct(douyinPrice.yoy)}`),
    "负贡献 SKU": logic("COUNT(SKU 渠道边际贡献＜0)", "2026 年 9 月 SKU 指标", "定位需要复核直接费用、净价和成本的 SKU，不等于建议直接淘汰。", `本期 ${negativeSkus} 个：${D.skus.filter(row => row.contribution_2 < 0).map(row => row["SKU名称"]).join("、")}`),
    "基础白奶单位生产成本": logic("SKU001/002 总生产成本÷SKU001/002 合格产量 KG", "F_原材料出库及生产成本宽表", "先按基础白奶范围汇总成本与产量，再相除；不是简单平均各批次单位成本。", `${wan(D.inventory.pure_production_cost)} 万元×10,000÷${fmt(D.inventory.pure_output_qty)} KG＝${fmt(D.inventory.pure_unit_now)} 元/KG`),
    "单位生产成本": logic("（原材料费用＋其他直接材料＋直接人工＋制造费用）÷合格产量 KG", "F_原材料出库及生产成本宽表", "成本结构三项之和构成总生产成本，产量只取合格产量。", `本期基础白奶单位成本 ${fmt(D.inventory.pure_unit_now)} 元/KG，同比 ${pct(D.inventory.pure_unit_now / D.inventory.pure_unit_prior - 1)}`),
    "原奶采购均价": logic("原奶不含税采购金额×10,000÷原奶采购数量", "F_采购订单（RAW_MILK）", "这是原材料采购价，不与产成品平均净售价直接比较。", `${wan(D.supply.raw_milk_amount)} 万元×10,000÷${fmt(D.supply.raw_milk_qty)} KG＝${fmt(D.supply.raw_milk_price)} 元/KG`),
    "模拟产能利用率": logic("本期合格产量 KG÷既有基地月产能 KG×100%", "生产成本宽表、D_工厂供应商主数据", "既有三基地名义年产能÷12；金昌独立情景不倒填历史。", `${fmt(D.supply.total_output)}÷${fmt(D.supply.monthly_capacity)}＝${pct(D.supply.capacity_utilization)}`),
    "期末库存成本": logic("期初库存成本＋生产入库成本－销售出库成本－报损成本±调整", "F_产成品库存批次", "库存增加先占用采购与生产资金，但不等于同额当期费用。", `期初 ${wan(current.beginning_inventory)}，期末 ${wan(current.ending_inventory)} 万元`),
    "库存增加额": logic("期末库存成本－期初库存成本", "F_产成品库存批次", "正数表示库存资金占用增加，需要结合动销与临期判断是否合理。", `${wan(current.ending_inventory)}－${wan(current.beginning_inventory)}＝${wan(current.ending_inventory - current.beginning_inventory)} 万元`),
    "存货周转天数 DIO": logic("（期初库存成本＋期末库存成本）÷2÷销售成本×期间天数", "F_产成品库存批次、销售成本指标层", "公司整体口径；天数越长，库存占用资金时间通常越长。", `（${wan(current.beginning_inventory)}＋${wan(current.ending_inventory)}）÷2÷${wan(current.cogs)}×30＝${fmt(current.dio, 1)} 天`),
    "正常库存成本": logic("期末库存成本－临期库存成本－冻结库存成本－过期库存成本", "F_产成品库存批次", "本 Mock 将库存状态拆为正常、临期、冻结和过期。", `本期正常库存 ${wan(D.inventory.normal_cost)} 万元`),
    "临期库存成本": logic("Σ达到剩余保质期预警阈值的批次期末库存成本", "F_产成品库存批次", "临期是预警状态，不是已经发生的报损。", `全公司临期 ${wan(D.inventory.near_expiry_cost)} 万元；重点低温 SKU 临期占比 ${pct(D.inventory.low_near_ratio)}`),
    "冻结库存成本": logic("Σ质量或业务冻结批次的期末库存成本", "F_产成品库存批次", "冻结库存暂不可正常销售，需要与正常可售库存分开。", `本期冻结库存 ${wan(D.inventory.frozen_cost)} 万元`),
    "报损成本": logic("Σ报损数量 KG×批次加权平均单位成本", "F_产成品库存批次", "报损成本按销售出库数量分配到渠道和 SKU，仅用于本 Mock 管理分析。", `全公司本月报损 ${wan(D.inventory.spoilage_cost)} 万元`),
    "直接材料占比": logic("（原材料费用＋其他直接材料）÷总生产成本×100%", "F_原材料出库及生产成本宽表", "观察材料价格与用量对单位成本的传导。", `${wan(D.production.raw_material)}÷${wan(productionTotal)}＝${pct(D.production.raw_material / productionTotal)}`),
    "直接人工占比": logic("直接人工÷总生产成本×100%", "F_原材料出库及生产成本宽表", "用于说明生产成本结构，不与渠道费用混合。", `${wan(D.production.direct_labor)}÷${wan(productionTotal)}＝${pct(D.production.direct_labor / productionTotal)}`),
    "制造费用占比": logic("制造费用÷总生产成本×100%", "F_原材料出库及生产成本宽表", "本 Mock 使用简化成本结构，不模拟完整制造业成本会计。", `${wan(D.production.overhead)}÷${wan(productionTotal)}＝${pct(D.production.overhead / productionTotal)}`),
    "渠道直接费用": logic("Σ履约、渠道交易、直接推广、达人佣金实际金额", "F_渠道费用表", "费用页不重复加入库存报损；报损在边际贡献计算中另行扣除。", `${wan(expenseActual)} 万元；预算 ${wan(expenseBudget)} 万元`),
    "费用预算差异": logic("实际费用－预算费用", "F_渠道费用表", "正数表示超预算，负数表示低于预算；超支只是分析入口。", `${wan(expenseActual)}－${wan(expenseBudget)}＝${wan(expenseActual - expenseBudget)} 万元`),
    "渠道费用预算差异": logic("渠道直接费用实际金额－渠道直接费用预算金额", "F_渠道费用表", "正数通常表示超支；还要结合活动增量贡献判断费用效率。", `${wan(expenseActual)}－${wan(expenseBudget)}＝${wan(expenseActual - expenseBudget)} 万元`),
    "公共费用预算差异": logic("公共期间费用实际金额－公共期间费用预算金额", "F_期间费用与预算", "与渠道直接费用分开管理，避免在利润中重复扣除。", `${wan(publicActual)}－${wan(publicBudget)}＝${wan(publicActual - publicBudget)} 万元`),
    "费用预算差异率": logic("（实际费用－预算费用）÷预算费用×100%", "F_渠道费用表、F_期间费用与预算", "同时展示差异金额和差异率，避免只看相对比例。", `渠道 ${wan(expenseActual - expenseBudget)}÷${wan(expenseBudget)}＝${pct((expenseActual - expenseBudget) / expenseBudget)}`),
    "渠道直接费用率": logic("渠道直接费用÷渠道管理净销售收入×100%", "F_渠道费用表、F_销售订单汇总表", "分子分母同属一个渠道；可比较费用效率，但最终仍需看边际贡献。", `抖音 ${wan(douyinExpense.direct_expense)}÷${wan(douyinExpense.net_revenue)}＝${pct(douyinExpense.expense_rate)}`),
    "销售回款": logic("公司应收期初＋本期新增应收－公司应收期末", "F_应收应付核销、F_银行现金流水", "公司管理口径，含平台结算回款；不等于单独核算的活动现金流入。", `${wan(current.beginning_ar)}＋${wan(current.credit_sales)}－${wan(current.ending_ar)}＝${wan(current.sales_receipts)} 万元`),
    "经营现金净流入": logic("经营现金流入－经营现金流出", "F_银行现金流水", "公司管理 proxy，不替代法定现金流量表；与利润差异需结合应收、库存和付款节奏解释。", `${wan(cash["经营现金流入"])}－${wan(cash["经营现金流出"])}＝${wan(current.operating_net_cash)} 万元；同比 ${pct(current.operating_net_cash / priorYear.operating_net_cash - 1)}`),
    "应收周转天数 DSO": logic("（期初应收＋期末应收）÷2÷赊销收入×期间天数", "F_应收应付核销", "公司整体口径；抖音应收余额与模拟渠道天数单独下钻。", `（${wan(current.beginning_ar)}＋${wan(current.ending_ar)}）÷2÷${wan(current.credit_sales)}×30＝${fmt(current.dso, 1)} 天`),
    "应付周转天数 DPO": logic("（期初应付＋期末应付）÷2÷赊购金额×期间天数", "F_应收应付核销、F_采购订单", "反映供应商信用对资金的支持，不等于可以无条件延迟付款。", `（${wan(current.beginning_ap)}＋${wan(current.ending_ap)}）÷2÷${wan(current.credit_purchases)}×30＝${fmt(current.dpo, 1)} 天`),
    "现金转换周期 CCC": logic("DIO＋DSO－DPO", "库存、应收、应付指标层", "公司整体指标；越长通常表示从采购付款到销售回款占用资金的时间越长。", `${fmt(current.dio, 1)}＋${fmt(current.dso, 1)}－${fmt(current.dpo, 1)}＝${fmt(current.ccc, 1)} 天；上年同期 ${fmt(priorYear.ccc, 1)} 天`),
    "重点低温 SKU 库存占用": logic("ΣSKU006/007 期末库存成本", "F_产成品库存批次", "只汇总重点低温酸奶，不把全公司库存当成低温备货占用。", `期初 ${wan(D.inventory.low_beginning_cost)}，期末 ${wan(D.inventory.low_ending_cost)}，增加 ${wan(D.inventory.low_ending_cost - D.inventory.low_beginning_cost)} 万元`),
    "抖音应收余额": logic("抖音客户应收期初＋新增应收－本期核销", "F_应收应付核销", "与抖音应收账龄、平台结算和逾期催收联动，不等同于公司全部应收。", `期末 ${wan(douyinAr["期末余额"])} 万元；渠道模拟周转天数 ${fmt(douyinAr["模拟周转天数"], 0)} 天`),
    "应收账龄": logic("期末余额＝未到期＋逾期 1–30 天＋逾期 31–60 天＋逾期 60 天以上", "F_应收应付核销", "账龄用于定位回款优先级，不能只用一个 DSO 平均值代替。", `抖音 ${wan(douyinAr["未到期金额"])}＋${wan(overdue)}＝${wan(douyinAr["期末余额"])} 万元`),
    "期末可用资金": logic("期初现金＋经营现金净流入＋投资筹资净流入", "F_银行现金流水", "公司现金余额管理口径；预测最低现金另行用于压力测试。", `${wan(cash["期初现金"])}＋${wan(cash["经营现金净流入proxy"])}＋${wan(cash["投资筹资净流入"])}＝${wan(current.ending_cash)} 万元`),
    "预测期末现金": logic("期初现金＋预计流入－预计经营流出－活动加投备货压力支出", "F_现金流预测", "逐周滚动，上一周期末现金成为下一周期初；压力支出是极限测试假设，不是建议预算。", `W${lastForecast["周序号"]}：${wan(lastForecast["期初现金"])}＋${wan(lastForecast["预计流入"])}－${wan(lastForecast["预计经营流出"])}－${wan(lastForecast["活动加投备货压力支出"])}＝${wan(lastForecast["期末现金"])} 万元`),
    "安全资金线": logic("近 3 个月平均经营现金流出×1.25", "F_银行现金流水、F_现金流预测", "作为内部预警阈值，不是法定或银行统一标准。", `本期安全资金线 ${wan(minPressure["安全资金线"])} 万元`),
    "预测最低现金安全垫": logic("13 周最低期末现金－安全资金线", "F_现金流预测", "正数表示尚未跌破安全线，负数才表示预测资金缺口；需按周滚动更新。", `W${minPressure["周序号"]} ${wan(minPressure["期末现金"])}－${wan(minPressure["安全资金线"])}＝${wan(minPressure["期末现金"] - minPressure["安全资金线"])} 万元`),
    "同比增长率": logic("（本期指标－去年同期指标）÷去年同期指标×100%", "连续月份指标层", "比率类指标的同比变化通常用百分点，不用增长率。", `净收入同比 ${pct(current.revenue_yoy)}；毛利率同比 ${fmt(current.gross_margin_yoy_pp * 100, 2)} 个百分点`),
    "环比增长率": logic("（本期指标－上期指标）÷上期指标×100%", "连续月份指标层", "观察短期变化，需保证月份连续且口径一致。", `（${wan(current.net_revenue)}－${wan(previous.net_revenue)}）÷${wan(previous.net_revenue)}＝${pct(current.revenue_mom)}`),
  };

  const cards = {
    "收入与商品毛利率趋势": ["管理净销售收入", "商品毛利率", "同比增长率", "环比增长率"],
    "本月利润瀑布": ["管理净销售收入", "销售成本", "商品毛利", "履约后边际贡献", "渠道边际贡献", "公共期间费用", "管理经营利润"],
    "渠道收入与渠道边际贡献率": ["管理净销售收入", "渠道边际贡献率"],
    "SKU 规模 × 边际贡献矩阵": ["管理净销售收入", "渠道边际贡献率"],
    "渠道边际贡献对比": ["渠道边际贡献", "渠道边际贡献率"],
    "渠道平均净售价": ["渠道平均净售价", "平均净售价同比"],
    "SKU 盈利明细": ["管理净销售收入", "商品毛利率", "渠道边际贡献", "渠道边际贡献率"],
    "生产成本结构": ["单位生产成本", "直接材料占比", "直接人工占比", "制造费用占比"],
    "库存状态": ["正常库存成本", "临期库存成本", "冻结库存成本"],
    "库存与现金占用": ["期末库存成本", "库存增加额", "报损成本"],
    "渠道直接费用：实际与预算": ["渠道直接费用", "费用预算差异", "费用预算差异率"],
    "公共期间费用": ["公共期间费用", "公共费用预算差异"],
    "渠道直接费用率": ["渠道直接费用率"],
    "管理经营利润 vs 经营现金": ["管理经营利润", "经营现金净流入"],
    "活动营运资金拆解": ["存货周转天数 DIO", "应收周转天数 DSO", "应付周转天数 DPO", "现金转换周期 CCC"],
    "抖音应收账龄": ["抖音应收余额", "应收账龄"],
    "未来 13 周活动现金预测": ["预测期末现金", "安全资金线", "预测最低现金安全垫"],
    "指标手算样例": ["管理净销售收入", "销售成本", "商品毛利", "渠道边际贡献"],
  };
  return { metrics, cards };
};
