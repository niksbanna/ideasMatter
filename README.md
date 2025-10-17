# ideasMatter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/niksbanna/ideasMatter/actions/workflows/ci.yml/badge.svg)](https://github.com/niksbanna/ideasMatter/actions/workflows/ci.yml)

**ideasMatter** is an open-source platform for submitting, managing, and collaborating on ideas and proposals. Built with React, TypeScript, and integrated with Algorand blockchain technology, this platform empowers communities to share innovative ideas and make them matter.

## 🌟 Features

- 💡 **Idea Submission**: Submit and share your innovative ideas with the community
- 🔍 **Proposal Explorer**: Browse and discover proposals from other users
- 👤 **User Profiles**: Manage your profile and track your contributions
- 🎯 **Dashboard**: Personal dashboard to manage your ideas and interactions
- 🔐 **Authentication**: Secure user authentication with Supabase
- 🌐 **Multilingual Support**: Built-in internationalization support
- 🤖 **AI Chatbot**: Get assistance with AI-powered chatbot integration
- ⛓️ **Blockchain Integration**: Algorand blockchain integration for transparent and secure transactions
- 🎨 **Modern UI**: Beautiful and responsive design with Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (for backend services)
- Algorand wallet (for blockchain features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/niksbanna/ideasMatter.git
   cd ideasMatter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and configure your variables:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Supabase credentials and other required API keys.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run add-dummy-data` - Add dummy data to your database (development only)

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Blockchain**: Algorand (AlgoSDK, AlgoKit Utils)
- **Wallet Integration**: Pera Wallet, Defly Connect, WalletConnect
- **AI**: Google Generative AI
- **Routing**: React Router v6
- **Code Quality**: ESLint

## 📁 Project Structure

```
ideasMatter/
├── src/
│   ├── components/     # Reusable React components
│   ├── contexts/       # React Context providers
│   ├── pages/          # Page components
│   ├── services/       # API and service integrations
│   ├── locales/        # Internationalization files
│   └── App.tsx         # Main application component
├── scripts/            # Utility scripts
├── supabase/           # Supabase configuration and migrations
├── .github/            # GitHub workflows and templates
└── public/             # Static assets
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding new features, or improving documentation, your help is appreciated.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Quick Contribution Guide

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Community

- **Issues**: Report bugs or request features through [GitHub Issues](https://github.com/niksbanna/ideasMatter/issues)
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/niksbanna/ideasMatter/discussions)

## 👥 Looking for Collaborators

We're actively looking for collaborators to help grow this project! If you're interested in:

- Frontend development (React, TypeScript)
- Backend development (Supabase, APIs)
- Blockchain integration (Algorand)
- UI/UX design
- Documentation
- Testing
- DevOps

Please reach out by opening an issue or joining our discussions!

## 📧 Contact

For questions or suggestions, please open an issue or start a discussion on GitHub.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Built with support from the Algorand community
- Powered by Supabase for backend services

---

Made with ❤️ by the ideasMatter community
