/**
 * Script d'import des donnees de reference (Livret Penal et Gun Control)
 * Cree par: Snowzy
 *
 * Usage: npx ts-node scripts/import-reference-data.ts
 * ou: npm run import-data (apres avoir ajoute le script au package.json)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Support ESM: get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis .env.local ou .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration Supabase (utiliser les variables d'environnement)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur: Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont definies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface InfractionRow {
  category: 'contravention' | 'delit_mineur' | 'delit_majeur' | 'crime';
  name: string;
  description: string | null;
  base_fine: number | null;
  fine_formula: string | null;
  gav_duration: number | null;
  notes: string | null;
  penalties: string[] | null;
  requires_prosecutor: boolean;
  requires_tribunal: boolean;
  is_active: boolean;
}

interface WeaponRow {
  category: 'A' | 'B' | 'C' | 'D';
  name: string;
  description: string | null;
  free_possession: boolean;
  carry_prohibited: boolean;
  possession_prohibited: boolean;
  requires_permit: boolean;
  requires_declaration: boolean;
  notes: string | null;
  is_active: boolean;
}

/**
 * Parser le fichier CSV du Livret Penal
 */
function parsePenalCodeCSV(filepath: string): InfractionRow[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const infractions: InfractionRow[] = [];

  // Map des categories
  const categoryMap: Record<string, InfractionRow['category']> = {
    'Contravention': 'contravention',
    'Délit mineur': 'delit_mineur',
    'Delit mineur': 'delit_mineur',
    'Délit majeur': 'delit_majeur',
    'Delit majeur': 'delit_majeur',
    'Crime': 'crime',
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parser CSV simple (attention aux virgules dans les valeurs)
    const parts = parseCSVLine(line);
    if (parts.length < 6) continue;

    const [categoryStr, name, amendeStr, gavStr, notesStr, peinesStr] = parts;

    // Skip les lignes vides ou de titre
    if (!categoryStr || !name || name === 'Livret Pénal' || name === 'Infraction') continue;

    const category = categoryMap[categoryStr.trim()];
    if (!category) continue;

    // Parser l'amende
    let baseFine: number | null = null;
    let fineFormula: string | null = null;

    const cleanAmende = amendeStr?.replace(/[$€\s]/g, '').replace(',', '.').trim();
    if (cleanAmende) {
      const numericValue = parseInt(cleanAmende);
      if (!isNaN(numericValue) && numericValue > 0) {
        baseFine = numericValue;
      } else if (cleanAmende.includes('x') || cleanAmende.includes('%') || cleanAmende.includes('Tribunal')) {
        fineFormula = amendeStr.trim();
      }
    }

    // Parser GAV
    let gavDuration: number | null = null;
    if (gavStr) {
      const gavMatch = gavStr.match(/(\d+)/);
      if (gavMatch) {
        gavDuration = parseInt(gavMatch[1]);
      }
    }

    // Determiner si procureur/tribunal requis
    const notesLower = (notesStr || '').toLowerCase();
    const requiresProsecutor = notesLower.includes('procureur');
    const requiresTribunal = notesLower.includes('tribunal') || amendeStr?.toLowerCase().includes('tribunal');

    // Parser les peines
    let penalties: string[] | null = null;
    if (peinesStr) {
      penalties = peinesStr.split('/').map(p => p.trim()).filter(p => p.length > 0);
    }

    infractions.push({
      category,
      name: name.trim(),
      description: null,
      base_fine: baseFine,
      fine_formula: fineFormula,
      gav_duration: gavDuration,
      notes: notesStr?.trim() || null,
      penalties,
      requires_prosecutor: requiresProsecutor,
      requires_tribunal: requiresTribunal,
      is_active: true,
    });
  }

  return infractions;
}

/**
 * Parser le fichier CSV du Gun Control
 */
