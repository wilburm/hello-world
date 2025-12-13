# Full Stack Monorepo

A modern full-stack web application with a React frontend and Node.js/Express backend, organized as a monorepo with shared scripts and configuration.

## Project Structure

```
├── server/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   └── index.ts     # Express server entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .env.example
├── client/              # Vite + React + TypeScript web app
│   ├── src/
│   │   ├── main.tsx     # React entry point
│   │   ├── App.tsx      # Root App component
│   │   ├── index.css    # Global styles
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .env.example
├── package.json         # Root workspace configuration
├── .prettierrc.json     # Code formatting rules
└── README.md            # This file
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 (for workspace support)

## Getting Started

### 1. Install Dependencies

Install all dependencies for both server and client workspaces:

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment files and customize as needed:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

### 3. Development

Run both server and client in development mode with hot reload:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000 (Vite with hot module replacement)
- **Backend**: http://localhost:3001 (Express with auto-reload via tsx)

### 4. Build

Build both applications for production:

```bash
npm run build
```

Artifacts will be generated in:
- `server/dist/` - Compiled server code
- `client/dist/` - Optimized client bundle

### 5. Testing

Run tests across all workspaces:

```bash
npm run test
```

### 6. Linting

Check code quality with ESLint:

```bash
npm run lint
```

### 7. Formatting

Format code with Prettier:

```bash
npm run format
```

## Individual Workspace Commands

You can also run commands in a specific workspace:

```bash
# Server only
cd server
npm run dev
npm run build
npm run test
npm run lint
npm run format

# Client only
cd client
npm run dev
npm run build
npm run test
npm run lint
npm run format
```

## Technology Stack

### Frontend (client/)
- **React** 18.2 - UI library
- **Vite** 5.0 - Lightning-fast build tool
- **TypeScript** 5.2 - Type safety
- **ESLint** - Code quality
- **Prettier** - Code formatting

### Backend (server/)
- **Node.js** - JavaScript runtime
- **Express** 4.18 - Web framework
- **TypeScript** 5.2 - Type safety
- **tsx** - TypeScript executor for development
- **ESLint** - Code quality
- **Prettier** - Code formatting

## API Endpoints

### Health Check
```
GET /health
Response: { status: "ok", timestamp: "2024-01-01T00:00:00.000Z" }
```

### Root Endpoint
```
GET /
Response: { message: "Welcome to the API", version: "1.0.0" }
```

## Development Workflow

1. **Start Development Servers**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit backend code in `server/src/`
   - Edit frontend code in `client/src/`
   - Changes auto-reload in dev mode

3. **Format and Lint**
   ```bash
   npm run format
   npm run lint
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are already in use:

**Frontend (Vite)**: Edit `client/vite.config.ts` to change the port
**Backend (Express)**: Edit the `PORT` environment variable in `server/.env`

### Dependencies Not Installing
Clear the cache and reinstall:
```bash
rm -rf node_modules server/node_modules client/node_modules
npm install
```

### Type Checking Errors
Ensure all dependencies are installed:
```bash
npm install
```

Then run type checking manually:
```bash
# In server
npx tsc --noEmit

# In client
npx tsc --noEmit
```

## License

ISC

## Author

Full Stack Monorepo Team
