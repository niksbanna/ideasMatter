# Contributing to ideasMatter

First off, thank you for considering contributing to ideasMatter! It's people like you that make ideasMatter such a great tool for the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## 🤔 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include screenshots or animated GIFs if applicable**
- **Note your environment**: OS, browser, Node.js version, etc.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed feature**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**
- **Include mockups or examples if applicable**

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issue labels:

- `good-first-issue` - Issues that should only require a few lines of code
- `help-wanted` - Issues that may be more involved but are good for contributors
- `documentation` - Improvements or additions to documentation

### Pull Requests

We actively welcome your pull requests! Here's how to contribute:

1. Fork the repo and create your branch from `main`
2. Make your changes and ensure the code follows our style guidelines
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a pull request!

## 🚀 Getting Started

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ideasMatter.git
   cd ideasMatter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Running Tests

Before submitting your changes, make sure all checks pass:

```bash
# Run linting
npm run lint

# Build the project
npm run build
```

## 💻 Development Process

### Branch Naming Convention

Use descriptive branch names that indicate the purpose:

- `feature/add-user-notifications`
- `fix/login-validation-error`
- `docs/update-readme`
- `refactor/auth-service`

### Making Changes

1. Create a new branch from `main`
2. Make your changes in logical, atomic commits
3. Write or update tests as needed
4. Ensure your code follows the style guidelines
5. Run linting and build checks
6. Push to your fork and submit a pull request

## 🎨 Style Guidelines

### TypeScript/JavaScript Style Guide

- Use TypeScript for all new code
- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Use ES6+ features when appropriate
- Prefer functional components and hooks in React

### Code Formatting

- We use ESLint for code linting
- Run `npm run lint` before committing
- Fix any linting errors before submitting PR

### React Best Practices

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types and interfaces
- Avoid inline styles; use Tailwind CSS classes

## 📝 Commit Messages

Write clear and meaningful commit messages:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add Google OAuth integration

Implemented Google OAuth authentication flow using Supabase Auth.
Users can now sign in with their Google accounts.

Closes #123
```

```
fix(dashboard): resolve data loading issue

Fixed race condition in dashboard data fetching that caused
inconsistent state updates.
```

## 🔄 Pull Request Process

1. **Update Documentation**: Ensure any new features are documented
2. **Update the README**: If you change functionality, update the README
3. **Follow the PR Template**: Fill out all sections of the PR template
4. **Link Related Issues**: Reference any related issues using keywords like "Closes #123"
5. **Request Review**: Request review from maintainers
6. **Address Feedback**: Respond to review comments and make requested changes
7. **Keep it Updated**: Rebase or merge main into your branch if needed

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code has been performed
- [ ] Comments added for complex code sections
- [ ] Documentation has been updated
- [ ] No new warnings are generated
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Changes have been tested locally

## 🏷️ Issue and PR Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention is needed
- `priority-high` - High priority issue
- `wontfix` - This will not be worked on

## 🎯 Areas We Need Help

We're particularly looking for contributions in:

- **Frontend Development**: React components, UI improvements
- **Backend Integration**: Supabase queries and functions
- **Blockchain Features**: Algorand integration enhancements
- **Testing**: Unit tests, integration tests, E2E tests
- **Documentation**: Tutorials, API docs, code comments
- **Design**: UI/UX improvements, mockups, design systems
- **Internationalization**: Translations for different languages
- **Performance**: Optimization and performance improvements
- **Accessibility**: Making the app more accessible

## 💬 Questions?

Don't hesitate to ask questions! You can:

- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Comment on existing issues or PRs

## 🙏 Thank You!

Your contributions to open source, large or small, make projects like this possible. Thank you for taking the time to contribute!

---

**Happy Coding!** 🎉
