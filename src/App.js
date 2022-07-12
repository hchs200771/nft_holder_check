import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import styled from 'styled-components';
import { contractAddress, contractABI } from './config/contract';
import Web3Modal from "web3modal";
import WalletConnect from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: "27e484dcd9e3efcfd25a83a78777cdf1" // required
    }
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

function App() {
  const [currentAccount, setCurrentAccount] = useState()
  const [contract, setContract] = useState()
  const [name, setName] = useState('')
  const [catNumber, setCatNumber] = useState(0)
  const [catIds, setCatIds] = useState([])
  const [catImages, setCatImages] = useState([])

  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();

  // connect account
  const connectWallet = async () => {
    const updateCurrentAccounts = accounts => {
      const [_account] = accounts;
      setCurrentAccount(_account);
    }

    try {
      const provider = await web3Modal.connect();
      provider.request({ method: 'eth_requestAccounts' }).then(updateCurrentAccounts);
      provider.on("accountsChanged", updateCurrentAccounts);
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) setCurrentAccount(accounts[0]);
      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  };

  // setContract
  useEffect(() => {
    if (!library) { return; }
    const signer = library.getSigner();
    library.getBlock().then(block => {
      const _contract = new ethers.Contract(contractAddress, contractABI, library, {
        gasLimit: block.gasLimit
      });
      setContract(_contract.connect(signer));
    })
  }, [library])

  // get project name and nft id
  useEffect(() => {
    contract?.name().then(setName)
    contract?.balanceOf(currentAccount).then((num) => {
      setCatNumber(Number(num))
    })
    setCatIds([])
    setCatImages([])
  }, [contract, currentAccount])

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
        <h2> <span className='project_name'>呢喃貓</span> 認證工具</h2>
        <p> 智能合約地址: { contractAddress } </p>
        {
          currentAccount ?
          (
            <div>
              <CurrentAccount>持有者錢包地址：{currentAccount}</CurrentAccount>
              <p> 持有數量: <Count>{ catNumber } </Count>隻</p>
              <NFTId>
              {
                catIds.length === 0 ?
                  `你沒有 ${name} 喔` :
                  (`${name} id: ${ catIds.join(', ') }`)
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
              <Button className="enableEthereumButton" onClick={connectWallet}>connect wallet</Button>
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
