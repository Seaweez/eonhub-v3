import { providers } from "ethers";
import { sign as web3TokenSign } from "web3-token";
import ethers from "ethers";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useEthers } from "@usedapp/core";
import UserService from "../services/user.service";
import { web3TokenAtom, GoogleAuthUserInfoAtom, eonhubUserDetailAtom } from "@/atoms/eonhub"; 

export const useWalletSigner = (
  provider: providers.Web3Provider | undefined
) => {
  const { account } = useEthers();
  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const [web3Token, setWeb3Token] = useAtom(web3TokenAtom);
  const [googleAuth,] = useAtom(GoogleAuthUserInfoAtom);
  const [eonhubUserDetail, setEonhubUserDetail] = useAtom(eonhubUserDetailAtom);
  //   const userService = new UserService();
  //   const userCookie: ROP2E_COOKIE_INTERFACE = cookie["eonhub-auth"];
  const userService = new UserService();
  const userCookie: any = cookie["eonhub-auth"];

  const updateUserCredentialsByWeb3 = useCallback(() => {
    userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, setEonhubUserDetail);
  }, [web3Token]);

  const sign = useCallback(async () => {
    if (!provider)
      throw new Error("Ethers provider not found (Wallet not connect");
    const signer = provider.getSigner();
    const token = await web3TokenSign(
      async (msg) => await signer.signMessage(msg),
      "30d"
    );
    setWeb3Token(token || "");
    return token;
  }, [provider]);

  return { sign, updateUserCredentialsByWeb3 };
};
