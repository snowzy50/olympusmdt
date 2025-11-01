# Rapports - Documentation Technique

## Vue d'ensemble
Le module Rapports permet de générer, consulter et exporter des rapports de traçabilité et de conformité pour les dispositifs médicaux et les cycles de stérilisation.

## Architecture

### Composants principaux

#### `app/rapports/page.tsx`
Page principale du module de rapports. Affiche la liste des rapports et les outils de génération.

**Localisation :** `app/rapports/page.tsx`

**Structure :**
```tsx
export default function RapportsPage() {
  return (
    <MainLayout>
      <ReportFilters />
      <ReportList />
      <ReportGenerator />
    </MainLayout>
  );
}
```

#### `components/reports/ReportCard.tsx`
Composant de carte représentant un rapport généré.

**Props :**
```typescript
interface ReportCardProps {
  report: {
    id: string;
    title: string;
    type: ReportType;
    createdAt: Date;
    createdBy: User;
    status: 'generating' | 'ready' | 'error';
    format: 'pdf' | 'excel' | 'csv';
    fileSize?: number;
    downloadUrl?: string;
  };
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}
```

**Fonctionnalités :**
- Aperçu des informations du rapport
- Actions de téléchargement/suppression
- Badge de statut
- Indication du format et de la taille

### Composants à implémenter

#### `ReportFilters`
Panneau de filtres pour la liste des rapports.

**Filtres disponibles :**
- Type de rapport
- Date de création
- Créateur
- Statut
- Format

#### `ReportList`
Liste paginée des rapports avec tri et recherche.

**Fonctionnalités :**
- Tri multi-colonnes
- Pagination
- Sélection multiple
- Actions groupées (téléchargement, suppression)

#### `ReportGenerator`
Interface de création de nouveaux rapports.

**Types de rapports :**
- Traçabilité dispositif
- Conformité cycle
- Synthèse mensuelle
- Audit complet
- Rapport personnalisé

## Types de rapports

### 1. Rapport de Traçabilité Dispositif

**Objectif :** Historique complet d'un dispositif médical

**Contenu :**
- Informations d'identification
- Historique des cycles de stérilisation
- Résultats des contrôles
- Maintenance et réparations
- Mouvements entre unités
- Incidents et alertes

**Paramètres :**
```typescript
interface DeviceTraceabilityParams {
  deviceId: string;
  startDate?: Date;
  endDate?: Date;
  includeImages?: boolean;
  includeOperators?: boolean;
}
```

**Format de sortie :** PDF, Excel

### 2. Rapport de Conformité Cycle

**Objectif :** Validation d'un cycle de stérilisation

**Contenu :**
- Paramètres du cycle
- Courbes de température/pression
- Liste des dispositifs traités
- Résultats des contrôles
- Signature électronique de l'opérateur
- Certification de conformité

**Paramètres :**
```typescript
interface CycleComplianceParams {
  cycleId: string;
  includeCharts?: boolean;
  includeDeviceDetails?: boolean;
  certificateType?: 'standard' | 'detailed';
}
```

**Format de sortie :** PDF (certifié)

### 3. Rapport de Synthèse Mensuelle

**Objectif :** Vue d'ensemble des activités du mois

**Contenu :**
- Statistiques globales
- Nombre de cycles par type
- Taux de conformité
- Performance des autoclaves
- Incidents et anomalies
- Comparaison avec mois précédent

**Paramètres :**
```typescript
interface MonthlySummaryParams {
  year: number;
  month: number;
  units?: string[]; // Filtrer par unités
  includeCharts?: boolean;
  includeOperatorStats?: boolean;
}
```

**Format de sortie :** PDF, Excel

### 4. Rapport d'Audit

**Objectif :** Préparation aux audits et inspections

**Contenu :**
- Conformité réglementaire
- Documentation complète
- Traçabilité de tous les dispositifs
- Maintenances des équipements
- Formation des opérateurs
- Non-conformités et actions correctives

**Paramètres :**
```typescript
interface AuditReportParams {
  startDate: Date;
  endDate: Date;
  auditType: 'internal' | 'external' | 'regulatory';
  scope: string[]; // Domaines à auditer
  standard?: 'ISO13485' | 'ISO17665' | 'EN285';
}
```

**Format de sortie :** PDF (complet)

### 5. Rapport Personnalisé

**Objectif :** Créer un rapport sur mesure

