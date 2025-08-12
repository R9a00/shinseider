// ScrollspyNav.jsx

export default function ScrollspyNav({ sections, currentSection, onSectionClick }) {
  return (
    <nav className="sticky top-4 space-y-2">
      <h3 className="font-semibold text-slate-900 mb-4">目次</h3>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSectionClick(section.id)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentSection === section.id
                  ? 'bg-teal-100 text-teal-900 border-l-4 border-teal-500 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}