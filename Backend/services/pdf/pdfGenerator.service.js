'use strict';


const puppeteer = require('puppeteer');
const logger    = require('../../utils/logger');

// ── Preview route map ─────────────────────────────────────────────────────────.
const PREVIEW_ROUTES = {
  EMPLOYMENT_APP: '/forms/application/preview',
  DECLARATION:    '/forms/declaration-form/preview',
  MEDICLAIM:      '/forms/mediclaim/preview',
  GRATUITY:       '/forms/gratuity-form/preview',
  EMPLOYEE_INFO:  '/forms/information/preview',
  NDA:            '/forms/non-disclosure-agreement/preview',
  TDS:            '/forms/tds-form/preview',
  EPF:            '/forms/employees-provident-fund/preview',
};

// ── PDF generation options ────────────────────────────────────────────────────
const PDF_OPTIONS = {
  format:          'A4',
  printBackground: true,
  margin: {
    top:    '0mm',
    right:  '0mm',
    bottom: '0mm',
    left:   '0mm',
  },
};

// ── Puppeteer launch arguments ────────────────────────────────────────────────
// Includes flags required for both local (Mac/Windows) and Linux (Nginx/Ubuntu) environments.
const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',   // Required on Linux servers with low /dev/shm
  '--disable-gpu',
  '--no-first-run',
  '--no-zygote',
  '--single-process',          // Helps stability in containerised / low-resource environments
];

/**
 * generateFormPDFs
 * ─────────────────────────────────────────────────────────────────────────────
 * Opens one browser, renders all requested form pages in PARALLEL, returns
 * an array of results (each is either { key, buffer } or { key, error }).
 *
 * @param {Array<{ key: string, employeeId: number|string, authToken: string }>} requests
 * @returns {Promise<Array<{ key: string, buffer?: Buffer, error?: string }>>}
 */
async function generateFormPDFs(requests) {
  if (!requests || requests.length === 0) return [];

  const frontendUrl  = (process.env.FRONTEND_URL  || 'http://localhost:5173').replace(/\/$/, '');
  const basePath     = (process.env.FRONTEND_BASE_PATH || '').replace(/\/$/, '');

  // Validate all keys upfront
  for (const req of requests) {
    if (!PREVIEW_ROUTES[req.key]) {
      logger.warn(`pdfGenerator.service: unknown form key "${req.key}"`);
    }
  }

  logger.info(`pdfGenerator.service: launching browser for ${requests.length} form(s) in parallel`);

  const browser = await puppeteer.launch({
    headless: true,
    args: PUPPETEER_ARGS,
  });

  try {
    const pagePromises = requests.map((req) => renderSingleForm(browser, frontendUrl, basePath, req));
    const results = await Promise.allSettled(pagePromises);

    return results.map((result, i) => {
      const key = requests[i].key;
      if (result.status === 'fulfilled') {
        return { key, buffer: result.value };
      } else {
        logger.error(`pdfGenerator.service: failed to render "${key}": %o`, result.reason);
        return { key, error: result.reason?.message || 'Unknown error' };
      }
    });
  } finally {
    await browser.close().catch((err) =>
      logger.warn('pdfGenerator.service: error closing browser: %o', err)
    );
    logger.info('pdfGenerator.service: browser closed');
  }
}

/**
 * renderSingleForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Opens a single browser page, navigates to the preview URL, waits for the
 * page to fully load (networkidle0), then captures a PDF buffer.
 *
 * @param {import('puppeteer').Browser} browser
 * @param {string} frontendUrl  - e.g. "http://localhost:5173"
 * @param {string} basePath     - Vite base path, e.g. "/vakrangee-onboarding-portal" (no trailing slash)
 * @param {{ key: string, employeeId: number|string, authToken: string }} req
 * @returns {Promise<Buffer>}
 */
async function renderSingleForm(browser, frontendUrl, basePath, req) {
  const { key, employeeId, authToken } = req;

  const routeBase = PREVIEW_ROUTES[key];
  if (!routeBase) {
    throw new Error(`No preview route defined for form key: "${key}"`);
  }

  const url = `${frontendUrl}${basePath}${routeBase}/${employeeId}`;
  logger.info(`pdfGenerator.service: rendering ${key} → ${url}`);

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });

    await page.evaluateOnNewDocument((token) => {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ role: 'HR_ADMIN' }));
      } catch (_) {
      }
    }, authToken);

    // Navigate and wait until no more than 2 network connections remain for 500ms.
    // This ensures API calls (form data, images, signatures) have all completed.
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });


    await page.addStyleTag({
      content: `
        .print\\:hidden,
        [class*="print:hidden"] {
          display: none !important;
        }
      `,
    });

    // Small settle delay for any CSS animations / lazy-loaded images
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Capture PDF — page.pdf() returns Uint8Array in newer Puppeteer;
    const rawPdf = await page.pdf(PDF_OPTIONS);
    const pdfBuffer = Buffer.from(rawPdf);

    logger.info(`pdfGenerator.service: ✓ ${key} PDF captured (${pdfBuffer.length} bytes)`);
    return pdfBuffer;
  } finally {
    await page.close().catch(() => {});
  }
}

module.exports = { generateFormPDFs, PREVIEW_ROUTES };
