# Contributing to Shinseider 🤝

Thank you for your interest in contributing to Shinseider! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Provide clear reproduction steps
- Include environment information
- Add screenshots if applicable

### 💡 Feature Requests
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain the motivation and use case
- Provide detailed user flow
- Consider alternative solutions

### 📝 Code Contributions
- Fork the repository
- Create a feature branch
- Make your changes
- Submit a pull request

### 📚 Documentation
- Fix typos or unclear explanations
- Add examples and tutorials
- Translate content
- Update API documentation

### 🧪 Testing
- Report edge cases
- Add test cases
- Improve test coverage
- Performance testing

## 🚀 Development Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- Git

### Quick Start
```bash
git clone https://github.com/your-username/shinseider.git
cd shinseider
./scripts/setup.sh
./scripts/start-dev.sh
```

### Manual Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend/client
npm install

# Start development servers
# Terminal 1: cd backend && source venv/bin/activate && python -m uvicorn main:app --reload --port 8888
# Terminal 2: cd frontend/client && npm start
```

## 📋 Development Guidelines

### Code Style

#### Frontend (React)
```javascript
// Use functional components with hooks
const MyComponent = () => {
  const [state, setState] = useState();
  
  // Use descriptive variable names
  const handleUserInteraction = () => {
    // ...
  };
  
  return <div>Content</div>;
};

// Export at bottom
export default MyComponent;
```

#### Backend (Python)
```python
# Follow PEP 8
from typing import List, Dict
from fastapi import APIRouter

# Use type hints
def process_data(items: List[Dict[str, str]]) -> Dict[str, any]:
    """Process data with clear documentation."""
    return {"result": "success"}

# Use descriptive function names
async def get_subsidy_recommendations(user_data: UserData) -> List[Subsidy]:
    pass
```

### Commit Messages
```
type(scope): short description

Longer description if needed.

- Change 1
- Change 2

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Testing
- Write tests for new features
- Ensure existing tests pass
- Test on multiple browsers
- Manual testing required

## 📁 Project Structure

```
shinseider/
├── frontend/client/          # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── config.js         # Frontend configuration
│   │   └── ...
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── main.py              # Main application
│   ├── models.py            # Pydantic models
│   ├── config.py            # Backend configuration
│   ├── subsidies.yaml       # Subsidy definitions
│   └── requirements.txt
├── scripts/                 # Development scripts
└── .github/                 # GitHub templates
```

## 🎯 Focus Areas

### High Priority
- 🐛 Bug fixes
- 📱 Mobile responsiveness
- ♿ Accessibility improvements
- 🔒 Security enhancements

### Medium Priority
- ✨ New subsidy types
- 🎨 UI/UX improvements
- ⚡ Performance optimizations
- 🌐 Internationalization

### Low Priority
- 📊 Analytics
- 🎭 Themes
- 🔧 Advanced features

## 🔍 Code Review Process

### For Contributors
1. Create detailed pull request
2. Respond to feedback promptly
3. Update documentation if needed
4. Ensure CI passes

### For Reviewers
1. Review within 48 hours
2. Be constructive and specific
3. Test the changes locally
4. Check for security issues

## 🛡️ Security

### Reporting Security Issues
- Do NOT create public issues for security vulnerabilities
- Email security concerns to: [security@your-domain.com]
- Provide detailed information
- Allow time for response

### Security Guidelines
- No hardcoded secrets
- Validate all inputs
- Use secure defaults
- Follow OWASP guidelines

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Sharing others' private information
- Any unprofessional conduct

### Enforcement
Violations may result in temporary or permanent ban from the project.

## 🏷️ Labels

### Type
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `question` - Further information is requested

### Priority
- `priority-high` - Critical issues
- `priority-medium` - Important improvements
- `priority-low` - Nice to have

### Component
- `frontend` - React client issues
- `backend` - FastAPI server issues
- `docs` - Documentation issues
- `ci` - Continuous integration

### Status
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `wontfix` - This will not be worked on

## 📞 Getting Help

### Questions?
- Create a [discussion](../../discussions)
- Ask in issues with `question` label
- Check existing documentation

### Stuck?
- Review the troubleshooting guide
- Search closed issues
- Ask for help in pull requests

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to join maintainer discussions

---

## 🚀 Ready to Contribute?

1. 🍴 [Fork the repository](../../fork)
2. 📋 [Check open issues](../../issues)
3. 💡 [Start a discussion](../../discussions)
4. 📝 [Read the documentation](README.md)

**Let's build something amazing together! 🌟**