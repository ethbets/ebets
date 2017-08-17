all:
	solc --optimize --overwrite ./contracts/ebets.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/monarchy.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/ERC20.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/SimpleToken1.sol -o ./compiledContracts --abi --bin
	solc --optimize --overwrite ./contracts/SimpleToken2.sol -o ./compiledContracts --abi --bin
