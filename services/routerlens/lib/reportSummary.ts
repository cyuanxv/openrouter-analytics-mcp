import { decimalCost, sumDecimalCosts, compareDecimalCost, subtractDecimalCost, decimalCostNumber } from './decimalCost';

type Evidence = { available: boolean; data?: any };
type Range = { start_date: string; end_date: string; timezone: string };
type Input = {
  kind: string; range: Range; comparison_range: Range;
  spend: { current: number | null; previous: number | null; increase: number | null; percent: number | null };
  current: Evidence; prior: Evidence; models: Evidence; prior_models: Evidence;
  anomalies: Evidence; assessment: string; attributions: any[]; attribution_omitted_days: number;
};
const money = (n: number) => (n < 0 ? '-' : '') + (Math.abs(n) > 0 && Math.abs(n) < 0.0001 ? '不足 $0.0001' : '$' + Math.abs(n).toFixed(4));
const label = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 96);
const complete = (e: Evidence) => e.available && e.data?.totals_complete === true && Array.isArray(e.data.rows) && e.data.rows.length > 0;

// Compare the same completed periods. A spend ranking is not a change ranking.
// Missing models count as zero only after both model breakdowns reconcile exactly
// to their account controls; truncated or empty evidence never implies zero.
function modelChanges(input: Input) {
  const unavailable = { available: false, items: [] as any[], reason: '两期模型明细不完整或未与账户总额核对一致，暂不能判断主要变化来自哪个模型。' };
  if (input.spend.current === null || input.spend.previous === null || ![input.current, input.prior, input.models, input.prior_models].every(complete)) return unavailable;
  try {
    const aggregate = (e: Evidence) => {
      const values = new Map<string, unknown[]>();
      for (const row of e.data.rows) {
        if (typeof row.model !== 'string' || !row.model || decimalCost(row.total_usage).coefficient < 0n) throw new Error('INVALID_MODEL');
        values.set(row.model, [...(values.get(row.model) ?? []), row.total_usage]);
      }
      return new Map([...values].map(([key, costs]) => [key, sumDecimalCosts(costs)]));
    };
    for (const [models, account] of [[input.models, input.current], [input.prior_models, input.prior]]) {
      const costs = (e: Evidence) => sumDecimalCosts(e.data.rows.map((r: any) => {
        const n = decimalCost(r.total_usage); if (n.coefficient < 0n) throw new Error('INVALID_COST'); return r.total_usage;
      }));
      if (compareDecimalCost(costs(models), costs(account)) !== 0) return unavailable;
    }
    const current = aggregate(input.models), previous = aggregate(input.prior_models), zero = decimalCost(0);
    const items = [...new Set([...current.keys(), ...previous.keys()])].map(model => {
      const a = current.get(model) ?? zero, b = previous.get(model) ?? zero;
      return { model: label(model), current_usd: decimalCostNumber(a), previous_usd: decimalCostNumber(b), change_usd: decimalCostNumber(subtractDecimalCost(a, b)) };
    }).filter(row => row.change_usd !== 0).sort((a, b) => Math.abs(b.change_usd) - Math.abs(a.change_usd)).slice(0, 3);
    return { available: true, items, reason: '两期模型明细已与各期账户费用核对；按变化金额绝对值列出最多 3 个模型。不是全部模型清单，也不证明用户行为或价格变化的原因。' };
  } catch { return unavailable; }
}

