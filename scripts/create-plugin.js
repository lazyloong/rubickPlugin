import { cpSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function toCamelCase(kebabCase) {
  return kebabCase.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function copyTemplate(pluginName, pluginDir) {
  const templateDir = join(__dirname, 'template');
  const camelCaseName = toCamelCase(pluginName);

  // Copy all files from template directory
  cpSync(templateDir, pluginDir, { recursive: true });

  // Process all files and replace placeholders
  const files = [join(pluginDir, 'package.json'), join(pluginDir, 'src/index.ts')];

  files.forEach((filePath) => {
    let content = readFileSync(filePath, 'utf8');
    content = content.replace(/{{name}}/g, pluginName);
    content = content.replace(/{{camelCaseName}}/g, camelCaseName);
    writeFileSync(filePath, content);
  });
}

function createPlugin() {
  rl.question('Enter plugin name (kebab-case): ', (pluginName) => {
    if (!pluginName.match(/^[a-z0-9]+(-[a-z0-9]+)*$/)) {
      console.error('Invalid plugin name. Please use kebab-case format.');
      process.exit(1);
    }

    const pluginDir = join('plugins', pluginName);

    if (existsSync(pluginDir)) {
      console.error(`Plugin directory ${pluginDir} already exists.`);
      process.exit(1);
    }

    // Create plugin directory and copy template
    mkdirSync(pluginDir, { recursive: true });
    copyTemplate(pluginName, pluginDir);

    console.log(`Successfully created plugin ${pluginName} in ${pluginDir}`);
    rl.close();
  });
}

createPlugin();
