# 🎭 0N1 Lore Crafter v1.1

A powerful character creation and interactive AI agent system built for the 0N1 Force NFT community. Transform your 0N1 Force NFTs into living, breathing characters with rich personalities, memories, and evolving storylines.

## ✨ Features

### 🔐 **Secure NFT Authentication**
- MetaMask wallet integration
- Real-time NFT ownership verification
- Secure access to agent features for NFT holders only

### 🎨 **Character Creation System**
- **Automated Trait Import**: Fetch traits directly from OpenSea API
- **Multi-Step Character Building**: Guided creation process with AI assistance
- **Rich Personality Profiles**: Detailed backgrounds, motivations, relationships
- **Voice & Communication Style**: Unique speech patterns and dialogue preferences

### 🤖 **Interactive AI Agents**
- **Memory-Driven Conversations**: Characters remember past interactions
- **Personality Evolution**: Characters grow and change through conversations
- **Context-Aware Responses**: Deep understanding of character history
- **Multiple AI Models**: Support for GPT-4 and other providers

### 🧠 **Advanced Memory System**
- **Conversation Memory**: Persistent chat history and key moments
- **Character Evolution**: Track personality changes over time
- **Context Notes**: Plot hooks, relationships, and world-building
- **Memory Export**: Save and share character profiles

### 🏛️ **Soul Management**
- **Character Gallery**: Browse and manage all created characters
- **Export/Import**: Share characters between users
- **Archives**: Complete conversation history and memory segments
- **Personality Dashboard**: Deep insights into character development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MetaMask browser extension
- OpenSea API key
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/henryfinn/0n1-lore-crafter-v1.1.git
cd 0n1-lore-crafter-v1.1

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to start creating characters!

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENSEA_API_KEY=your_opensea_api_key_here
```

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI Integration**: OpenAI GPT-4
- **NFT Data**: OpenSea API
- **Wallet**: MetaMask Web3 integration
- **Storage**: Local Storage with memory management

## 🛡️ Security Features

- ✅ Server-side API key protection
- ✅ Input validation and sanitization
- ✅ NFT ownership verification
- ✅ Secure authentication flow
- ✅ Error handling without information disclosure

## 📱 Usage

1. **Connect Wallet**: Link your MetaMask wallet
2. **Import NFT**: Enter your 0N1 Force token ID
3. **Build Character**: Use AI-assisted character creation
4. **Chat & Evolve**: Interact with your character agent
5. **Manage Memories**: Track growth and save key moments

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📄 License

MIT License - feel free to use this project for your own NFT communities!

## 🔗 Links

- [0N1 Force Official](https://0n1force.com)
- [OpenSea Collection](https://opensea.io/collection/0n1-force)

---

**Built with ❤️ for the 0N1 Force community** # Trigger Vercel deployment
