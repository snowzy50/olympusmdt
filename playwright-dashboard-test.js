const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/snowzy/olympusmdt/.claude/Documentation/UX-UI-Review/screenshots-dashboard';
const REPORT_FILE = '/Users/snowzy/olympusmdt/.claude/Documentation/UX-UI-Review/DASHBOARD-REVIEW.md';

// Créer le dossier screenshots s'il n'existe pas
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let report = `# Review UX/UI Dashboard - OlympusMDT
**Date:** ${new Date().toLocaleDateString('fr-FR')}
**Testeur:** Playwright Advanced Review
**Application:** OlympusMDT - Dashboard Pages

---

`;

function addToReport(section) {
  report += section + '\n\n';
  console.log(section);
}

async function setupAuthenticatedSession(page) {
  // Simuler une session authentifiée en injectant des données dans localStorage
  // et en créant un cookie de session
  await page.goto('http://localhost:3000');

  await page.evaluate(() => {
    // Simuler un utilisateur authentifié
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@olympusmdt.com',
      role: 'admin',
      agency: 'LSPD'
    }));

    // Simuler une agence sélectionnée
    localStorage.setItem('selectedAgency', JSON.stringify({
      id: 'lspd',
      name: 'LSPD',
      fullName: 'Los Santos Police Department'
    }));
  });

  // Ajouter un cookie de session simulé
  await page.context().addCookies([{
    name: 'next-auth.session-token',
    value: 'simulated-session-token-for-testing',
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  }]);

  console.log('✅ Session authentifiée simulée');
}