function parseGunControlCSV(filepath: string): WeaponRow[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const weapons: WeaponRow[] = [];

  let currentCategory: WeaponRow['category'] = 'D';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    // Detecter les lignes de categorie
    if (parts[0]?.includes('Catégorie D') || parts[0]?.includes('Categorie D')) {
      currentCategory = 'D';
      continue;
    }
    if (parts[0]?.includes('Catégorie C') || parts[0]?.includes('Categorie C')) {
      currentCategory = 'C';
      continue;
    }
    if (parts[0]?.includes('Catégorie B') || parts[0]?.includes('Categorie B')) {
      currentCategory = 'B';
      continue;
    }
    if (parts[0]?.includes('Catégorie A') || parts[0]?.includes('Categorie A')) {
      currentCategory = 'A';
      continue;
    }

    // Skip les lignes de description de categorie ou vides
    if (!parts[0] || parts[0].startsWith('TYPE') || parts[0].includes('armes à feu')) continue;

    const name = parts[0]?.trim() || parts[1]?.trim();
    if (!name) continue;

    // Parser les booleens (TRUE/FALSE ou vide)
    const parseBoolean = (val: string | undefined): boolean => {
      return val?.toUpperCase() === 'TRUE';
    };

    weapons.push({
      category: currentCategory,
      name,
      description: null,
      free_possession: parseBoolean(parts[3]),
      carry_prohibited: parseBoolean(parts[4]) || parseBoolean(parts[5]),
      possession_prohibited: parseBoolean(parts[5]),
      requires_permit: parseBoolean(parts[6]),
      requires_declaration: parseBoolean(parts[7]),
      notes: null,
      is_active: true,
    });
  }

  return weapons;
}

/**
 * Parser une ligne CSV en gerant les guillemets
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * Importer les infractions dans Supabase
 */
async function importInfractions(infractions: InfractionRow[]): Promise<void> {
  console.log(`\nImportation de ${infractions.length} infractions...`);

  // Supprimer les anciennes donnees (optionnel)
  // const { error: deleteError } = await supabase.from('infractions').delete().neq('id', '');
  // if (deleteError) console.warn('Attention lors de la suppression:', deleteError.message);

  // Inserer par lots de 50
  const batchSize = 50;
  let imported = 0;

  for (let i = 0; i < infractions.length; i += batchSize) {
    const batch = infractions.slice(i, i + batchSize);

    const { error } = await supabase
      .from('infractions')
      .insert(batch);

    if (error) {
      console.error(`Erreur lors de l'insertion (lot ${i / batchSize + 1}):`, error.message);
    } else {
      imported += batch.length;
      console.log(`  Importees: ${imported}/${infractions.length}`);
    }
  }

  console.log(`Infractions importees avec succes!`);
}

/**
 * Importer les armes dans Supabase
 */
async function importWeapons(weapons: WeaponRow[]): Promise<void> {
  console.log(`\nImportation de ${weapons.length} armes...`);

  // Inserer par lots de 50
  const batchSize = 50;
  let imported = 0;

  for (let i = 0; i < weapons.length; i += batchSize) {
    const batch = weapons.slice(i, i + batchSize);

    const { error } = await supabase
      .from('weapons_registry')
      .insert(batch);

    if (error) {
      console.error(`Erreur lors de l'insertion (lot ${i / batchSize + 1}):`, error.message);
    } else {
      imported += batch.length;
      console.log(`  Importees: ${imported}/${weapons.length}`);
    }
  }

  console.log(`Armes importees avec succes!`);
}

/**
 * Main
 */
async function main() {
  console.log('==============================================');
  console.log('   Import des donnees de reference');
  console.log('   OlympusMDT - Cree par Snowzy');
  console.log('==============================================\n');

  const rootDir = path.resolve(__dirname, '..');

  // Importer le Livret Penal
  const penalCodePath = path.join(rootDir, 'Livret_Penal_OLYMPUSRP_FINAL - MASTER.csv');
  if (fs.existsSync(penalCodePath)) {
    console.log('Lecture du Livret Penal...');
    const infractions = parsePenalCodeCSV(penalCodePath);
    console.log(`  Trouvees: ${infractions.length} infractions`);

    if (infractions.length > 0) {
      await importInfractions(infractions);
    }
  } else {
    console.warn('Fichier Livret Penal non trouve:', penalCodePath);
  }

  // Importer le Gun Control
  const gunControlPath = path.join(rootDir, 'Gun Control GCA OLYMPUS RP - Feuille 1.csv');
  if (fs.existsSync(gunControlPath)) {
    console.log('\nLecture du Gun Control...');
    const weapons = parseGunControlCSV(gunControlPath);
    console.log(`  Trouvees: ${weapons.length} armes`);

    if (weapons.length > 0) {
      await importWeapons(weapons);
    }
  } else {
    console.warn('Fichier Gun Control non trouve:', gunControlPath);
  }

  console.log('\n==============================================');
  console.log('   Import termine!');
  console.log('==============================================');
}

// Executer
main().catch(console.error);
