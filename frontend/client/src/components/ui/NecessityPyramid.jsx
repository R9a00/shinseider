// NecessityPyramid.jsx
export default function NecessityPyramid() {
  const layers = [
    { label: "④ モデル性（波及）", tone: "fill-emerald-200 hover:fill-emerald-300" },
    { label: "③ 定量根拠（KPI/証拠）", tone: "fill-emerald-300 hover:fill-emerald-400" },
    { label: "② 実現可能性（体制/資金/リスク）", tone: "fill-emerald-400 hover:fill-emerald-500" },
    { label: "① 政策適合（制度の理想像）", tone: "fill-emerald-500 hover:fill-emerald-600" },
  ];

  return (
    <figure className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {layers.map((layer, i) => {
          const h = 60;
          const w = 520 - i * 90;
          const x = 40 + i * 45;
          const y = 240 - i * 70;
          
          return (
            <g key={layer.label}>
              <polygon 
                className={`${layer.tone} stroke-emerald-600/20 transition-colors cursor-pointer`}
                strokeWidth="1"
                points={`${x},${y + h} ${x + w},${y + h} ${x + w/2},${y}`}
              />
              <foreignObject 
                x={x + 10} 
                y={y + 15} 
                width={w - 20} 
                height={h - 30}
              >
                <div className="flex h-full items-center justify-center text-center">
                  <span className="text-sm font-medium text-slate-800 leading-tight">
                    {layer.label}
                  </span>
                </div>
              </foreignObject>
            </g>
          );
        })}
        
        {/* 基盤の強調ライン */}
        <line 
          x1="40" 
          y1="305" 
          x2="560" 
          y2="305" 
          className="stroke-emerald-600" 
          strokeWidth="3"
        />
      </svg>
      
      <figcaption className="mt-3 text-sm text-slate-600 text-center">
        <strong>必然性ピラミッド</strong>：下から順に積み上げると「選ばざるを得ない」状態へ
      </figcaption>
    </figure>
  );
}