import React, { FormEvent } from "react";
import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useState } from "react";

import { useMultistepForm } from "./useMultistepForm";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

const getUserTokens = async (address: any) => {
  const tokenMetadata: any = [];
  const balances = await alchemy.core.getTokenBalances(address);

  // Remove tokens with zero balance
  const nonZeroBalances = balances.tokenBalances.filter((token) => {
    return token.tokenBalance !== "0";
  });
  for (let token of nonZeroBalances) {
    // Get balance of token
    let balance: number = token.tokenBalance as unknown as number;

    // Get metadata of token
    const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

    // Compute token balance in human-readable format
    balance = balance / Math.pow(10, metadata.decimals as number);
    balance = balance.toFixed(2) as unknown as number;
    tokenMetadata.push({
      name: metadata.name,
      symbol: metadata.symbol,
      balance: balance,
      decimals: metadata.decimals,
      logo: metadata.logo,
      address: token.contractAddress,
    });
  }
  return tokenMetadata;
};

type FormData = {
  buyerAddress: string;
  sellerTokenAddress: string;
  sellerTokenAmount: string;
  buyerTokenAddress: string;
  buyerTokenAmount: string;
  datePeriod: string;
  timePeriod: string;
};

const INITIAL_DATA: FormData = {
  buyerAddress: "",
  sellerTokenAddress: "",
  sellerTokenAmount: "",
  buyerTokenAddress: "",
  buyerTokenAmount: "",
  datePeriod: "",
  timePeriod: "",
};

export default function MultiPartForm() {
  const { address } = useAccount();
  type BuyerAddressType = {
    buyerAddress: string;
  };
  type SellerTokenAddressType = {
    sellerTokenAddress: string;
    sellerTokenAmount: string;
  };
  type BuyerTokenAddressType = {
    buyerTokenAddress: string;
    buyerTokenAmount: string;
  };
  type TimePeriodType = {
    datePeriod: string;
    timePeriod: string;
  };

  type FormProps1 = BuyerAddressType & {
    updateFields: (fields: Partial<FormData>) => void;
  };
  type FormProps2 = SellerTokenAddressType & {
    updateFields: (fields: Partial<FormData>) => void;
  };
  type FormProps3 = BuyerTokenAddressType & {
    updateFields: (fields: Partial<FormData>) => void;
  };
  type FormProps4 = TimePeriodType & {
    updateFields: (fields: Partial<FormData>) => void;
  };

  type FormWrapperProps = {
    title: string;
    children: React.ReactNode;
  };

  // const [sellerTokenMetadata, setSellerTokenMetadata] = useState<any>([]);
  // await getUserTokens(address).then((data) => setSellerTokenMetadata(data));
  const [data, setData] = useState(INITIAL_DATA);

  function updateFields(fields: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...fields }));
    console.log(data);
  }

  function FormWrapper({ title, children }: FormWrapperProps) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-lg text-center m-0 mb-2">{title}</h3>
        <div className="grid gap-1 justify-start grid-col"> {children}</div>
      </div>
    );
  }
  const BuyerAddress = ({ buyerAddress }: FormProps1) => (
    <FormWrapper title="Counter Party Address">
      <label>Buyer Address</label>
      <input
        autoFocus
        type="text"
        name="buyerAddress"
        required
        value={buyerAddress}
        onChange={(e) => updateFields({ buyerAddress: e.target.value })}
      />
    </FormWrapper>
  );

  const SellerTokenAddress = ({
    sellerTokenAddress,
    sellerTokenAmount,
  }: FormProps2) => (
    <FormWrapper title="Seller Token Details">
      <label>Seller Token Address</label>
      <input
        autoFocus
        type="text"
        name="sellerTokenAddress"
        required
        value={sellerTokenAddress}
        onChange={(e) => updateFields({ sellerTokenAddress: e.target.value })}
      />
      {/* <select
        value={sellerTokenAddress}
        onChange={(e) => updateFields({ sellerTokenAddress: e.target.value })}
      >
        {sellerTokenMetadata.map((token: any) => (
          <option value={token.address}>{token.name}</option>
        ))}
      </select> */}
      <label>Seller Token Amount</label>
      <input
        autoFocus
        type="text"
        name="sellerTokenAmount"
        required
        value={sellerTokenAmount}
        onChange={(e) => updateFields({ sellerTokenAmount: e.target.value })}
      />
    </FormWrapper>
  );

  const BuyerTokenAddress = ({
    buyerTokenAddress,
    buyerTokenAmount,
  }: FormProps3) => (
    <FormWrapper title="Buyer Token Details">
      <label>Buyer Token Address</label>
      <input
        autoFocus
        type="text"
        name="buyerTokenAddress"
        required
        value={buyerTokenAddress}
        onChange={(e) => updateFields({ buyerTokenAddress: e.target.value })}
      />
      <label>Buyer Token Amount</label>
      <input
        autoFocus
        type="text"
        name="buyerTokenAmount"
        required
        value={buyerTokenAmount}
        onChange={(e) => updateFields({ buyerTokenAmount: e.target.value })}
      />
    </FormWrapper>
  );

  const TimePeriod = ({ datePeriod, timePeriod }: FormProps4) => (
    <FormWrapper title="Time Period">
      <label>Expiry Date</label>
      <input
        autoFocus
        type="date"
        name="datePeriod"
        required
        value={datePeriod}
        onChange={(e) => updateFields({ datePeriod: e.target.value })}
      />
      <label>Expiry Time</label>
      <input
        autoFocus
        type="time"
        name="timePeriod"
        required
        value={timePeriod}
        onChange={(e) => updateFields({ timePeriod: e.target.value })}
      />
    </FormWrapper>
  );

  const { steps, currentStepindex, isFirstStep, back, next, isLastStep, step } =
    useMultistepForm([
      <BuyerAddress {...data} updateFields={updateFields} />,
      <SellerTokenAddress {...data} updateFields={updateFields} />,
      <BuyerTokenAddress {...data} updateFields={updateFields} />,
      <TimePeriod {...data} updateFields={updateFields} />,
    ]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLastStep) return next();
    alert("Successful Settlement Added!");
  }

  return (
    <div>
      <form
        className="flex items-center justify-center py-5 "
        onSubmit={onSubmit}
      >
        <div className="w-[310px] h-[470px] bg-text rounded-md flex flex-col border-[1px] px-[15px]">
          <h3 className="py-5">Create New Settlement</h3>
          {step}
          <div className="mt-1 flex gap-1 justify-end">
            {!isFirstStep && (
              <button type="submit" onClick={back}>
                Back
              </button>
            )}
            <button type="submit">{isLastStep ? "Finish" : "Next"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
