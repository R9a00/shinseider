// DnaCascadeDiagram.jsx
export default function DnaCascadeDiagram() {
  const steps = [
    "現状認識", 
    "目的設定", 
    "介入設計\n(対象/補助率/要件)", 
    "KPI/効果測定", 
    "フィードバック\n/改善"
  ];

  return (
    <figure className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
      <svg viewBox="0 0 1200 180" className="w-full h-auto">
        {/* ステップボックス */}
        {steps.map((step, i) => (
          <g key={step} transform={`translate(${i * 230 + 20}, 40)`}>
            <rect 
              rx="14" 
              width="210" 
              height="80" 
              className="fill-slate-50 stroke-slate-300 transition-colors hover:fill-teal-50 hover:stroke-teal-300" 
              strokeWidth="2"
            />
            <foreignObject x="10" y="10" width="190" height="60">
              <div className="flex h-full items-center justify-center text-center">
                <span className="text-sm font-medium text-slate-800 leading-tight">
                  {step.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </span>
              </div>
            </foreignObject>
          </g>
        ))}
        
        {/* 矢印 */}
        {steps.slice(0, -1).map((_, i) => (
          <g key={i} transform={`translate(${i * 230 + 230}, 80)`} className="opacity-70 transition-opacity hover:opacity-100">
            <path 
              d="M0 0 L40 0" 
              className="stroke-slate-400 transition-colors hover:stroke-teal-500" 
              strokeWidth="2"
            />
            <polygon 
              points="40,0 30,-6 30,6" 
              className="fill-slate-400 transition-colors hover:fill-teal-500"
            />
          </g>
        ))}
      </svg>
      
      <figcaption className="mt-3 text-sm text-slate-600 text-center">
        <strong>制度DNAカスケード</strong>：課題から改善まで因果関係で繋がる設計
      </figcaption>
    </figure>
  );
}