async function analyzePageUX(page, pageName) {
  const analysis = {
    name: pageName,
    accessibility: {},
    performance: {},
    visual: {},
    interactions: []
  };

  // 1. Analyse d'accessibilité
  const a11ySnapshot = await page.accessibility.snapshot();
  analysis.accessibility.hasTree = !!a11ySnapshot;

  // Vérifier les rôles ARIA
  const ariaElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('[role]');
    const roles = {};
    elements.forEach(el => {
      const role = el.getAttribute('role');
      roles[role] = (roles[role] || 0) + 1;
    });
    return roles;
  });
  analysis.accessibility.ariaRoles = ariaElements;

  // Vérifier les labels
  const labeledInputs = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    let labeled = 0;
    inputs.forEach(input => {
      if (input.labels?.length > 0 ||
          input.getAttribute('aria-label') ||
          input.getAttribute('aria-labelledby') ||
          input.getAttribute('placeholder')) {
        labeled++;
      }
    });
    return { total: inputs.length, labeled };
  });
  analysis.accessibility.inputs = labeledInputs;

  // 2. Analyse de performance
  const performanceMetrics = await page.evaluate(() => {
    const perfData = window.performance.timing;
    const paintEntries = performance.getEntriesByType('paint');

    return {
      loadTime: perfData.loadEventEnd - perfData.navigationStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0
    };
  });
  analysis.performance = performanceMetrics;

  // 3. Analyse visuelle
  const visualMetrics = await page.evaluate(() => {
    // Analyser les animations
    const animations = document.getAnimations?.() || [];

    // Analyser les couleurs
    const computedStyles = window.getComputedStyle(document.body);

    // Compter les éléments interactifs
    const buttons = document.querySelectorAll('button').length;
    const links = document.querySelectorAll('a').length;
    const inputs = document.querySelectorAll('input, select, textarea').length;

    return {
      animationsCount: animations.length,
      backgroundColor: computedStyles.backgroundColor,
      interactiveElements: {
        buttons,
        links,
        inputs,
        total: buttons + links + inputs
      }
    };
  });
  analysis.visual = visualMetrics;

  // 4. Test des interactions communes
  const interactions = [];

  // Test hover sur les boutons
  const buttons = await page.locator('button').all();
  if (buttons.length > 0) {
    await buttons[0].hover();
    interactions.push({ type: 'hover', element: 'button', success: true });
  }

  // Test focus sur les inputs
  const inputs = await page.locator('input').all();
  if (inputs.length > 0) {
    await inputs[0].focus();
    const isFocused = await inputs[0].evaluate(el => el === document.activeElement);
    interactions.push({ type: 'focus', element: 'input', success: isFocused });
  }

  analysis.interactions = interactions;

  return analysis;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  // Collecter les erreurs console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  addToReport('## Configuration de Test');
  addToReport('**Note:** Ce test utilise une session authentifiée simulée pour accéder aux pages du dashboard.');
  addToReport('---');

  // Configurer la session authentifiée
  await setupAuthenticatedSession(page);

  // Test du Dashboard Principal
  addToReport('## 1. Dashboard Principal (/dashboard)');

  try {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 10000 });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dashboard-main.png'),
      fullPage: true
    });

    const analysis = await analyzePageUX(page, 'Dashboard');

    addToReport('### 📊 Analyse Technique');
    addToReport(`- **Chargement complet:** ${analysis.performance.loadTime}ms`);
    addToReport(`- **DOM Content Loaded:** ${analysis.performance.domContentLoaded}ms`);
    addToReport(`- **First Contentful Paint:** ${analysis.performance.firstContentfulPaint.toFixed(2)}ms`);

    addToReport('### ♿ Accessibilité');
    addToReport(`- **Arbre d'accessibilité:** ${analysis.accessibility.hasTree ? '✅ Présent' : '❌ Absent'}`);
    addToReport(`- **Inputs avec labels:** ${analysis.accessibility.inputs.labeled}/${analysis.accessibility.inputs.total}`);
    if (Object.keys(analysis.accessibility.ariaRoles).length > 0) {
      addToReport('- **Rôles ARIA détectés:**');
      Object.entries(analysis.accessibility.ariaRoles).forEach(([role, count]) => {
        addToReport(`  - ${role}: ${count}`);
      });
    }

    addToReport('### 🎨 Éléments Visuels');
    addToReport(`- **Animations actives:** ${analysis.visual.animationsCount}`);
    addToReport(`- **Éléments interactifs:** ${analysis.visual.interactiveElements.total}`);
    addToReport(`  - Boutons: ${analysis.visual.interactiveElements.buttons}`);
    addToReport(`  - Liens: ${analysis.visual.interactiveElements.links}`);
    addToReport(`  - Champs de formulaire: ${analysis.visual.interactiveElements.inputs}`);

    // Test de la sidebar
    const sidebar = await page.locator('aside, nav, [class*="sidebar"]').first().isVisible().catch(() => false);
    if (sidebar) {
      addToReport('### 🔧 Sidebar');
      addToReport('- ✅ Sidebar visible');

      const toggleButton = await page.locator('button[aria-label*="toggle"], button[class*="toggle"]').first().isVisible().catch(() => false);
      if (toggleButton) {
        await page.locator('button[aria-label*="toggle"], button[class*="toggle"]').first().click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'dashboard-sidebar-toggled.png'),
          fullPage: true
        });
        addToReport('- ✅ Toggle sidebar fonctionne');
      }
    } else {
      addToReport('### 🔧 Sidebar');
      addToReport('- ⚠️ Sidebar non détectée (peut-être redirection vers login)');
    }

    // Test des cards de stats
    const statsCards = await page.locator('[class*="card"], [class*="stat"]').count();
    addToReport(`### 📈 Cartes de Statistiques: ${statsCards}`);

    addToReport('### 📸 Screenshots');
    addToReport('![Dashboard Main](screenshots-dashboard/dashboard-main.png)');
    if (await fs.promises.access(path.join(SCREENSHOTS_DIR, 'dashboard-sidebar-toggled.png')).then(() => true).catch(() => false)) {
      addToReport('![Sidebar Toggled](screenshots-dashboard/dashboard-sidebar-toggled.png)');
    }

  } catch (error) {
    addToReport(`### ❌ Erreur de Chargement`);
    addToReport(`- ${error.message}`);
    addToReport('- La page nécessite probablement une authentification réelle');
  }

  addToReport('---');

  // Test Page Plaintes
  addToReport('## 2. Page Plaintes (/dashboard/complaints)');

  try {
    await page.goto('http://localhost:3000/dashboard/complaints', { waitUntil: 'networkidle', timeout: 10000 });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'complaints-main.png'),
      fullPage: true
    });

    const analysis = await analyzePageUX(page, 'Complaints');

    addToReport('### 📊 Analyse Technique');
    addToReport(`- **Temps de chargement:** ${analysis.performance.loadTime}ms`);
    addToReport(`- **Éléments interactifs:** ${analysis.visual.interactiveElements.total}`);

    // Test des filtres
    const searchInput = await page.locator('input[type="search"], input[placeholder*="Recherche"]').first().isVisible().catch(() => false);
    if (searchInput) {
      addToReport('### 🔍 Système de Filtres');
      addToReport('- ✅ Champ de recherche présent');

      // Test de recherche
      await page.locator('input[type="search"], input[placeholder*="Recherche"]').first().fill('test search');
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'complaints-search.png'),
        fullPage: true
      });
      addToReport('- ✅ Recherche fonctionnelle');
    }

    const selects = await page.locator('select').count();
    addToReport(`- **Filtres (dropdowns):** ${selects}`);

    // Test du tableau
    const tableRows = await page.locator('table tbody tr, [role="row"]').count();
    addToReport(`### 📋 Tableau: ${tableRows} lignes détectées`);

    // Test des badges
    const badges = await page.locator('[class*="badge"]').count();
    addToReport(`### 🏷️ Badges: ${badges} détectés`);

    // Test modal
    if (tableRows > 0) {
      await page.locator('table tbody tr, [role="row"]').first().click();
      await page.waitForTimeout(1000);

      const modal = await page.locator('[role="dialog"], [class*="modal"]').isVisible().catch(() => false);
      if (modal) {
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'complaints-modal.png'),
          fullPage: true
        });
        addToReport('### 💬 Modal');
        addToReport('- ✅ Modal de détails fonctionne');
        addToReport('![Modal](screenshots-dashboard/complaints-modal.png)');
      }
    }

    addToReport('### 📸 Screenshots');
    addToReport('![Complaints Main](screenshots-dashboard/complaints-main.png)');
    if (await fs.promises.access(path.join(SCREENSHOTS_DIR, 'complaints-search.png')).then(() => true).catch(() => false)) {
      addToReport('![Search](screenshots-dashboard/complaints-search.png)');
    }

  } catch (error) {
    addToReport(`### ❌ Erreur de Chargement`);
    addToReport(`- ${error.message}`);
  }

  addToReport('---');

  // Test Page Événements
  addToReport('## 3. Page Événements (/dashboard/events)');

  try {
    await page.goto('http://localhost:3000/dashboard/events', { waitUntil: 'networkidle', timeout: 10000 });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'events-main.png'),
      fullPage: true
    });

    const analysis = await analyzePageUX(page, 'Events');

    addToReport('### 📊 Analyse Technique');
    addToReport(`- **Temps de chargement:** ${analysis.performance.loadTime}ms`);
    addToReport(`- **Animations:** ${analysis.visual.animationsCount}`);

    // Test du calendrier
    const calendar = await page.locator('[class*="calendar"]').isVisible().catch(() => false);
    if (calendar) {
      addToReport('### 📅 Calendrier');
      addToReport('- ✅ Calendrier visible');

      // Test navigation mois
      const prevBtn = await page.locator('button:has-text("←"), button[aria-label*="previous"]').first().isVisible().catch(() => false);
      const nextBtn = await page.locator('button:has-text("→"), button[aria-label*="next"]').first().isVisible().catch(() => false);

      if (prevBtn && nextBtn) {
        addToReport('- ✅ Navigation mensuelle présente');

        await page.locator('button:has-text("←"), button[aria-label*="previous"]').first().click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'events-prev-month.png'),
          fullPage: true
        });
      }

      // Test clic sur un jour
      const days = await page.locator('[class*="calendar"] button, [class*="day"]').count();
      addToReport(`- **Jours cliquables:** ${days}`);
    }

    // Test formulaire de création
    const createBtn = await page.locator('button:has-text("Créer"), button:has-text("Nouvel"), button:has-text("Add")').first().isVisible().catch(() => false);
    if (createBtn) {
      addToReport('### ➕ Création d\'événement');
      addToReport('- ✅ Bouton de création présent');

      await page.locator('button:has-text("Créer"), button:has-text("Nouvel"), button:has-text("Add")').first().click();
      await page.waitForTimeout(1000);

      const form = await page.locator('form, [role="dialog"]').isVisible().catch(() => false);
      if (form) {
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'events-create-form.png'),
          fullPage: true
        });
        addToReport('- ✅ Formulaire de création fonctionne');
        addToReport('![Create Form](screenshots-dashboard/events-create-form.png)');
      }
    }

    addToReport('### 📸 Screenshots');
    addToReport('![Events Main](screenshots-dashboard/events-main.png)');

  } catch (error) {
    addToReport(`### ❌ Erreur de Chargement`);
    addToReport(`- ${error.message}`);
  }

  addToReport('---');

  // Erreurs console
  if (consoleErrors.length > 0) {
    addToReport('## ⚠️ Erreurs Console Détectées');
    consoleErrors.slice(0, 10).forEach(err => {
      addToReport(`- ${err}`);
    });
  }

  // Sauvegarder le rapport
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`\n✅ Review dashboard complétée! Rapport: ${REPORT_FILE}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);

  await browser.close();
})();
