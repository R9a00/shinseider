// StickySubheader.jsx
import { Clock } from 'lucide-react';
import SimpleDetailedToggle from './SimpleDetailedToggle';

export default function StickySubheader({ 
  title, 
  readingTime, 
  currentMode, 
  onModeChange, 
  progress = 0 
}) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Title and Reading Time */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {title}
            </h1>
            {readingTime && (
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{readingTime}分</span>
              </div>
            )}
          </div>

          {/* Right: Toggle */}
          <SimpleDetailedToggle onChange={onModeChange} />
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-0.5 bg-slate-200">
              <div 
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}