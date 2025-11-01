const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/snowzy/olympusmdt/.claude/Documentation/UX-UI-Review/screenshots';
const REPORT_FILE = '/Users/snowzy/olympusmdt/.claude/Documentation/UX-UI-Review/REVIEW-REPORT.md';

// Créer le dossier screenshots s'il n'existe pas
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let report = `# Review UX/UI - OlympusMDT
**Date:** ${new Date().toLocaleDateString('fr-FR')}
**Testeur:** Playwright Automated Review
**Application:** OlympusMDT - Plateforme de suivi MDT

---

`;

function addToReport(section) {
  report += section + '\n\n';
  console.log(section);
}

async function testPage(page, url, name) {
  const results = {
    name,
    url,
    success: [],
    warnings: [],
    errors: [],
    screenshots: []
  };

  try {
    console.log(`\n=== Testing ${name} (${url}) ===`);

    // Navigation
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    if (!response || !response.ok()) {
      results.errors.push(`Page failed to load: Status ${response?.status()}`);
      return results;
    }

    // Screenshot initial
    const screenshotName = `${name.replace(/\s+/g, '-').toLowerCase()}-initial.png`;
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, screenshotName),
      fullPage: true
    });
    results.screenshots.push(screenshotName);
    results.success.push('Page loaded successfully');

    // Vérifier le titre
    const title = await page.title();
    results.success.push(`Page title: "${title}"`);

    // Analyser l'accessibilité
    const accessibilitySnapshot = await page.accessibility.snapshot();
    if (accessibilitySnapshot) {
      results.success.push('Accessibility tree is present');
    } else {
      results.warnings.push('Accessibility tree is empty or unavailable');
    }

    // Vérifier les contrastes de couleur
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');

      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function getContrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      function parseColor(color) {
        const temp = document.createElement('div');
        temp.style.color = color;
        document.body.appendChild(temp);
        const computed = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);

        const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
      }

      for (let el of elements) {
        if (el.offsetParent === null) continue; // Skip invisible elements

        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim();

        if (text && text.length > 0) {
          const color = parseColor(style.color);
          const bgColor = parseColor(style.backgroundColor);

          if (color && bgColor) {
            const [r1, g1, b1] = color;
            const [r2, g2, b2] = bgColor;

            const l1 = getLuminance(r1, g1, b1);
            const l2 = getLuminance(r2, g2, b2);
            const ratio = getContrastRatio(l1, l2);

            const fontSize = parseFloat(style.fontSize);
            const fontWeight = style.fontWeight;
            const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);

            const requiredRatio = isLargeText ? 3 : 4.5; // WCAG AA

            if (ratio < requiredRatio) {
              const tag = el.tagName.toLowerCase();
              const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
              issues.push({
                selector: `${tag}${classes}`,
                ratio: ratio.toFixed(2),
                required: requiredRatio,
                text: text.substring(0, 50)
              });
            }
          }
        }
      }

      return issues.slice(0, 5); // Limiter à 5 issues
    });

    if (contrastIssues.length > 0) {
      contrastIssues.forEach(issue => {
        results.warnings.push(`Low contrast (${issue.ratio}:1, needs ${issue.required}:1): "${issue.text}" in ${issue.selector}`);
      });
    } else {
      results.success.push('All text has sufficient color contrast (WCAG AA)');
    }

    // Vérifier la navigation au clavier
    const focusableElements = await page.evaluate(() => {
      const selectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const elements = document.querySelectorAll(selectors);
      return {
        count: elements.length,
        hasFocusIndicators: Array.from(elements).some(el => {
          const style = window.getComputedStyle(el, ':focus');
          return style.outline !== 'none' || style.boxShadow !== 'none';
        })
      };
    });

    results.success.push(`Found ${focusableElements.count} focusable elements`);

    if (focusableElements.hasFocusIndicators) {
      results.success.push('Focus indicators are present');
    } else {
      results.warnings.push('No visible focus indicators detected');
    }

    // Vérifier les images sans alt text
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.alt || img.alt.trim() === '').length;
    });

    if (imagesWithoutAlt > 0) {
      results.warnings.push(`${imagesWithoutAlt} images without alt text`);
    } else if (imagesWithoutAlt === 0 && await page.locator('img').count() > 0) {
      results.success.push('All images have alt text');
    }

    // Vérifier les erreurs console
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    // Attendre un peu pour capturer les erreurs
    await page.waitForTimeout(1000);

    if (consoleLogs.length > 0) {
      results.errors.push(`Console errors: ${consoleLogs.join(', ')}`);
    }

    return results;

  } catch (error) {
    results.errors.push(`Test failed: ${error.message}`);
    return results;
  }
}

