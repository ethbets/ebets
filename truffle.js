require('babel-register');
require('babel-polyfill');

const path      = require('path');
const basePath  = process.cwd();

const buildDir          = path.join(basePath, 'build');
const buildDirContracts = path.join(basePath, 'build/contracts');
const srcDir            = path.join(basePath, 'contracts');
const testDir           = path.join(basePath, 'test');
const migrationsDir     = path.join(basePath, 'migrations');

module.exports = {
  mocha: {
    useColors: true
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    coverage: {
      host: 'localhost',
      network_id: 4447,
      port: 8555,
      gasPrice: 1,
      gas: 100000000
      // ,
      // gas: 0xfffffffffff,
      // gasPrice: 0x01
    }
  },
  build_directory: buildDir,
  contracts_build_directory: buildDirContracts,
  migrations_directory: migrationsDir,
  contracts_directory: srcDir,
  test_directory: testDir
};
