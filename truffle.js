module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "42",
      gas: 4100000,
      gasPrice: 5010000004 
    }
  }
};
