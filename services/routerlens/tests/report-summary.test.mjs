import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/reportSummary.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {summarizeCostReport,reportMessage}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const evidence=rows=>({available:true,data:{rows,totals_complete:true}});
const model=(model,total_usage)=>({model,total_usage});
function fixture(){return {
 kind:'weekly',range:{start_date:'2026-10-16',end_date:'2026-10-23',timezone:'Asia/Shanghai'},comparison_range:{start_date:'2026-10-09',end_date:'2026-10-16',timezone:'Asia/Shanghai'},
 spend:{current:120,previous:100,increase:20,percent:20},current:evidence([{total_usage:120}]),prior:evidence([{total_usage:100}]),
 models:evidence([model('example/steady',80),model('example/rising',40)]),prior_models:evidence([model('example/steady',80),model('example/rising',20)]),
 anomalies:{available:true,data:{evaluated_days:7,skipped_days:0}},assessment:'no_candidates',attributions:[],attribution_omitted_days:0
};}
test('lead with spend and comparison; distinguish biggest change from biggest spend',()=>{
 const r=summarizeCostReport(fixture());assert.match(r.headline,/120.0000/);assert.match(r.comparison,/多花 \$20.0000.*20.0%/);
 assert.equal(r.model_changes.items[0].model,'example/rising');assert.equal(r.model_changes.items.length,1);
 assert(r.text.indexOf('本期花了多少')<r.text.indexOf('主要变化来自哪里'));
 assert.match(r.text,/结束日不含/);assert.match(r.text,/金额为美元/);assert.match(r.text,/不是|不把|不证明/);
});
test('decrease is written as savings without negative currency or negative percentage',()=>{
 const x=fixture();x.spend={current:90,previous:100,increase:-10,percent:-10};x.current=evidence([{total_usage:90}]);x.models=evidence([model('example/steady',80),model('example/rising',10)]);
 const r=summarizeCostReport(x);assert.match(r.comparison,/少花 \$10.0000.*10.0%/);assert.doesNotMatch(r.comparison,/-10|\$-/);assert.equal(r.model_changes.items[0].change_usd,-10);
});
test('zero baseline does not produce Infinity or invented percentage',()=>{
 const x=fixture();x.spend={current:2,previous:0,increase:2,percent:null};x.prior=evidence([{total_usage:0}]);x.current=evidence([{total_usage:2}]);x.models=evidence([model('example/new',2)]);x.prior_models=evidence([model('example/old',0)]);
 const r=summarizeCostReport(x);assert.match(r.comparison,/上期为零，不计算涨跌幅/);assert.doesNotMatch(r.text,/Infinity|NaN/);assert.equal(r.model_changes.items[0].change_usd,2);
});
test('missing current or comparison period stays unknown, not zero',()=>{
 for(const field of ['current','previous']){const x=fixture();x.spend[field]=null;x.spend.increase=null;x.spend.percent=null;const r=summarizeCostReport(x);assert.match(r.comparison,/暂不能比较/);assert(r.unknown.length>0);if(field==='current')assert.match(r.headline,/未知/);}
});
test('truncated, unavailable, empty or non-reconciling models cannot explain changes',()=>{
 for(const mutate of [x=>x.models.data.totals_complete=false,x=>x.prior_models={available:false},x=>x.models.data.rows=[],x=>x.models.data.rows[0].total_usage=999,x=>x.prior.data.totals_complete=false,x=>x.models.data.rows[0].total_usage=-1,x=>x.models.data.rows[0].model='']){
  const x=fixture();mutate(x);const r=summarizeCostReport(x);assert.equal(r.model_changes.available,false);assert.deepEqual(r.model_changes.items,[]);assert.match(r.unknown.join(''),/暂不能判断/);
 }
});
test('exact decimal reconciliation accepts grouped decimals but refuses small real mismatch',()=>{
 const x=fixture();x.current=evidence([{total_usage:0.1},{total_usage:0.2}]);x.prior=evidence([{total_usage:0.1}]);x.models=evidence([model('example/a',0.3)]);x.prior_models=evidence([model('example/a',0.1)]);x.spend={current:0.3,previous:0.1,increase:0.2,percent:200};
 assert.equal(summarizeCostReport(x).model_changes.available,true);x.models.data.rows[0].total_usage=0.30000001;assert.equal(summarizeCostReport(x).model_changes.available,false);
});
test('offsetting movements remain visible even when account total is flat',()=>{
 const x=fixture();x.spend={current:100,previous:100,increase:0,percent:0};x.current=evidence([{total_usage:100}]);x.models=evidence([model('example/steady',60),model('example/rising',40)]);
 const r=summarizeCostReport(x);assert.match(r.comparison,/持平/);assert.equal(r.model_changes.items.length,2);assert.deepEqual(r.model_changes.items.map(i=>i.change_usd).sort((a,b)=>a-b),[-20,20]);assert.match(r.text,/相互抵消/);
});
test('duplicate model rows are aggregated; exact zero changes are omitted',()=>{
 const x=fixture();x.models=evidence([model('example/steady',30),model('example/steady',50),model('example/rising',40)]);const r=summarizeCostReport(x);assert.equal(r.model_changes.items.length,1);assert.equal(r.model_changes.items[0].model,'example/rising');
});
test('partial anomaly coverage does not imply entire report period is normal',()=>{
 const x=fixture();x.anomalies.data={evaluated_days:2,skipped_days:5};const r=summarizeCostReport(x);assert.match(r.text,/已评估的 2 天/);assert.match(r.unknown.join(''),/5 天未能评估.*整个报告期/);
});
test('unavailable historical anomaly coverage is explicitly unknown',()=>{
 const x=fixture();x.anomalies={available:false};x.assessment='unknown';const r=summarizeCostReport(x);assert.match(r.text,/暂不能判断是否存在异常/);assert.match(r.unknown.join(''),/不代表没有异常/);
});
test('candidate alerts stay visible when attribution fails or is partial',()=>{
 const x=fixture();x.assessment='candidate';x.attributions=[{date:'2026-10-22',available:false},{date:'2026-10-21',available:true,data:{status:'partial'}}];x.attribution_omitted_days=2;
 const r=summarizeCostReport(x);assert.match(r.text,/发现费用上涨线索/);assert.match(r.unknown.join(''),/归因数据不足/);assert.match(r.unknown.join(''),/应用层归因不足/);assert.match(r.unknown.join(''),/另有 2 个异常日期/);
});
test('small nonzero changes are not formatted as zero; model control characters are removed',()=>{
 const x=fixture();x.models=evidence([model('example/a\n伪造标题',120)]);x.prior_models=evidence([model('example/a\n伪造标题',100)]);const r=summarizeCostReport(x);assert(!r.model_changes.items[0].model.includes('\n'));
 x.spend={current:0.00001,previous:0,increase:0.00001,percent:null};assert.match(summarizeCostReport(x).headline,/不足 \$0.0001/);
});
test('notification text stays bounded and keeps limitations when attribution details overflow',()=>{
 const x=fixture();x.assessment='candidate';const r=summarizeCostReport(x);const text=reportMessage(r,[{available:true,data:{summary_text:'自动归因：'+'详细'.repeat(4000)}}]);assert(text.length<=3500);assert.match(text,/完整报告/);assert.match(text,/缺失数据不视为零/);assert.match(text,/非最终结算/);assert.match(text,/不代表通知已发送/);
 assert.match(reportMessage(r,[{available:true,data:{summary_text:'自动归因：示例'}}]),/自动归因：示例/);
});
