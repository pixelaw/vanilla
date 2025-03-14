// switchDependencies.js
const fs = require('fs');
const path = require('path');

const useSubmodules = process.argv.includes('--submodule');

const packageJsonPath = path.join(__dirname, 'package.json');
const workspaceYamlEnabled = path.join(__dirname, 'pnpm-workspace.disabled.yaml');
const workspaceYamlDisabled = path.join(__dirname, 'pnpm-workspace.yaml');
const packageJson = require(packageJsonPath);


const submodulePaths = {
    "@pixelaw/core": "workspace:*",
    "@pixelaw/core-dojo": "workspace:*",
    "@pixelaw/core-mud": "workspace:*",
    "@pixelaw/react": "workspace:*",
    "@pixelaw/react-dojo": "workspace:*",
};

if (useSubmodules) {
    Object.keys(submodulePaths).forEach(dep => {
        packageJson.dependencies[dep] = submodulePaths[dep];
    });
    // Rename to enable submodules
    if (fs.existsSync(workspaceYamlDisabled)) {
        fs.renameSync(workspaceYamlDisabled, workspaceYamlEnabled);
    }
} else {
    // Revert to regular versions
    packageJson.dependencies["@pixelaw/core"] = "^0.6.7";
    packageJson.dependencies["@pixelaw/core-dojo"] = "^0.6.7";
    packageJson.dependencies["@pixelaw/core-mud"] = "^0.6.7";
    packageJson.dependencies["@pixelaw/react"] = "^0.6.7";
    packageJson.dependencies["@pixelaw/react-dojo"] = "^0.6.7";


    if (fs.existsSync(workspaceYamlEnabled)) {
        fs.renameSync(workspaceYamlEnabled, workspaceYamlDisabled);
    }
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`Switched to ${useSubmodules ? 'submodules' : 'regular'} dependencies.`);
