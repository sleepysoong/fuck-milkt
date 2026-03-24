const fs = require('fs');

const packageJsonPath = 'package.json';
const packageLockPath = 'package-lock.json';
const gradlePath = 'android/app/build.gradle';

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const versionParts = packageJson.version.split('.').map(Number);

if (versionParts.length !== 3 || versionParts.some(Number.isNaN)) {
  throw new Error(`Unsupported version format: ${packageJson.version}`);
}

const nextVersion = `${versionParts[0]}.${versionParts[1] + 1}.0`;
packageJson.version = nextVersion;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
packageLock.version = nextVersion;
if (packageLock.packages && packageLock.packages['']) {
  packageLock.packages[''].version = nextVersion;
}
fs.writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);

let gradle = fs.readFileSync(gradlePath, 'utf8');
const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);

if (!versionCodeMatch) {
  throw new Error('Unable to find versionCode in android/app/build.gradle');
}

const nextVersionCode = Number(versionCodeMatch[1]) + 1;
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${nextVersionCode}`);
gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${nextVersion}"`);
fs.writeFileSync(gradlePath, gradle);

process.stdout.write(nextVersion);