**Sections disponibles :**
- Dispositifs
- Cycles de stérilisation
- Autoclaves
- Opérateurs
- Unités
- Contrôles qualité
- Maintenance
- Incidents

**Paramètres :**
```typescript
interface CustomReportParams {
  title: string;
  sections: ReportSection[];
  filters: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  includeCharts?: boolean;
  includeRawData?: boolean;
}
```

**Format de sortie :** PDF, Excel, CSV

## Modèle de données

### Report
```typescript
interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: Date;
  createdBy: User;
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: Date;
  error?: string;
  metadata: {
    dateRange?: { start: Date; end: Date };
    entityCount?: number;
    generationTime?: number; // en secondes
  };
}

type ReportType =
  | 'device_traceability'
  | 'cycle_compliance'
  | 'monthly_summary'
  | 'audit'
  | 'custom';

type ReportStatus =
  | 'pending'      // En attente de génération
  | 'generating'   // En cours de génération
  | 'ready'        // Prêt à télécharger
  | 'error'        // Erreur lors de la génération
  | 'expired';     // Expiré (lien de téléchargement)
```

### ReportTemplate
```typescript
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  defaultParameters: Record<string, any>;
  sections: ReportSection[];
  isPublic: boolean;
  createdBy: User;
  usageCount: number;
}

interface ReportSection {
  id: string;
  title: string;
  type: 'table' | 'chart' | 'text' | 'image';
  dataSource: string;
  config: Record<string, any>;
  order: number;
}
```

## API Endpoints

### Génération de rapports

#### `POST /api/reports/generate`
Démarre la génération d'un nouveau rapport.

**Body :**
```json
{
  "type": "device_traceability",
  "title": "Traçabilité DM-12345",
  "parameters": {
    "deviceId": "dm_12345",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31"
  },
  "format": "pdf"
}
```

**Response :**
```json
{
  "reportId": "report_001",
  "status": "pending",
  "estimatedTime": 30
}
```

#### `GET /api/reports/:id/status`
Vérifie le statut de génération d'un rapport.

**Response :**
```json
{
  "id": "report_001",
  "status": "generating",
  "progress": 65,
  "estimatedTimeRemaining": 10
}
```

#### `GET /api/reports/:id/download`
Télécharge un rapport prêt.

**Query params :**
- `inline` : Afficher dans le navigateur (pour PDF)

**Response :** Fichier binaire

### Gestion des rapports

#### `GET /api/reports`
Liste tous les rapports avec filtres.

**Query params :**
- `type` : Filtrer par type
- `status` : Filtrer par statut
- `startDate`, `endDate` : Filtrer par date de création
- `page`, `limit` : Pagination

#### `DELETE /api/reports/:id`
Supprime un rapport.

#### `POST /api/reports/:id/regenerate`
Régénère un rapport existant avec les mêmes paramètres.

### Templates

#### `GET /api/reports/templates`
Liste les templates de rapports disponibles.

#### `POST /api/reports/templates`
Crée un nouveau template.

#### `GET /api/reports/templates/:id`
Récupère un template spécifique.

## Logique de génération

### Workflow de génération

```typescript
async function generateReport(params: ReportParams): Promise<Report> {
  // 1. Validation des paramètres
  validateParameters(params);

  // 2. Création de l'enregistrement
  const report = await createReportRecord(params);

  // 3. Génération asynchrone
  queue.add('generate-report', {
    reportId: report.id,
    params
  });

  return report;
}
```

### Processus de génération (worker)

```typescript
async function processReportGeneration(job: Job) {
  const { reportId, params } = job.data;

  try {
    // 1. Mise à jour du statut
    await updateReportStatus(reportId, 'generating');

    // 2. Récupération des données
    const data = await fetchReportData(params);
    job.progress(30);

    // 3. Transformation des données
    const formatted = await formatData(data, params.type);
    job.progress(60);

    // 4. Génération du fichier
    const file = await generateFile(formatted, params.format);
    job.progress(90);

    // 5. Upload du fichier
    const url = await uploadToStorage(file);

    // 6. Finalisation
    await updateReportStatus(reportId, 'ready', {
      fileUrl: url,
      fileSize: file.size
    });

    job.progress(100);
  } catch (error) {
    await updateReportStatus(reportId, 'error', {
      error: error.message
    });
    throw error;
  }
}
```

### Génération PDF

Utilisation de puppeteer ou similaire :

