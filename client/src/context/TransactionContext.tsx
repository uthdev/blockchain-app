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
  transactions: Transaction[],
  isLoading: boolean,
}

export interface Transaction {
  addressTo: string;
  addressFrom: string;
  timestamp: string | number;
  message: string;
  keyword: string;
  amount: string;
  url: string;
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

const getEthereumContract = (): ethers.Contract => {
  const provider =  new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

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
  const [transactions, setTransactions] = useState([] as Transaction[])


  const handleChange = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prevState) => ({...prevState, [name]: e.target.value }))
  }


  const getAllTransactions = async () => {
    try {
      if(!ethereum) return alert("Please install metamask");

      const transactionContract = getEthereumContract();
      console.log(transactionContract);
      
      const availableTransactions = await transactionContract.getAllTransactions();

      const structuredTransactions: Transaction[] = availableTransactions.map((transaction: Record<string, any>) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }))
      console.log(availableTransactions)
      
      console.log(structuredTransactions)
      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
      
    }
  }
  
  const checkIfWalletIsConnected = async () => {
    try {
      if(!ethereum) return alert("Please install metamask");
  
      const accounts = await ethereum.request({ method: 'eth_accounts'});
      
      if(accounts.length) {
        setConnectedAccount(accounts[0]);
  
        getAllTransactions();
      } else {
        console.log("No account found");
      }
    } catch (error) {
      console.log(error);
      
      throw new Error("No ethereum object.");
    }
  }

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();
      console.log(transactionCount);
      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);
      
      throw new Error("No ethereum object.")
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

    const transactionHash = await transactionContract.addtoBlockchain(addressTo, parsedAmount, message, keyword);

    setIsLoading(true);
    console.log(`Loading - ${transactionHash.hash}`)

    await transactionHash.wait();
    
    setIsLoading(false);
    console.log(`Success - ${transactionHash.hash}`);
    
    const transactionCount = await transactionContract.getTransactionCount();
    setTransactionCount(transactionCount.toNumber());

    window.location.reload();
    } catch (error) {
      console.log(error);
      
      throw new Error("No ethereum object.")
    }
  }
  
  
  
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, [])

  return (
    <TransactionContext.Provider value={{ connectWallet, connectedAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading }}>
      { children }
    </TransactionContext.Provider>
  )
}

