import './App.css';
import React from 'react';
import { contractAddress, contractABI } from './config/contract'

const { useEffect, useState } = React;

function App() {
  const [wallet, setWallet] = useState()
  const [currentAccount, setCurrentAccount] = useState()

  // set chain and wallet
  useEffect(() => {
    if (window.ethereum) {
      // const updateCurrentAccounts = accounts => {
      //   const [_account] = accounts;
      //   setCurrentAccount(_account);
      // }
      const button = document.querySelector('.enableEthereumButton')
      button.addEventListener('click', async () => {
        let address = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setWallet(address)
        console.log(address[0])
      })
      window.ethereum.on('chainChanged', (_chainId) => {
        if(_chainId !== '0x1') alert('請使用以太鏈主網')
      });
    } else {
      alert("請安裝 metamask")
    }
  }, [])

  //

  return (
    <div className="App">
      <div className='container'>
        <h1> NFT 認證工具</h1>
        <h2> 項目地址: { contractAddress } </h2>
        <h3>
          <span>{ wallet ? `錢包地址：${wallet}` : "請先連結錢包" } </span>
        </h3>
        { wallet ? '' : <button className="enableEthereumButton">connect wallet</button> }
      </div>
    </div>
  );
}

export default App;