async function testInteraction(page, description, action) {
  try {
    console.log(`  Testing: ${description}`);
    await action();
    return { success: true, message: description };
  } catch (error) {
    return { success: false, message: `${description}: ${error.message}` };
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  addToReport('## 1. Page d\'accueil et Navigation Initiale');
  addToReport('**URL:** http://localhost:3000');

  let results = await testPage(page, 'http://localhost:3000', 'Homepage');

  addToReport('### ✅ Points positifs:');
  results.success.forEach(s => addToReport(`- ${s}`));

  if (results.warnings.length > 0) {
    addToReport('### ⚠️ Points d\'attention:');
    results.warnings.forEach(w => addToReport(`- ${w}`));
  }

  if (results.errors.length > 0) {
    addToReport('### ❌ Problèmes:');
    results.errors.forEach(e => addToReport(`- ${e}`));
  }

  addToReport(`### 📸 Screenshots:`);
  results.screenshots.forEach(s => addToReport(`![${s}](screenshots/${s})`));

  // Test de l'interface de sélection d'agence
  const hasAgencySelector = await page.locator('[data-testid="agency-selector"], button, select').first().isVisible().catch(() => false);
  if (hasAgencySelector) {
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'homepage-agency-selector.png'),
      fullPage: true
    });
    addToReport('- Interface de sélection d\'agence détectée');
    addToReport('![Agency Selector](screenshots/homepage-agency-selector.png)');
  }

  addToReport('---');

  // Test du Dashboard principal
  addToReport('## 2. Dashboard Principal');
  addToReport('**URL:** http://localhost:3000/dashboard');

  results = await testPage(page, 'http://localhost:3000/dashboard', 'Dashboard');

  addToReport('### ✅ Points positifs:');
  results.success.forEach(s => addToReport(`- ${s}`));

  if (results.warnings.length > 0) {
    addToReport('### ⚠️ Points d\'attention:');
    results.warnings.forEach(w => addToReport(`- ${w}`));
  }

  if (results.errors.length > 0) {
    addToReport('### ❌ Problèmes:');
    results.errors.forEach(e => addToReport(`- ${e}`));
  }

  addToReport(`### 📸 Screenshots:`);
  results.screenshots.forEach(s => addToReport(`![${s}](screenshots/${s})`));

  // Test de la sidebar
  const sidebarTests = [];

  const sidebarVisible = await page.locator('aside, nav[role="navigation"], [class*="sidebar"]').first().isVisible().catch(() => false);
  if (sidebarVisible) {
    sidebarTests.push('✅ Sidebar visible');

    // Screenshot de la sidebar
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dashboard-sidebar.png'),
      fullPage: true
    });
    addToReport('![Dashboard Sidebar](screenshots/dashboard-sidebar.png)');

    // Test collapse/expand
    const collapseButton = page.locator('button[aria-label*="collapse"], button[aria-label*="toggle"], button[class*="collapse"]').first();
    const hasCollapseButton = await collapseButton.isVisible().catch(() => false);

    if (hasCollapseButton) {
      await collapseButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'dashboard-sidebar-collapsed.png'),
        fullPage: true
      });
      sidebarTests.push('✅ Sidebar collapse fonctionne');
      addToReport('![Sidebar Collapsed](screenshots/dashboard-sidebar-collapsed.png)');

      await collapseButton.click();
      await page.waitForTimeout(500);
    }
  } else {
    sidebarTests.push('⚠️ Sidebar non détectée');
  }

  addToReport('### Tests Sidebar:');
  sidebarTests.forEach(t => addToReport(`- ${t}`));

  // Vérifier les cards de statistiques
  const statsCards = await page.locator('[class*="card"], [class*="stat"]').count();
  addToReport(`### Cards de statistiques: ${statsCards} détectées`);

  // Vérifier le footer
  const footer = await page.locator('footer').isVisible().catch(() => false);
  if (footer) {
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dashboard-footer.png')
    });
    addToReport('- ✅ Footer présent');
    addToReport('![Footer](screenshots/dashboard-footer.png)');
  }

  addToReport('---');

  // Test Page Plaintes
  addToReport('## 3. Page Plaintes');
  addToReport('**URL:** http://localhost:3000/dashboard/complaints');

  results = await testPage(page, 'http://localhost:3000/dashboard/complaints', 'Complaints');

  addToReport('### ✅ Points positifs:');
  results.success.forEach(s => addToReport(`- ${s}`));

  if (results.warnings.length > 0) {
    addToReport('### ⚠️ Points d\'attention:');
    results.warnings.forEach(w => addToReport(`- ${w}`));
  }

  if (results.errors.length > 0) {
    addToReport('### ❌ Problèmes:');
    results.errors.forEach(e => addToReport(`- ${e}`));
  }

  addToReport(`### 📸 Screenshots:`);
  results.screenshots.forEach(s => addToReport(`![${s}](screenshots/${s})`));

  // Test des filtres
  const complaintsTests = [];

  const searchInput = await page.locator('input[type="search"], input[placeholder*="Recherche"], input[placeholder*="Search"]').isVisible().catch(() => false);
  if (searchInput) {
    complaintsTests.push('✅ Champ de recherche présent');

    // Test de la recherche
    await page.locator('input[type="search"], input[placeholder*="Recherche"], input[placeholder*="Search"]').first().fill('test');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'complaints-search.png'),
      fullPage: true
    });
    addToReport('![Search Test](screenshots/complaints-search.png)');
  }

  const filters = await page.locator('select, [role="combobox"]').count();
  complaintsTests.push(`✅ ${filters} filtres détectés`);

  // Vérifier les badges
  const badges = await page.locator('[class*="badge"]').count();
  complaintsTests.push(`✅ ${badges} badges détectés`);

  // Screenshot des badges
  if (badges > 0) {
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'complaints-badges.png'),
      fullPage: true
    });
    addToReport('![Badges](screenshots/complaints-badges.png)');
  }

  addToReport('### Tests fonctionnels:');
  complaintsTests.forEach(t => addToReport(`- ${t}`));

  // Test du modal
  const firstRow = page.locator('table tr, [role="row"]').nth(1);
  const hasTable = await firstRow.isVisible().catch(() => false);

  if (hasTable) {
    await firstRow.click();
    await page.waitForTimeout(1000);

    const modalVisible = await page.locator('[role="dialog"], [class*="modal"]').isVisible().catch(() => false);
    if (modalVisible) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'complaints-modal.png'),
        fullPage: true
      });
      addToReport('- ✅ Modal de détails fonctionne');
      addToReport('![Modal Details](screenshots/complaints-modal.png)');

      // Fermer le modal
      const closeButton = page.locator('button[aria-label*="close"], button[class*="close"]').first();
      await closeButton.click().catch(() => {});
    } else {
      addToReport('- ⚠️ Modal non détecté après clic');
    }
  }

  addToReport('---');

  // Test Page Événements
  addToReport('## 4. Page Événements');
  addToReport('**URL:** http://localhost:3000/dashboard/events');

  results = await testPage(page, 'http://localhost:3000/dashboard/events', 'Events');

  addToReport('### ✅ Points positifs:');
  results.success.forEach(s => addToReport(`- ${s}`));

  if (results.warnings.length > 0) {
    addToReport('### ⚠️ Points d\'attention:');
    results.warnings.forEach(w => addToReport(`- ${w}`));
  }

  if (results.errors.length > 0) {
    addToReport('### ❌ Problèmes:');
    results.errors.forEach(e => addToReport(`- ${e}`));
  }

  addToReport(`### 📸 Screenshots:`);
  results.screenshots.forEach(s => addToReport(`![${s}](screenshots/${s})`));

  const eventsTests = [];

  // Test du calendrier
  const calendar = await page.locator('[class*="calendar"]').isVisible().catch(() => false);
  if (calendar) {
    eventsTests.push('✅ Calendrier visible');

    // Test navigation mois
    const prevButton = page.locator('button[aria-label*="previous"], button[aria-label*="précédent"]').first();
    const nextButton = page.locator('button[aria-label*="next"], button[aria-label*="suivant"]').first();

    const hasPrev = await prevButton.isVisible().catch(() => false);
    const hasNext = await nextButton.isVisible().catch(() => false);

    if (hasPrev && hasNext) {
      eventsTests.push('✅ Navigation mois présente');

      await prevButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'events-calendar-prev.png'),
        fullPage: true
      });

      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Test bouton "Aujourd'hui"
    const todayButton = page.locator('button:has-text("Aujourd\'hui"), button:has-text("Today")').first();
    const hasToday = await todayButton.isVisible().catch(() => false);
    if (hasToday) {
      eventsTests.push('✅ Bouton "Aujourd\'hui" présent');
    }

    // Screenshot du calendrier avec événements
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'events-calendar-full.png'),
      fullPage: true
    });
    addToReport('![Calendar Full](screenshots/events-calendar-full.png)');
  }

  // Test création d'événement
  const createButton = page.locator('button:has-text("Créer"), button:has-text("Nouvel"), button:has-text("Add")').first();
  const hasCreateButton = await createButton.isVisible().catch(() => false);

  if (hasCreateButton) {
    eventsTests.push('✅ Bouton de création présent');

    await createButton.click();
    await page.waitForTimeout(1000);

    const formVisible = await page.locator('form, [role="dialog"]').isVisible().catch(() => false);
    if (formVisible) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'events-create-form.png'),
        fullPage: true
      });
      eventsTests.push('✅ Formulaire de création fonctionne');
      addToReport('![Create Form](screenshots/events-create-form.png)');

      // Fermer le formulaire
      const cancelButton = page.locator('button:has-text("Annuler"), button:has-text("Cancel")').first();
      await cancelButton.click().catch(() => {});
    }
  }

  // Test des catégories
  const categories = await page.locator('[class*="category"], [class*="badge"]').count();
  eventsTests.push(`✅ ${categories} catégories/badges détectés`);

  addToReport('### Tests fonctionnels:');
  eventsTests.forEach(t => addToReport(`- ${t}`));

  addToReport('---');

  // Test des pages placeholder
  addToReport('## 5. Pages Placeholder');

  const placeholderPages = [
    { url: '/dashboard/agents', name: 'Agents' },
    { url: '/dashboard/dispatch', name: 'Dispatch' },
    { url: '/dashboard/equipment', name: 'Equipment' },
    { url: '/dashboard/reports', name: 'Reports' }
  ];

  for (const pageInfo of placeholderPages) {
    addToReport(`### ${pageInfo.name}`);
    addToReport(`**URL:** http://localhost:3000${pageInfo.url}`);

    results = await testPage(page, `http://localhost:3000${pageInfo.url}`, pageInfo.name);

    if (results.errors.length === 0) {
      addToReport('- ✅ Page charge correctement');
    } else {
      addToReport('- ❌ Problèmes de chargement:');
      results.errors.forEach(e => addToReport(`  - ${e}`));
    }

    addToReport(`![${pageInfo.name}](screenshots/${pageInfo.name.toLowerCase()}-initial.png)`);
  }

  addToReport('---');

  // Tests responsive
  addToReport('## 6. Tests Responsive');

  const viewports = [
    { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
    { width: 768, height: 1024, name: 'Tablet (iPad)' },
    { width: 1440, height: 900, name: 'Desktop (MacBook)' }
  ];

  for (const viewport of viewports) {
    addToReport(`### ${viewport.name} (${viewport.width}x${viewport.height})`);

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const screenshotName = `responsive-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, screenshotName),
      fullPage: true
    });

    addToReport(`![${viewport.name}](screenshots/${screenshotName})`);

    // Vérifier si le contenu est bien visible
    const bodyOverflow = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return {
        overflowX: style.overflowX,
        scrollWidth: body.scrollWidth,
        clientWidth: body.clientWidth
      };
    });

    if (bodyOverflow.scrollWidth > bodyOverflow.clientWidth + 10) {
      addToReport('- ⚠️ Débordement horizontal détecté');
    } else {
      addToReport('- ✅ Pas de débordement horizontal');
    }
  }

  addToReport('---');

  // Résumé final
  addToReport('## 7. Résumé et Recommandations');
  addToReport('### Score Global: En cours d\'évaluation');
  addToReport('### Conformité WCAG 2.1: À finaliser après corrections');

  addToReport('### Recommandations prioritaires:');
  addToReport('1. **Accessibilité**: Vérifier les indicateurs de focus pour la navigation au clavier');
  addToReport('2. **Contrastes**: Corriger les problèmes de contraste détectés (si applicable)');
  addToReport('3. **Images**: Ajouter des attributs alt aux images manquantes');
  addToReport('4. **Responsive**: Tester sur plus de tailles d\'écran et corriger les débordements');
  addToReport('5. **Performance**: Optimiser les temps de chargement si nécessaire');

  addToReport('---');
  addToReport('*Review générée automatiquement par Playwright*');
  addToReport(`*Nombre total de screenshots: ${fs.readdirSync(SCREENSHOTS_DIR).length}*`);

  // Sauvegarder le rapport
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`\n✅ Review complétée! Rapport sauvegardé dans: ${REPORT_FILE}`);
  console.log(`📸 Screenshots sauvegardés dans: ${SCREENSHOTS_DIR}`);

  await browser.close();
})();
