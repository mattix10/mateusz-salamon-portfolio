// Usage: node verify-portfolio.mjs <path-to-puppeteer-module> [base-url]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
const { default: puppeteer } = await import(pathToFileURL(process.argv[2]).href);
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await mkdir('audit-screenshots', { recursive: true });
  for (const width of [390, 1440]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(process.argv[3] || 'http://127.0.0.1:4185', { waitUntil: 'networkidle0' });
    const checks = await page.evaluate(() => ({
      headings: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)['@type']),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].map(node => node.getAttribute('href')).filter(href => href.length < 2 || !document.getElementById(href.slice(1))),
    }));
    assert.equal(checks.headings, 1);
    assert.equal(checks.main, 1);
    assert.equal(checks.overflow, false, `Horizontal overflow at ${width}px`);
    assert.deepEqual(checks.brokenAnchors, []);
    assert.ok(checks.schemas.includes('Person'));
    if (width === 390) {
      await page.locator('.mobile-nav-toggle').click();
      assert.equal(await page.$eval('#mobile-navigation', node => node.open), true);
      assert.equal(await page.$eval('.mobile-nav-toggle', node => node.getAttribute('aria-expanded')), 'true');
      await page.screenshot({ path: 'audit-screenshots/mobile-menu.png' });
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#mobile-navigation', node => node.open), false);
      assert.equal(await page.$eval('.mobile-nav-toggle', node => document.activeElement === node), true);
      await page.locator('.mobile-nav-toggle').click();
      await page.mouse.click(5, 400);
      assert.equal(await page.$eval('#mobile-navigation', node => node.open), false);
      await page.locator('.mobile-nav-toggle').click();
      await page.locator('.mobile-nav-links a[href="#skills"]').click();
      assert.equal(await page.$eval('#mobile-navigation', node => node.open), false);
      assert.equal(await page.evaluate(() => location.hash), '#skills');
      await page.goto(process.argv[3] || 'http://127.0.0.1:4185', { waitUntil: 'networkidle0' });
      await page.screenshot({ path: 'audit-screenshots/mobile-header.png' });
      console.log('PASS mobile navigation: opening, Escape, focus return, backdrop and section links');
    } else {
      assert.equal(await page.$eval('.mobile-nav-toggle', node => getComputedStyle(node).display), 'none');
      assert.notEqual(await page.$eval('.desktop-nav-links', node => getComputedStyle(node).display), 'none');
    }
    await page.screenshot({ path: `audit-screenshots/${width}.png`, fullPage: true });
    await page.locator('[data-range="1M"]').click();
    assert.equal(await page.$eval('[data-range="1M"]', node => node.getAttribute('aria-pressed')), 'true');
    await page.locator('[data-tz="Europe/London"]').click();
    assert.equal(await page.$eval('[data-tz="Europe/London"]', node => node.getAttribute('aria-pressed')), 'true');
    console.log(`PASS ${width}px: layout, anchors, JSON-LD, chart and time-zone controls`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: no runtime errors or failed HTTP resources');
} finally { await browser.close(); }
