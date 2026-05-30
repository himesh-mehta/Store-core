import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();
if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Import all routes eagerly using Vite's glob import
const routeModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });
const routeTsModules = import.meta.glob('../src/app/api/**/route.ts', { eager: true });

const allRouteModules = { ...routeModules, ...routeTsModules };

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace('../src/app/api', '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js' or 'route.ts'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Register all routes
function registerRoutes() {
  api.routes = []; // Clear existing routes
  
  const sortedFiles = Object.keys(allRouteModules).sort((a, b) => b.length - a.length);

  for (const routeFile of sortedFiles) {
    const route = allRouteModules[routeFile] as any;
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
      if (route[method]) {
        const parts = getHonoPath(routeFile);
        const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
        console.log('Registered API Route:', method, '->', honoPath);
        
        const handler: Handler = async (c) => {
          return await route[method](c.req.raw, { params: c.req.param() });
        };
        
        const methodLowercase = method.toLowerCase();
        (api as any)[methodLowercase](honoPath, handler);
      }
    }
  }
}

registerRoutes();

export { api, API_BASENAME };
