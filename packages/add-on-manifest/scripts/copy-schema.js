import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all template directories
 * @returns {string[]} Array of template directory paths
 */
function getTemplatePaths() {
  const baseDir = path.resolve(__dirname, '../../create-ccweb-add-on/templates');
  const templateNames = [
    'javascript-with-document-sandbox',
    'javascript',
    'react-javascript-with-document-sandbox',
    'react-javascript',
    'react-typescript-with-document-sandbox',
    'react-typescript',
    'swc-javascript-with-document-sandbox',
    'swc-javascript',
    'swc-typescript-with-document-sandbox',
    'swc-typescript'
  ];
  
  return templateNames.map(name => path.join(baseDir, name, 'template'));
}

/**
 * Update VSCode settings.json with schema configuration
 * @param {string} vscodeDir - The .vscode directory path
 * @returns {Promise<void>}
 */
async function updateVSCodeSettings(vscodeDir) {
  const settingsPath = path.join(vscodeDir, 'settings.json');
  let settings = {};
  
  // Try to read existing settings
  if (existsSync(settingsPath)) {
    try {
      const existingContent = await readFile(settingsPath, 'utf8');
      settings = JSON.parse(existingContent);
    } catch (error) {
      console.warn(`Warning: Could not parse existing settings.json at ${settingsPath}`);
    }
  }
  
  // Update json.schemas
  if (!settings['json.schemas']) {
    settings['json.schemas'] = [];
  }
  
  // Remove existing express-add-on-manifest schema if present
  settings['json.schemas'] = settings['json.schemas'].filter(schema => 
    !schema.url || !schema.url.includes('express-add-on-manifest.schema.json')
  );
  
  // Add new schema configuration
  settings['json.schemas'].push({
    "fileMatch": ["manifest.json"],
    "url": ".vscode/express-add-on-manifest.schema.json"
  });
  
  await writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

/**
 * Main function to copy schema to templates
 * @returns {Promise<void>}
 */
async function main() {
  // Check if schema file exists
  const schemaSourcePath = path.join(__dirname, 'express-add-on-manifest.schema.json');
  if (!existsSync(schemaSourcePath)) {
    console.error('Schema file not found at:', schemaSourcePath);
    console.log('Please run "npm run generate-schema" first to create the schema file.');
    process.exit(1);
  }

  console.log("Reading existing schema file...");
  const schemaContent = await readFile(schemaSourcePath, 'utf8');
  
  console.log("Copying schema to all template .vscode folders...");
  const templatePaths = getTemplatePaths();
  
  for (const templatePath of templatePaths) {
    const vscodeDir = path.join(templatePath, '.vscode');
    
    // Create .vscode directory if it doesn't exist
    if (!existsSync(vscodeDir)) {
      await mkdir(vscodeDir, { recursive: true });
    }
    
    // Write schema file
    const schemaPath = path.join(vscodeDir, 'express-add-on-manifest.schema.json');
    await writeFile(schemaPath, schemaContent);
    
    // Update settings.json
    await updateVSCodeSettings(vscodeDir);
    
    console.log(`✓ Updated ${path.relative(process.cwd(), templatePath)}`);
  }
  
  console.log("Schema copied to all templates successfully!");
}

main().catch(console.error);