all:
	solc --optimize --overwrite ./contracts/ebets.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/monarchy.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/ERC20.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/SimpleToken.sol -o ./compiledContracts --abi --bin
