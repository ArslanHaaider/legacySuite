import { getPublicKey,signTransaction } from "@stellar/freighter-api";
import { useEffect, useState } from "react"
import {SorobanRpc,Address,BASE_FEE,TransactionBuilder,Networks,Transaction,xdr,Keypair,Contract,StrKey} from "@stellar/stellar-sdk"
import axios from "axios";
import { legacyContract } from "../../contractClass";
import { get } from "http";
import AddAsset from "./AddAsset";
 const AddAdmin = ()=>{
   const [userAddress,setUserAddress] = useState("");
   const handleUserAddress = (e) => {
    setUserAddress(e.target.value);
  };

 
  const addAdmin = async () => {
    const getAdminData = async () => {
      try {
        const adminData = await axios.get("/admin/Sign", {
          baseURL: "http://localhost:3000",
        });
        // console.log(adminData.data);
        return adminData.data;
      } catch (e) {
        console.log("Error in (getAdminDataFunc):" + e);
      }
    };
  
    let publicKey = await getPublicKey();
    const contractAddress =
    import.meta.env.VITE_CONTRACTADDRESS;
    const adminData  = await getAdminData();
    const adminAddres = new Address(adminData[2]);
    console.log(adminAddres.toString())
    console.log(adminAddres.toBuffer())
    const server = new SorobanRpc.Server(
      "https://soroban-testnet.stellar.org:443",
      {
        allowHttp: true,
      }
    );
    const myContract = new legacyContract(contractAddress);
    const operation = myContract.add_admin(adminAddres.toBuffer());
    const sourceAccount = await server.getAccount(publicKey);

    const builtTransaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(100)
      .build();

    const simulatedTx = await server.simulateTransaction(builtTransaction);
    const assembledTx = SorobanRpc.assembleTransaction(
      builtTransaction,
      simulatedTx
    ).build();
    console.log(assembledTx.hash())
    const transaction = await signTransaction(
      assembledTx.toEnvelope().toXDR("base64"),
      {
        networkPassphrase: Networks.TESTNET,
      }
    );
    const txEnvelope = xdr.TransactionEnvelope.fromXDR(transaction, "base64");
    console.log(txEnvelope.v1().signatures());
    const send = await server.sendTransaction(
      new Transaction(txEnvelope, Networks.TESTNET)
    );
    console.log(send.status);
  };
  


    return(
        <>
   
            <button onClick={addAdmin}>Add Admin</button>
            
        </>
    )
 }


 export default AddAdmin