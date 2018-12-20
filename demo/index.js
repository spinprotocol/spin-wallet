
const spin = require('../index');

function query(el, selector) {
  if (!selector) {
      selector = el;
      el = document;
  }
  return Array.prototype.slice.call(el.querySelectorAll(selector));
}

function setEnter(source, target) {
  source.onkeyup = function(e) {
      if (e.which === 13) { target.click(); }
  }
}

var cancelScrypt = false;
document.getElementById('loading-cancel').onclick = function() {
  cancelScrypt = true;
};

var updateLoading = (function() {
  var loadingStatus = document.getElementById('loading-status');
  return (function(progress) {
      loadingStatus.value = (parseInt(progress * 100)) + '%';
      return cancelScrypt;
  });
})();

// JSON Wallet
(function() {
  var inputFile = document.getElementById('select-wallet-file');
  var targetDrop = document.getElementById('select-wallet-drop');
  var inputPassword = document.getElementById('select-wallet-password');
  var submit = document.getElementById('select-submit-wallet');

  function check() {
      if (inputFile.files && inputFile.files.length === 1) {
          submit.classList.remove('disable');
          targetDrop.textContent = inputFile.files[0].name;
      } else {
          submit.classList.add('disable');
      }
  }
  inputFile.onchange = check;
  inputPassword.oninput = check;

  setEnter(inputPassword, submit);

  inputFile.addEventListener('dragover', function(event) {
      event.preventDefault();
      event.stopPropagation();
      targetDrop.classList.add('highlight');
  }, true);

  inputFile.addEventListener('drop', function(event) {
      targetDrop.classList.remove('highlight');
  }, true);

  submit.onclick = function() {
      if (submit.classList.contains('disable')) { return; }

      var fileReader = new FileReader();
      fileReader.onload = function(e) {
          var json = e.target.result;

          if (json) {
              showLoading('Decrypting Wallet...');

              cancelScrypt = false;

              spin.restoreWalletFromVault(json, inputPassword.value, updateLoading).then(function(wallet) {
                  showWallet(wallet);

              }, function(error) {
                  if (error.message === 'invalid password') {
                      alert('Wrong Password');
                  } else {
                      console.log(error);
                      alert('Error Decrypting Wallet');
                  }
                  showSelect();
              });
          } else {
              alert('Unknown JSON wallet format');
          }
      };
      fileReader.readAsText(inputFile.files[0]);
  };

})();

// Raw Private Key
(function() {
  var inputPrivatekey = document.getElementById('select-privatekey');
  var submit = document.getElementById('select-submit-privatekey');

  function check() {
      if (inputPrivatekey.value.match(/^(0x)?[0-9A-fa-f]{64}$/)) {
          submit.classList.remove('disable');
      } else {
          submit.classList.add('disable');
      }
  }
  inputPrivatekey.oninput = check;

  setEnter(inputPrivatekey, submit);

  submit.onclick = function() {
      if (submit.classList.contains('disable')) { return; }
      var privateKey = inputPrivatekey.value;
      if (privateKey.substring(0, 2) !== '0x') { privateKey = '0x' + privateKey; }
      showWallet(spin.restoreWalletFromPrivateKey(privateKey));
  }
})();

// Mnemonic Phrase
(function() {
  var inputPhrase = document.getElementById('select-mnemonic-phrase');
  var submit = document.getElementById('select-submit-mnemonic');

  setEnter(inputPhrase, submit);

  submit.onclick = function() {
      if (submit.classList.contains('disable')) { return; }
      showWallet(spin.restoreWalletFromMnemonics(inputPhrase.value));
  }
})();


var activeWallet = null;

function showError(error) {
  alert('Error \u2014 ' + error.message);
}

// Refresh balance and transaction count in the UI
var refresh = (function() {
  var inputBalance = document.getElementById('wallet-balance');
  var submit = document.getElementById('wallet-submit-refresh');

  function refresh() {
      addActivity('> Refreshing details...');
      activeWallet.getEtherBalance('pending').then(function(balance) {
          addActivity('< Balance: ' + balance.toString(10));
          inputBalance.value = balance;
      }, function(error) {
          showError(error);
      });
  }
  submit.onclick = refresh;

  return refresh;
})();

var addActivity = (function() {
  var activity = document.getElementById('wallet-activity');
  return function(message, url) {
      var line = document.createElement('a');
      line.textContent = message;
      if (url) {
          line.setAttribute('href', url);
          line.setAttribute('target', '_blank');
      }
      activity.appendChild(line);
  }
})();

// Set up the wallet page
(function() {

  var inputTargetAddress = document.getElementById('wallet-send-target-address');
  var inputAmount = document.getElementById('wallet-send-amount');
  var submit = document.getElementById('wallet-submit-send');

  query('.network.option').forEach(function(el) {
      var network = el.getAttribute('data-network');
      el.onclick = function() {
          addActivity('! Switched network: ' + network);
          activeWallet.connect(network);
          query('.network.option.selected').forEach(function(el) {
              el.classList.remove('selected');
          });
          el.classList.add('selected');
          refresh();
      };
  });

  // Send ether
  submit.onclick = function() {
      activeWallet.sendEther(
          inputTargetAddress.value,
          inputAmount.value,
      ).then(function(tx) {
          console.log(tx);

          // Since we only use standard networks, network will always be known
          var tag = activeWallet.wallet.provider.network.name + '.';
          if (tag === 'homestead.') { tag = ''; }
          var url = 'https://' + tag + 'etherscan.io/tx/' + tx.hash;
          addActivity('< Transaction sent: ' + tx.hash.substring(0, 20) + '...', url);
          alert('Success!');

          inputTargetAddress.value = '';
          inputAmount.value = '';
          submit.classList.add('disable');

          refresh();
      }, function(error) {
          console.log(error);
          showError(error);
      });
  }
})();

function showSelect() {
  document.getElementById('screen-select').style.display = 'block';
  document.getElementById('screen-loading').style.display = 'none';
  document.getElementById('screen-wallet').style.display = 'none';
}

function showLoading(title) {
  document.getElementById('screen-select').style.display = 'none';
  document.getElementById('screen-loading').style.display = 'block';
  document.getElementById('screen-wallet').style.display = 'none';

  document.getElementById('loading-header').textContent = title;
}

function showWallet(wallet) {
  var network = document.querySelector('.network.option.selected').getAttribute('data-network');
  activeWallet = wallet;
  wallet.connect(network);

  document.getElementById('screen-select').style.display = 'none';
  document.getElementById('screen-loading').style.display = 'none';
  document.getElementById('screen-wallet').style.display = 'block';

  var inputWalletAddress = document.getElementById('wallet-address');
  inputWalletAddress.value = wallet.getAddress();
  inputWalletAddress.onclick = function() {this.select();};

  refresh();
}
