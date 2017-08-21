SOLC=solc
S_FLAGS=--optimize --overwrite --abi --bin
CONTRACT_PATH=./contracts
OUTPUT=./compiledContracts

all: ebets coins arbiters

ebets:
	${SOLC} ${S_FLAGS} ${CONTRACT_PATH}/ebets.sol -o ${OUTPUT} 

coins:
	${SOLC} ${S_FLAGS} ${CONTRACT_PATH}/ERC20.sol -o ${OUTPUT}
	${SOLC} ${S_FLAGS} ${CONTRACT_PATH}/SimpleToken1.sol -o ${OUTPUT}
	${SOLC} ${S_FLAGS} ${CONTRACT_PATH}/SimpleToken2.sol -o ${OUTPUT}

arbiters:
	${SOLC} ${S_FLAGS} ${CONTRACT_PATH}/monarchy.sol -o ${OUTPUT}
	${SOLC} ${S_FLAGS} ${CONTRACT_PATH}/staticArbiter.sol -o ${OUTPUT}

clean:
	rm -Rf ./compiledContracts
