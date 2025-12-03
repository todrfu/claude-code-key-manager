#!/usr/bin/env node

// Thin wrapper - bootstrap the TypeScript application
import('../dist/index.js')
  .then(({ main }) => {
    main(process.argv.slice(2)).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Failed to load CCK:', error);
    process.exit(1);
  });
