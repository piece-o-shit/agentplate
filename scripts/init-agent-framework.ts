import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function initAgentFramework() {
  try {
    console.log('Initializing agent framework...');

    // Build the agent framework package
    console.log('Building agent framework...');
    execSync('npm run build', {
      cwd: path.join(process.cwd(), 'packages/agent-framework'),
      stdio: 'inherit'
    });

    // Link the package locally
    console.log('Linking agent framework package...');
    execSync('npm link', {
      cwd: path.join(process.cwd(), 'packages/agent-framework'),
      stdio: 'inherit'
    });

    // Link the package in the main project
    console.log('Installing agent framework in main project...');
    execSync('npm link @agentplate/agent-framework', {
      stdio: 'inherit'
    });

    // Add the package to package.json if not already present
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.dependencies['@agentplate/agent-framework']) {
      packageJson.dependencies['@agentplate/agent-framework'] = 'workspace:*';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Create database tables
    console.log('Setting up agent database tables...');
    execSync('npm run setup-agent-tables', {
      stdio: 'inherit'
    });

    console.log('Agent framework initialization complete!');
    console.log('\nYou can now import the agent framework:');
    console.log('import { createAgent } from \'@agentplate/agent-framework\';');

  } catch (error) {
    console.error('Error initializing agent framework:', error);
    process.exit(1);
  }
}

initAgentFramework().catch(console.error);
