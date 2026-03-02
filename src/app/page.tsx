import { addProduct } from "./actions/categorize";
import { getProducts } from "./actions/get-products";
import { createProposal } from "./actions/proposals";
import { getProposals } from "./actions/get-proposals";
import { createImpactReport } from "./actions/impact";
import { getImpactReports } from "./actions/get-impact-reports";
import { processWhatsAppMessage, getSupportLogs } from "./actions/whatsapp";

export default async function Home() {
  const [products, proposals, impactReports, supportLogs] = await Promise.all([
    getProducts(),
    getProposals(),
    getImpactReports(),
    getSupportLogs()
  ]);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-20 pb-20">
        {/* Header */}
        <section className="text-center space-y-4">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 mb-4 px-4 py-1">
            <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">Sustainable Commerce OS v1.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            Intelligent Impact
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed">
            The power of Gemini 2.5 Flash applied to sustainable B2B operations.
            Grounded in business logic, automated for scale.
          </p>
        </section>

        {/* Module 1: Catalog Intelligence */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 whitespace-nowrap">M01: Catalog Intelligence</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-1">
              <div className="glass-card p-6 md:p-8 bg-white/[0.03]">
                <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm italic">C</span>
                  Auto-Categorize
                </h3>
                <form action={addProduct} className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Product Name</label>
                    <input name="name" required placeholder="e.g. EcoSip Bamboo Cups" className="w-full premium-input border-white/5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Description</label>
                    <textarea name="description" required rows={4} placeholder="Analyze raw product data..." className="w-full premium-input border-white/5 resize-none" />
                  </div>
                  <button type="submit" className="premium-button shadow-cyan-500/10 hover:shadow-cyan-500/20">Analyze Catalog ✨</button>
                </form>
              </div>
            </section>

            <section className="lg:col-span-2 space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {products.length === 0 ? (
                <div className="glass-card p-20 text-center flex flex-col items-center gap-4 bg-white/[0.01]">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10" />
                  <p className="text-white/20 font-medium tracking-wide">Catalog Empty</p>
                </div>
              ) : (
                products.map((product: any) => (
                  <div key={product.id} className="glass-card p-6 flex flex-col gap-4 border-white/10 hover:border-cyan-500/30">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold tracking-tight">{product.name}</h4>
                      <span className="category-badge border-cyan-500/20 text-cyan-400 bg-cyan-500/5">{product.primary_category}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.seo_tags?.map((tag: string) => <span key={tag} className="seo-tag bg-cyan-500/5 border-cyan-500/10">{tag}</span>)}
                      {product.sustainability_filters?.map((filter: string) => <span key={filter} className="sustainability-filter bg-green-500/5 border-green-500/10">{filter}</span>)}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>

        {/* Module 2: B2B Proposal Strategist */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 whitespace-nowrap">M02: Proposal Strategist</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-1">
              <div className="glass-card p-6 md:p-8 bg-white/[0.03]">
                <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm italic">S</span>
                  Draft Proposal
                </h3>
                <form action={createProposal} className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Client Parameters</label>
                    <textarea name="clientRequest" required rows={4} placeholder="Define client needs and scale..." className="w-full premium-input border-white/5 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Budget Threshold ($)</label>
                    <input name="budgetLimit" type="number" step="0.01" required placeholder="850.00" className="w-full premium-input border-white/5" />
                  </div>
                  <button type="submit" className="premium-button bg-gradient-to-tr from-purple-500 to-blue-500 shadow-purple-500/10 hover:shadow-purple-500/20">Generate Proposal 🚀</button>
                </form>
              </div>
            </section>

            <section className="lg:col-span-2 space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {proposals.length === 0 ? (
                <div className="glass-card p-20 text-center flex flex-col items-center gap-4 bg-white/[0.01]">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10" />
                  <p className="text-white/20 font-medium tracking-wide">No Active Proposals</p>
                </div>
              ) : (
                proposals.map((proposal: any) => (
                  <div key={proposal.id} className="glass-card p-8 border-l-[6px] border-purple-500/50 bg-white/[0.02] hover:bg-white/[0.04]">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-2xl md:text-3xl font-black tracking-tighter">{proposal.title}</h4>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-white/30 block uppercase tracking-widest mb-1">ALLOCATED BUDGET</span>
                        <span className="text-2xl md:text-3xl font-black text-green-400 tracking-tight">${proposal.total_estimated_cost}</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposal.suggested_product_mix?.map((item: any, idx: number) => (
                          <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                            <h5 className="font-bold text-lg text-cyan-400 mb-1">{item.product_name}</h5>
                            <p className="text-xs text-white/50 leading-relaxed mb-4">{item.justification}</p>
                            <div className="flex justify-between items-center border-t border-white/5 pt-3">
                              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Qty: {item.quantity}</span>
                              <span className="text-sm font-bold text-white/80">${item.total_line_cost}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 border border-purple-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                        </div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 ml-1">Strategist ROI Summary</h5>
                        <p className="text-lg leading-relaxed text-white font-medium italic pr-8">
                          "{proposal.impact_summary}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>

        {/* Module 3: AI Impact Reporter */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 whitespace-nowrap">M03: Impact Analytics</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-1">
              <div className="glass-card p-6 md:p-8 bg-white/[0.03]">
                <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-sm italic">I</span>
                  Analyze Impact
                </h3>
                <form action={createImpactReport} className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Ordered Items</label>
                    <textarea name="orderItems" required rows={4} placeholder="Items and quantities..." className="w-full premium-input border-white/5 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Sourcing & Logistics</label>
                    <input name="sourcingInfo" placeholder="Distance, vendor location, etc." className="w-full premium-input border-white/5" />
                  </div>
                  <button type="submit" className="premium-button bg-gradient-to-tr from-green-500 to-emerald-600 shadow-green-500/10 hover:shadow-green-500/20">Generate Report 📊</button>
                </form>
              </div>
            </section>

            <section className="lg:col-span-2 space-y-8 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
              {impactReports.length === 0 ? (
                <div className="glass-card p-20 text-center flex flex-col items-center gap-4 bg-white/[0.01]">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10" />
                  <p className="text-white/20 font-medium tracking-wide">No Impact Data Available</p>
                </div>
              ) : (
                impactReports.map((report: any) => (
                  <div key={report.id} className="glass-card p-0 border-white/10 overflow-hidden bg-white/[0.02]">
                    <div className="p-8 border-b border-white/10 bg-gradient-to-r from-emerald-500/5 to-transparent">
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Sustainability Performance Report</h4>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <span className="text-3xl md:text-4xl font-black tracking-tighter text-white">{report.estimated_plastic_saved_kg}</span>
                          <span className="text-xs md:text-sm font-bold text-white/40 ml-2 uppercase">KG PLASTIC SAVED</span>
                        </div>
                        <div>
                          <span className="text-3xl md:text-4xl font-black tracking-tighter text-white">{report.estimated_carbon_avoided_kg}</span>
                          <span className="text-xs md:text-sm font-bold text-white/40 ml-2 uppercase">KG CO2 AVOIDED</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase text-white/30 tracking-widest">Calculation Reasoning</h5>
                          <div className="p-4 rounded-2xl bg-black/20 border border-white/5 font-mono text-[10px] md:text-xs text-emerald-400/80 leading-relaxed">
                            {report.calculation_logic}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase text-white/30 tracking-widest">Logistics Impact</h5>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {report.local_sourcing_summary || "No specific logistics data provided."}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/[0.03] text-center">
                        <p className="text-lg md:text-xl font-bold italic text-white/90">
                          "{report.impact_statement}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>

        {/* Module 4: AI WhatsApp Support Bot */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 whitespace-nowrap">M04: Support Intelligence</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-1">
              <div className="glass-card p-6 md:p-8 bg-white/[0.03] border-t-4 border-green-500">
                <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-sm italic">W</span>
                  WhatsApp Simulator
                </h3>
                <form action={processWhatsAppMessage} className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Customer Message</label>
                    <textarea name="message" required rows={4} placeholder="Hi, I need help with..." className="w-full premium-input border-white/5 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Database Context (JSON Optional)</label>
                    <textarea name="context" rows={3} placeholder='{ "ORD-123": "Status: Delayed" }' className="w-full premium-input border-white/5 resize-none font-mono text-xs" />
                  </div>
                  <button type="submit" className="premium-button bg-[#25D366] text-black hover:bg-[#128C7E] shadow-green-500/20">Send via AI-Bot 💬</button>
                </form>
              </div>
            </section>

            <section className="lg:col-span-2 space-y-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
              {supportLogs.length === 0 ? (
                <div className="glass-card p-20 text-center flex flex-col items-center gap-4 bg-white/[0.01]">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#25D366]/20" />
                  <p className="text-white/20 font-medium tracking-wide">No Support History</p>
                </div>
              ) : (
                supportLogs.map((log: any) => (
                  <div key={log.id} className="glass-card p-6 bg-white/[0.02] border border-white/5 hover:border-[#25D366]/30">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${log.needs_escalation ? 'bg-red-500' : 'bg-[#25D366]'} group relative`}>
                          <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${log.needs_escalation ? 'bg-red-500' : 'bg-[#25D366]'}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{(log.ai_intent || log.intent_category || 'Inquiry').replace('_', ' ')}</span>
                      </div>
                      {log.extracted_order_id && (
                        <div className="text-[10px] font-black px-2 py-1 rounded bg-white/10 uppercase tracking-widest text-[#25D366]">
                          Ref: {log.extracted_order_id}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Customer</span>
                        <p className="text-sm text-white/80 leading-relaxed font-normal">{log.customer_message}</p>
                      </div>

                      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.05] border border-white/5">
                        <span className="text-[10px] font-bold text-[#25D366] uppercase tracking-tighter">AI WhatsApp Reply</span>
                        <p className="text-base text-white font-medium leading-relaxed whitespace-pre-wrap">
                          {log.ai_reply || log.whatsapp_reply}
                        </p>
                        {log.needs_escalation && (
                          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold flex items-center gap-2">
                            <span className="animate-pulse">●</span> Escalated to Human Agent
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
