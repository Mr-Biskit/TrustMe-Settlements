import React from "react";

import { useAccount } from "wagmi";
import MultiPartForm from "@/components/elements/Gabe/MultiPartForm";

export default function () {
  const { address, isConnecting, isDisconnected } = useAccount();
  console.log(address);
  return (
    <div>
      <MultiPartForm />
    </div>
  );
}