```typescript
async function generatePDF(data: any, template: string): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Rendu HTML
  const html = await renderTemplate(template, data);
  await page.setContent(html);

  // Génération PDF
  const pdf = await page.pdf({
    format: 'A4',
    margin: {
      top: '2cm',
      right: '2cm',
      bottom: '2cm',
      left: '2cm'
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: getHeaderTemplate(),
    footerTemplate: getFooterTemplate()
  });

  await browser.close();
  return pdf;
}
```

### Génération Excel

Utilisation de ExcelJS :

```typescript
async function generateExcel(data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Metadata
  workbook.creator = 'OlympusMDT';
  workbook.created = new Date();

  // Feuille principale
  const worksheet = workbook.addWorksheet('Rapport');

  // En-têtes
  worksheet.columns = data.columns;

  // Données
  data.rows.forEach(row => {
    worksheet.addRow(row);
  });

  // Style
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };

  // Génération du buffer
  return await workbook.xlsx.writeBuffer();
}
```

## Interface utilisateur

### Liste des rapports

**Colonnes :**
- Titre
- Type
- Créé par
- Date de création
- Statut
- Format
- Taille
- Actions

**Actions disponibles :**
- 📥 Télécharger
- 👁️ Prévisualiser (PDF uniquement)
- 🔄 Régénérer
- 🗑️ Supprimer
- 📤 Partager

### Générateur de rapport

**Étapes :**

1. **Sélection du type**
   - Cards cliquables pour chaque type
   - Description et aperçu

2. **Configuration**
   - Formulaire dynamique selon le type
   - Validation en temps réel
   - Aperçu des données incluses

3. **Options avancées**
   - Format de sortie
   - Sections à inclure
   - Personnalisation du template

4. **Génération**
   - Barre de progression
   - Estimation du temps
   - Possibilité d'annuler

5. **Résultat**
   - Téléchargement immédiat
   - Ajout à la liste des rapports
   - Option de régénération

### Prévisualisation

Pour les rapports PDF :
- Viewer intégré dans le navigateur
- Navigation par page
- Zoom et rotation
- Recherche dans le document

## Performance

### Optimisations

1. **Génération asynchrone**
   - Queue Redis/Bull
   - Workers dédiés
   - Gestion de la priorité

2. **Cache**
   - Cache des données fréquentes
   - Invalidation intelligente
   - TTL adaptatif

3. **Pagination des données**
   - Limit sur les requêtes
   - Chunking pour gros volumes
   - Streaming si nécessaire

4. **Compression**
   - Gzip pour PDF
   - Zip pour exports multiples

### Limites

- Taille max rapport : 50 MB
- Timeout génération : 5 minutes
- Rapports simultanés par user : 3
- Conservation des fichiers : 30 jours

## Sécurité

### Permissions

```typescript
const permissions = {
  'report:view': ['technician', 'supervisor', 'manager', 'auditor'],
  'report:generate': ['supervisor', 'manager', 'auditor'],
  'report:delete': ['manager'],
  'report:share': ['manager', 'auditor'],
};
```

### Contrôle d'accès

- Les utilisateurs ne voient que leurs rapports ou ceux partagés
- Les managers voient tous les rapports de leur établissement
- Traçabilité des téléchargements
- Watermark avec nom de l'utilisateur sur les PDF

### Données sensibles

- Anonymisation optionnelle
- Redaction de données confidentielles
- Encryption des fichiers temporaires
- Suppression automatique après expiration

## Conformité réglementaire

### Normes respectées

- **ISO 13485** : Systèmes de management de la qualité
- **ISO 17665** : Stérilisation des produits de santé
- **EN 285** : Stérilisation - Grands stérilisateurs à vapeur d'eau

### Éléments obligatoires

Tous les rapports officiels doivent inclure :
- Date et heure de génération
- Identité du générateur
- Signature électronique (horodatage)
- Numéro unique de rapport
- Mention "Document contrôlé"

### Audit trail

Chaque génération est tracée :
- Qui a généré
- Quand
- Quels paramètres
- Qui a téléchargé
- Combien de fois

## Tests

### Tests unitaires

- Validation des paramètres
- Formatage des données
- Génération de templates
- Calcul des statistiques

### Tests d'intégration

- Génération complète d'un rapport
- Téléchargement et vérification
- Régénération après modification des données
- Expiration et nettoyage

### Tests de performance

- Génération de rapports volumineux
- Charge simultanée
- Temps de réponse API

---

**Créé par :** Snowzy
**Dernière mise à jour :** 2025-11-01
