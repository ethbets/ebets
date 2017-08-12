all:
	solc --optimize --overwrite ./contracts/ebets.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/monarchy.sol -o ./compiledContracts --abi --bin
