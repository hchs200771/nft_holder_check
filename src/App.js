import './App.css';
import React from 'react';
import { ethers } from "ethers";
import styled from 'styled-components';
import { contractAddress, contractABI } from './config/contract'

const { useEffect, useState } = React;

function App() {
  const [currentAccount, setCurrentAccount] = useState()
  const [contract, setContract] = useState()
  const [name, setName] = useState()
  const [catNumber, setCatNumber] = useState(0)
  const [catIds, setCatIds] = useState([])
  const [catImages, setCatImages] = useState([])

  // set chain and account
  useEffect(() => {
    const updateCurrentAccounts = accounts => {
      const [_account] = accounts;
      setCurrentAccount(_account);
    }
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(updateCurrentAccounts);
    window.ethereum.on("accountsChanged", updateCurrentAccounts);

    return (() => {
      window.ethereum.off('accountsChanged', updateCurrentAccounts);
    })
  }, [])

  // setContract
  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    provider.getBlock().then(block => {
      const _contract = new ethers.Contract(contractAddress, contractABI, provider, {
        gasLimit: block.gasLimit
      });
      setContract(_contract.connect(signer));
    })
  }, [])

  // get project name and nft number and ids
  useEffect(() => {
    contract?.name().then(setName)
    contract?.balanceOf(currentAccount).then((num) => {
      setCatNumber(Number(num))
    })
  }, [contract])

  useEffect(()=>{
    if (catNumber === 0) { return; }
    for (let i = 0; i < catNumber; i++) {
      contract.tokenOfOwnerByIndex(currentAccount, i)
        .then((cat_id) => {
          setCatIds((catIds) => {
            return [...catIds,  Number(cat_id)]
          })
        })
    }
  }, [catNumber])

  useEffect(()=> {
    if (catNumber !== catIds.length) { return; }
    for (let i = 0; i < catIds.length; i++) {
      fetch(`https://api.murmurcats.club/metadata/${catIds[i]}`)
        .then(res => res.json()).then(({image}) => {
          setCatImages((catImages) => {
            return [...catImages, image]
          })
        });
    }
  }, [catIds.length])

  return (
    <div className="App">
        { contract ? (
          <h2> <span className='project_name'>{name}</span> 認證工具</h2>
        ) : ''
        }
        <span>{ currentAccount ? (`持有者錢包地址：${currentAccount}`) : "請先連結錢包" } </span>
        <p> 智能合約地址: { contractAddress } </p>
        <p> 持有 {name} 數量: <Count>{ catNumber } </Count>隻</p>
        <NFTId>
        {
          catIds.length === 0 ?
            `你沒有 ${name} 喔` :
            (`持有 id: ${ catIds.join(', ') }`)
        }
        </NFTId>
        <Gallery>
          {
            catImages?.map((nft, i) => (
              <div key={i}>
                <img src={nft} />
                <p>第 {i + 1} 隻貓咪</p>
              </div>
            ))
          }
        </Gallery>
    </div>
  );
}

const Count = styled.span`
  color: red;
`

const NFTId = styled.p`
  color: yellow;
`

const Gallery = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`

export default App;
