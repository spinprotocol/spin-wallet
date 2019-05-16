const Caver = require('caver-js');
const RPCURL = 'https://api.baobab.klaytn.net:8651';
const caver = new Caver(RPCURL);
const ethers = require('ethers');
const klay = caver.klay;
const _find = require('lodash.find');


function SpinWallet(wallet, encryptedKeyStoreFile) {
    this.wallet = null;
    this.isLocked = true;
    this.tokens = [];
    this.encryptedKeyStoreFile = encryptedKeyStoreFile || '';

    const ERC20_ABI = [
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "spender",
                    "type": "address"
                },
                {
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "from",
                    "type": "address"
                },
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "spender",
                    "type": "address"
                },
                {
                    "name": "addedValue",
                    "type": "uint256"
                }
            ],
            "name": "increaseAllowance",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "unpause",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "mint",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "burn",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "isPauser",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "paused",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "renouncePauser",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "from",
                    "type": "address"
                },
                {
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "burnFrom",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "addPauser",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "pause",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "addMinter",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "renounceMinter",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "spender",
                    "type": "address"
                },
                {
                    "name": "subtractedValue",
                    "type": "uint256"
                }
            ],
            "name": "decreaseAllowance",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "isMinter",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "name": "decimals",
                    "type": "uint8"
                },
                {
                    "name": "initialSupply",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "Paused",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "Unpaused",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "PauserAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "PauserRemoved",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "MinterAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "MinterRemoved",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        }
    ]

    _initWallet.call(this, wallet);

    function _initWallet(wallet) {
        /** wallet connect */
        klay.accounts.wallet.add(wallet)
        this.wallet = wallet;
        this.isLocked = false;
    }

    function _createERC20TokenContract(tokenAddress, address) {
        return new klay.Contract(ERC20_ABI, tokenAddress, { from: address })
    }

    function lock(password) {
        if(!this.encryptedKeyStoreFile) {
            this.encryptedKeyStoreFile = klay.accounts.encrypt(this.wallet.privateKey, password);
        }
        this.wallet = null;
        this.isLocked = true;
        this.tokens = [];
        return this.encryptedKeyStoreFile;
    }

    function unlock(password) {
        const wallet = klay.accounts.decrypt(this.encryptedKeyStoreFile, password);
        _initWallet(wallet);
        return true;
    }

    function isLocked() {
        return this.isLocked;
    }

    function getAddress() {
        if (this.isLocked) {
            throw new Error('Wallet is locked!');
        }
        return this.wallet.address;
    }

    function getPrivateKey() {
        if (this.isLocked) {
            throw new Error('Wallet is locked!');
        }
        return this.wallet.privateKey;
    }

    async function getKlayBalance() {
        if (this.isLocked) {
            return Promise.reject(new Error('Wallet is locked!'));
        }
        const balance = await klay.getBalance(this.wallet.address);
        return caver.utils.fromPeb(balance);
    }

    async function sendKlay(to, amount) {
        if (this.isLocked) {
            return Promise.reject(new Error('Wallet is locked!'));
        }
        const isAddress = caver.utils.isAddress(to)
        if (!isAddress) {
            return Promise.reject(new Error('Invalid Ethereum address!'))
        }

        const from = this.wallet.address;

        // // TODO how to gas amount? gas price is 25 Gpeb in default but I don't know gas limit
        const gas = 300000;
        const value = caver.utils.toPeb( amount.toString(), 'KLAY')
        return (await klay.sendTransaction({ from, to, gas, value }))
    }

    function getTokens() {
        return this.tokens;
    }

    function addToken(tokenAddress) {
        if (this.isLocked) {
            throw new Error('Wallet is locked!');
        }

        if (_find(this.tokens, token => token.address === tokenAddress)) {
            return;
        }

        let contract = _createERC20TokenContract(tokenAddress, this.wallet.address);
        let oneToken = ethers.utils.bigNumberify('10').pow(18);
         this.tokens.push({
            address: tokenAddress,
            contract,
            oneToken
        })
    }

    async function getTokenBalance(tokenAddress) {
        if (this.locked) {
            throw new Error('Wallet is locked!');
        }
        let token = _find(this.tokens, token => token.address === tokenAddress);
        if (!token) {
            return Promise.reject(new Error('Token does not exist!'));
        }
        const balance = await token.contract.methods.balanceOf(this.wallet.address).call();
        return caver.utils.fromPeb(balance);
    }

    async function sendToken(tokenAddress, to, amount) {
        if (this.isLocked) {
            return new Promise.reject(new Error('Wallet is locked!'));
        }

        let token = _find(this.tokens, token => token.address === tokenAddress);

        if (!token) {
            return Promise.reject(new Error('Token does not exist '))
        }

        const isAddress = caver.utils.isAddress(to)
        if (!isAddress) {
            return Promise.reject(new Error('Invalid Ethereum address!'))
        }
        amount = new ethers.utils.BigNumber(amount);
        amount = amount.mul(token.oneToken).toString(10);
        return (await token.contract.methods.transfer(to, amount).call())
    }


    return Object.freeze({
        lock: lock.bind(this),
        unlock: unlock.bind(this),
        isLocked: isLocked.bind(this),
        getPrivateKey: getPrivateKey.bind(this),
        getAddress: getAddress.bind(this),
        getKlayBalance: getKlayBalance.bind(this),
        sendKlay: sendKlay.bind(this),
        getTokens: getTokens.bind(this),
        addToken :addToken.bind(this),
        getTokenBalance: getTokenBalance.bind(this),
        sendToken: sendToken.bind(this)
    });
}

function createWallet() {
    return new SpinWallet(klay.accounts.create());
}

function restoreWalletFromPrivateKey(privateKey) {
    return new SpinWallet(klay.accounts.privateKeyToAccount(privateKey));
}

function restoreWalletFromVault(encryptedKeyStoreFile, password) {
    const wallet =  klay.accounts.decrypt(encryptedKeyStoreFile, password);
    return new SpinWallet(wallet);
}

module.exports = {
    SpinWallet,
    createWallet,
    restoreWalletFromPrivateKey,
    restoreWalletFromVault
}
