import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import parseResumeHandler from './api/parse-resume.ts';
import roastHandler from './api/roast.ts';
import improveResumeHandler from './api/improve-resume.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parsers with support for base64 DOCX payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount Vercel-compatible serverless route handlers for local / AI Studio runtime
app.all('/api/parse-resume', (req: Request, res: Response) =>
  parseResumeHandler(req as any, res as any)
);
app.all('/api/roast', (req: Request, res: Response) =>
  roastHandler(req as any, res as any)
);
app.all('/api/improve-resume', (req: Request, res: Response) =>
  improveResumeHandler(req as any, res as any)
);

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const val = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  if (process.env.PORT) {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return 3000;
}

function getHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

// Setup Vite middleware in dev or static files in production
async function startServer() {
  // Ensure any unmatched /api/* route returns pure JSON 404, never HTML
  app.all('/api/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}.`,
    });
  });

  // Global Express error handler for API routes
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      console.error('Unhandled API error on', req.path, err);
      res.setHeader('Content-Type', 'application/json');
      res.status(err.status || 500).json({
        error: err.message || 'An unexpected server error occurred.',
      });
      return;
    }
    next(err);
  });

  const httpServer = http.createServer(app);
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = getPort();
  const HOST = getHost();

  // Align Node keep-alive timeout above nginx proxy timeout
  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 66000;

  httpServer.listen(PORT, HOST, () => {
    console.log(`🔥 Resume Roaster Server active on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
