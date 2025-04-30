# SnappSell

A smart image recognition app that helps you identify and tag items for selling. Built with React, TypeScript, and Google Cloud Vision API.

## Features

- Drag and drop image upload
- Automatic item recognition using AI
- Real-time tag generation
- Modern, responsive UI

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Vite

- Backend:
  - Node.js
  - Express
  - Google Cloud Vision API
  - TypeScript

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google Cloud account with Vision API enabled

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd snappsell
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Set up environment variables:
- Create a `.env` file in the root directory
- Add your configuration:
```
VITE_API_URL=http://localhost:3000
```

4. Start the development servers:
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from root directory)
npm run dev
```

## Deployment

- Backend: Deployed on Google Cloud Run
- Frontend: Deployed on Vercel

## License

MIT
