// ActionRail.jsx
import { Download, Copy, CheckSquare } from 'lucide-react';
import { useState } from 'react';

export default function ActionRail({ nextSteps, snapCard }) {
  const [checkedSteps, setCheckedSteps] = useState({});
  
  const toggleStep = (index) => {
    const newChecked = { ...checkedSteps };
    newChecked[index] = !newChecked[index];
    setCheckedSteps(newChecked);
    localStorage.setItem('kb_checked_steps', JSON.stringify(newChecked));
  };

  const copySnapCard = () => {
    navigator.clipboard.writeText(snapCard);
  };

  return (
    <div className="sticky top-4 space-y-4">
      {/* Next Steps Checklist */}
      {nextSteps && (
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            次の一歩
          </h3>
          <div className="space-y-2">
            {nextSteps.split('\n').filter(line => line.trim()).map((step, index) => (
              <label key={index} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedSteps[index] || false}
                  onChange={() => toggleStep(index)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${checkedSteps[index] ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                  {step.replace(/^\d+\.\s*/, '')}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Snap Card Actions */}
      {snapCard && (
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3">スナップカード</h3>
          <div className="space-y-2">
            <button
              onClick={copySnapCard}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm"
            >
              <Copy className="h-4 w-4" />
              コピー
            </button>
            <button
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              画像保存
            </button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
        <h3 className="font-semibold text-teal-900 mb-2">テンプレート</h3>
        <p className="text-sm text-teal-700 mb-3">
          申請書テンプレートをダウンロード
        </p>
        <button className="w-full bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700 transition-colors text-sm font-medium">
          ダウンロード
        </button>
      </div>
    </div>
  );
}