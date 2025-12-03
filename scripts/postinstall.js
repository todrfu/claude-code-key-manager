#!/usr/bin/env node
import { execSync } from 'child_process';
import { platform } from 'os';

function checkFzf() {
  try {
    execSync('which fzf', { stdio: 'ignore' });
    console.log('✅ fzf is already installed');
    return true;
  } catch {
    return false;
  }
}

function installFzf() {
  const os = platform();
  console.log('📦 Installing fzf...');

  try {
    if (os === 'darwin') {
      // macOS - use Homebrew
      execSync('brew install fzf', { stdio: 'inherit' });
    } else if (os === 'linux') {
      // Linux - try apt-get or yum
      try {
        execSync('sudo apt-get install -y fzf', { stdio: 'inherit' });
      } catch {
        execSync('sudo yum install -y fzf', { stdio: 'inherit' });
      }
    } else if (os === 'win32') {
      // Windows - use Chocolatey or Scoop
      try {
        execSync('choco install fzf -y', { stdio: 'inherit' });
      } catch {
        execSync('scoop install fzf', { stdio: 'inherit' });
      }
    }
    console.log('✅ fzf installed successfully');
  } catch (error) {
    console.warn('⚠️  Failed to install fzf automatically.');
    console.warn('Please install fzf manually:');
    console.warn('  macOS:   brew install fzf');
    console.warn('  Linux:   sudo apt-get install fzf');
    console.warn('  Windows: choco install fzf');
    console.warn('\nCCK will use fallback selector if fzf is unavailable.');
  }
}

if (!checkFzf()) {
  installFzf();
}
