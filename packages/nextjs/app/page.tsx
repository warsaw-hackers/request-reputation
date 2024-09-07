"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import { useDebounce } from "react-use";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { usePinataRetrieveData } from "~~/hooks/usePinataRetrieveData";
import { truncateAddress } from "~~/utils";
import { handleTweet } from "~~/utils/twitter";

async function fetchNFTData(id: number) {
  const response = await fetch(`/api/get-nft/${id}`);
  console.log("🚀 ~ fetchNFTData ~ response:", response);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isSearchClick, setIsSearchClick] = useState(false);
  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(value);
    },
    500,
    [value],
  );
  const {
    data: balance,
    refetch: refetchUserNft,
    isFetching: isFetchingNFT,
  } = useScaffoldReadContract({
    contractName: "SlothShaming",
    functionName: "idOf",
    args: [value],
  });

  // const { data: nftUri, refetch: refetchNFTuri } = useScaffoldReadContract({
  //   contractName: "SlothShaming",
  //   functionName: "tokenURI",
  //   args: [balance],
  // });

  const {
    data: nftData,
    refetch: refetchNFTuri,
    isFetching: isFetchingNFTData,
  } = useQuery({
    queryKey: ["customData", Number(balance ?? 0)],
    queryFn: () => fetchNFTData(Number(balance ?? 0)),
    enabled: typeof balance == "bigint" && isSearchClick ? true : false,
  });
  const { data, isFetching } = usePinataRetrieveData(nftData?.animalData?.image!, value!, isSearchClick);

  console.log("🚀 ~ nftUri:", balance);
  console.log("🚀 ~ nftData:", nftData);
  useEffect(() => {
    refetchUserNft();
  }, [isSearchClick]);

  useEffect(() => {
    if (balance) {
      refetchNFTuri();
    }
  }, [balance]);

  // useEffect(() => {
  //   if (value) {
  //     const result = isAddress(value);
  //   }
  // }, [value]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 gap-6 text-white">
        {/* <label className="input input-bordered flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12C19 12.5523 18.5523 13 18 13C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11C18.5523 11 19 11.4477 19 12Z"
                fill="#1C274C"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.94358 3.25H13.0564C14.8942 3.24998 16.3498 3.24997 17.489 3.40314C18.6614 3.56076 19.6104 3.89288 20.3588 4.64124C21.2831 5.56563 21.5777 6.80363 21.6847 8.41008C22.2619 8.6641 22.6978 9.2013 22.7458 9.88179C22.7501 9.94199 22.75 10.0069 22.75 10.067C22.75 10.0725 22.75 10.0779 22.75 10.0833V13.9167C22.75 13.9221 22.75 13.9275 22.75 13.933C22.75 13.9931 22.7501 14.058 22.7458 14.1182C22.6978 14.7987 22.2619 15.3359 21.6847 15.5899C21.5777 17.1964 21.2831 18.4344 20.3588 19.3588C19.6104 20.1071 18.6614 20.4392 17.489 20.5969C16.3498 20.75 14.8942 20.75 13.0564 20.75H9.94359C8.10583 20.75 6.65019 20.75 5.51098 20.5969C4.33856 20.4392 3.38961 20.1071 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33856 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40314C6.65019 3.24997 8.10582 3.24998 9.94358 3.25ZM20.1679 15.75H18.2308C16.0856 15.75 14.25 14.1224 14.25 12C14.25 9.87756 16.0856 8.25 18.2308 8.25H20.1679C20.0541 6.90855 19.7966 6.20043 19.2981 5.7019C18.8749 5.27869 18.2952 5.02502 17.2892 4.88976C16.2615 4.75159 14.9068 4.75 13 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.75159 8.73851 2.75 10.0932 2.75 12C2.75 13.9068 2.75159 15.2615 2.88976 16.2892C3.02502 17.2952 3.27869 17.8749 3.7019 18.2981C4.12511 18.7213 4.70476 18.975 5.71085 19.1102C6.73851 19.2484 8.09318 19.25 10 19.25H13C14.9068 19.25 16.2615 19.2484 17.2892 19.1102C18.2952 18.975 18.8749 18.7213 19.2981 18.2981C19.7966 17.7996 20.0541 17.0915 20.1679 15.75ZM5.25 8C5.25 7.58579 5.58579 7.25 6 7.25H10C10.4142 7.25 10.75 7.58579 10.75 8C10.75 8.41421 10.4142 8.75 10 8.75H6C5.58579 8.75 5.25 8.41421 5.25 8ZM20.9235 9.75023C20.9032 9.75001 20.8766 9.75 20.8333 9.75H18.2308C16.8074 9.75 15.75 10.8087 15.75 12C15.75 13.1913 16.8074 14.25 18.2308 14.25H20.8333C20.8766 14.25 20.9032 14.25 20.9235 14.2498C20.936 14.2496 20.9426 14.2495 20.9457 14.2493L20.9479 14.2492C21.1541 14.2367 21.2427 14.0976 21.2495 14.0139C21.2495 14.0139 21.2497 14.0076 21.2498 13.9986C21.25 13.9808 21.25 13.9572 21.25 13.9167V10.0833C21.25 10.0428 21.25 10.0192 21.2498 10.0014C21.2497 9.99238 21.2495 9.98609 21.2495 9.98609C21.2427 9.90242 21.1541 9.7633 20.9479 9.75076C20.9479 9.75076 20.943 9.75043 20.9235 9.75023Z"
                fill="#1C274C"
              />
            </svg>
            <input
              value={value}
              onChange={({ currentTarget }) => {
                setValue(currentTarget.value);
              }}
              type="text"
              placeholder="Enter Wallet Address"
              className="input focus:border-0 w-full max-w-xs placeholder:text-white "
            />
          </label> */}
        <div className="flex flex-col gap-4 justify-center items-center">
          <Image
            src={`/assets/${nftData?.animalData ? nftData.animalData.name.toLowerCase() : "placeholder"}.svg`}
            height={200}
            width={200}
            alt="home-page"
          />
          <h1 className="text-[60px] tracking-tighter font-pixel">
            {nftData?.data ? truncateAddress(nftData.data) : "Enter Address"}
          </h1>
        </div>
        <div className="flex gap-4 flex-col justify-center items-center">
          <AddressInput onChange={setValue} value={value} placeholder="Input your address" />
          <button
            className="btn bg-[#FE8731] hover:bg-[#E16811] border-none text-white"
            // onClick={() => setIsSearchClick(true)}
            // disabled={isFetchingNFT && isFetchingNFTData}
            onClick={() => {
              handleTweet();
            }}
          >
            Shame
          </button>
        </div>
        {/* <h1>{debouncedValue}</h1> */}
        {/* {!isSignedUp && (
            <Link href={"/signup"}>
              <button className="btn btn-primary">Sign Up!</button>
            </Link>
          )} */}
        <div className="">
          <button
            onClick={() => {
              setIsSignedUp(false);
              cancel();
            }}
          ></button>
          {/* <div className="px-5">
            <div> {value}</div>
          </div> */}
          {/* <div className="card card-compact bg-base-100 w-96 shadow-xl">
            {data && (
              <div>
                <div className="flex p-3 py-6 text-center">
                  <figure>
                    <img src={`data:image/svg+xml;base64,${btoa(data)}`} alt="SVG from IPFS" className="w-24 h-24" />
                  </figure>
                  <div className="card-body text-center ">
                    <h2 className="card-title ">{nftData?.animalData?.name}</h2>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Buy Now</button>
                </div>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Home;