export function summarizeCostReport(input: Input) {
  const { spend, anomalies, assessment } = input;
  const headline = spend.current === null ? '本期花了多少：未知，费用数据不足，暂不能确认总额。' : `本期花了多少：${money(spend.current)}。`;
  let comparison: string;
  if (spend.current === null || spend.previous === null || spend.increase === null) comparison = '比上期怎样：暂不能比较，两期费用尚未都确认。';
  else if (spend.increase === 0) comparison = `比上期怎样：与上期持平（上期 ${money(spend.previous)}）。`;
  else {
    const percent = spend.previous === 0 ? '上期为零，不计算涨跌幅' : spend.percent === null || !Number.isFinite(spend.percent) ? '涨跌幅暂不可计算' : `${Math.abs(spend.percent).toFixed(1)}%`;
    comparison = `比上期怎样：${spend.increase > 0 ? '多花' : '少花'} ${money(Math.abs(spend.increase))}（${percent}；上期 ${money(spend.previous)}）。`;
  }
  const changes = modelChanges(input);
  const known: string[] = [], unknown: string[] = [], next: string[] = [];
  (spend.current === null ? unknown : known).push(spend.current === null ? '本期总费用尚未确认。' : `本期费用可核对：${money(spend.current)}。`);
  (spend.previous === null ? unknown : known).push(spend.previous === null ? '上期总费用尚未确认，不能计算变化。' : `上期费用可核对：${money(spend.previous)}。`);
  if (changes.available) known.push('模型变化已与两期账户费用核对一致。');
  else unknown.push(changes.reason);
  const evaluated = anomalies.available && Number.isInteger(anomalies.data?.evaluated_days) ? anomalies.data.evaluated_days : 0;
  const skipped = anomalies.available && Number.isInteger(anomalies.data?.skipped_days) ? anomalies.data.skipped_days : null;
  let anomaly: string;
  if (assessment === 'candidate') anomaly = '异常检查：发现费用上涨线索，需要进一步排查；这不是已确认的故障或浪费。';
  else if (assessment === 'no_candidates' && evaluated > 0) anomaly = `异常检查：已评估的 ${evaluated} 天未发现费用上涨候选。`;
  else anomaly = '异常检查：数据不足，暂不能判断是否存在异常。';
  if (!anomalies.available || evaluated === 0) unknown.push('异常判断尚无足够证据；不代表没有异常。');
  if (skipped !== null && skipped > 0) unknown.push(`有 ${skipped} 天未能评估，不能将已评估日期的结果推广到整个报告期。`);
  for (const item of input.attributions) {
    if (!item.available) unknown.push(`${item.date} 归因数据不足，异常候选仍需排查。`);
    else if (item.data?.status === 'partial') unknown.push(`${item.date} 应用层归因不足，不能确定具体应用来源。`);
  }
  if (input.attribution_omitted_days > 0) unknown.push(`另有 ${input.attribution_omitted_days} 个异常日期尚未展开归因，可按日期继续查询。`);
  if (unknown.length) next.push('先核对数据权限、报告日期与完整性说明；不要把缺失数据当成零。');
  if (assessment === 'candidate') next.push('按异常日期查看请求量及输入、输出变化；账单贡献只提供排查线索，不证明原因。');
  else if (changes.available && changes.items.length) next.push('优先查看变化金额最大的模型，核对对应请求记录。');
  else if (!unknown.length) next.push('保留本次报告，后续在相同口径下比较；无需仅凭本报告切换模型。');
  const lines = [
    `OpenRouter 工作台 ${input.kind === 'weekly' ? '费用周报' : '异常检查'}`,
    `${input.range.start_date} 至 ${input.range.end_date}（结束日不含，${input.range.timezone}；金额为美元）`,
    headline, comparison,
    `对比期：${input.comparison_range.start_date} 至 ${input.comparison_range.end_date}（结束日不含）。`,
    '主要变化来自哪里：',
    ...(changes.available ? changes.items.length ? changes.items.map(row => `${row.model}：${row.change_usd > 0 ? '多花' : '少花'} ${money(Math.abs(row.change_usd))}（本期 ${money(row.current_usd)}，上期 ${money(row.previous_usd)}）。`) : ['两期模型费用没有变化。'] : [changes.reason]),
    ...(changes.available ? ['仅列变化金额最大的最多 3 项；各模型可能相互抵消，不把费用排名当作变化原因。'] : []),
    anomaly,
    '现在能确认：', ...known,
    '还不能确认：', ...(unknown.length ? unknown : ['本次查询未发现上述数据缺口；账单变化仍不证明具体行为或价格变化原因。']),
    '建议下一步：', ...next,
    '缺失数据不视为零；金额为查询时观察值，非最终结算。生成报告不代表通知已发送。'
  ];
  return { version: 1, headline, comparison, model_changes: changes, known, unknown, next_steps: next, text: lines.join('\n') };
}

// Reserve space for limitations before adding the existing detailed daily attribution.
export function reportMessage(summary: ReturnType<typeof summarizeCostReport>, attributions: any[]) {
  const tail = '\n缺失数据不视为零；金额为查询时观察值，非最终结算。生成报告不代表通知已发送。';
  const budget = 3500 - tail.length;
  let text = summary.text.slice(0, -tail.length);
  if (text.length > budget) return text.slice(0, budget - 18) + '\n部分说明省略，请读取完整报告。' + tail;
  for (const item of attributions) {
    if (!item.available || typeof item.data?.summary_text !== 'string') continue;
    const detail = '\n' + item.data.summary_text;
    if (text.length + detail.length > budget) { text += '\n详细归因请读取完整报告。'.slice(0, budget - text.length); break; }
    text += detail;
  }
  return text + tail;
}
