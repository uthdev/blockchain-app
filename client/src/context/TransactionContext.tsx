import React, { useState, useEffect, ChangeEvent } from "react";
import { ethers } from 'ethers';

import { contractABI, contractAddress } from "../utils/constants";

interface ContextProviderProps {
  children: React.ReactNode
}

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

interface TransactionContextInterface {
  connectWallet: () => {},
  connectedAccount: string;
  formData: FormDataTypes,
  setFormData: (c: FormDataTypes) => void,
  handleChange: (e: ChangeEvent<HTMLInputElement>, name: string) => void;
  sendTransaction: () => void;
}

type FormDataTypes = {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
}

export const TransactionContext = React.createContext<TransactionContextInterface>({} as TransactionContextInterface);
// window.ethereum
const { ethereum } = window;

const getEthereumContract = () => {
  const provider =  new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

  console.log({
    provider,
    signer,
    transactionContract
  });

  return transactionContract;
}


export const TransactionProvider = ({ children }: ContextProviderProps) => {
  const [connectedAccount, setConnectedAccount] = useState<string>("")
  const [formData, setFormData] = useState<FormDataTypes>({
    addressTo: '',
    amount: '',
    keyword: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount")); 

  const handleChange = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prevState) => ({...prevState, [name]: e.target.value }))
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if(!ethereum) return alert("Please install metamask");
  
      const accounts = await ethereum.request({ method: 'eth_accounts'});
      
      if(accounts.length) {
        setConnectedAccount(accounts[0]);
  
        //getAllTransactions()
      } else {
        console.log("No account found");
      }
    } catch (error) {
      console.log(error);
      
      throw new Error("No ethereum object.");
    }
  }

  const connectWallet = async () => {
    try {
      if(!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({ method: 'eth_requestAccounts'});
      setConnectedAccount(accounts[0])
    } catch (error) {
      console.log(error);
      
      throw new Error("No ethereum object.")
    }
  }

  const sendTransaction = async () => {
    try {
      if(!ethereum) return alert("Please install metamask");
      //get the data from the form

    const { addressTo, amount, keyword, message } = formData;

    const transactionContract = getEthereumContract();
    const parsedAmount = ethers.utils.parseEther(amount);

    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: connectedAccount,
        to: addressTo,
        gas: '0x5208', //21000 GWEI
        value: parsedAmount._hex,
      }]
    });

    const transactionHash = await transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);

    setIsLoading(true);
    console.log(`Loading - ${transactionHash.hash}`)

    await transactionHash.wait();
    
    setIsLoading(false);
    console.log(`Success - ${transactionHash.hash}`);
    
    const transactionCount = await transactionContract.transactionCount();
    setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      
      throw new Error("No ethereum object.")
    }
  }
  
  
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <TransactionContext.Provider value={{ connectWallet, connectedAccount, formData, setFormData, handleChange, sendTransaction }}>
      { children }
    </TransactionContext.Provider>
  )
}

