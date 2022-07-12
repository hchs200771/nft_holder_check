import './App.css';
import React from 'react';
import { ethers } from "ethers";
import styled from 'styled-components';
import { contractAddress, contractABI } from './config/contract'

const { useEffect, useState } = React;

function App() {
  const [currentAccount, setCurrentAccount] = useState()
  const [contract, setContract] = useState()
  const [name, setName] = useState('')
  const [catNumber, setCatNumber] = useState(0)
  const [catIds, setCatIds] = useState([])
  const [catImages, setCatImages] = useState([])


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

  // set chain and account
  const connectAccount = () => {
    const updateCurrentAccounts = accounts => {
      const [_account] = accounts;
      setCurrentAccount(_account);
      setCatNumber(0)
      setCatIds([])
      setCatImages([])
    }

    window.ethereum.request({ method: 'eth_requestAccounts' }).then(updateCurrentAccounts);
    window.ethereum.on("accountsChanged", updateCurrentAccounts)
  }


  // get project name
  useEffect(() => {
    contract?.name().then(setName)
  }, [contract])


  // get nft number
  useEffect(() => {
    contract?.balanceOf(currentAccount).then((num) => {
      setCatNumber(Number(num))
    })
  }, [currentAccount])

  // get nft ids
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

  // get nft images
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
        {
          contract ? (
            <h2> <span className='project_name'>{name}</span> 認證</h2>
          ) : ''
        }
        <p> 智能合約地址: { contractAddress } </p>
        {
          currentAccount ?
          (
            <div>
              <CurrentAccount>持有者錢包地址：{currentAccount}</CurrentAccount>
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
          ) :
          (
            <div>
              <span>請先連結錢包</span>
              <Button className="enableEthereumButton" onClick={connectAccount}>connect wallet</Button>
            </div>
          )
        }
    </div>
  );
}

const Button = styled.button`
  display: inline-block;
  cursor: pointer;
  padding: 15px 15px;
  margin: 10px 10px;
  text-align: center;
  text-weight: 700;
  color: #f1c40f;
  border: 2px solid #f1c40f;
  text-transform: uppercase;
  background-color: rgba(0,0,0,0);
  &:focus{
    outline: none;
  }
`

const Count = styled.span`
  color: red;
`

const CurrentAccount = styled.span`
  color: #f1c40f;
  font-size: 0.5 em;
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
