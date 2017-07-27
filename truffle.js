module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "42",
      gas: 4100000,
      gasPrice: 5010000004,
      from: "0x82De95A2c2805731a404C4F652514929cdB463bb"
    }
  }
};
