
import cookie from "cookie";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import axios, { AxiosInstance } from "axios";
import { useCookies } from "react-cookie";
import { eonhubApiCreate } from "../axios";
import { RO_ZERO_PC_GAME_ID, SEAL_METAVERSE_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from "@/types/eonhub";
import { toast } from "react-toastify";

export interface EONHUB_COOKIE_INTERFACE extends USER_LOGIN_INTERFACE {
  accountId: number;
  token: string;
  username: string;
  // walletAddress: string | null;
}

export interface IUserInfo {
  token: string;
  username: string;
  accountId: string;
  walletAddress: string;
}

export const sUserInfo = atomWithStorage("userInfo", {
  token: "",
  username: "",
  accountId: "",
  walletAddress: "",
});

export interface USER_LOGIN_INTERFACE {
  user: {
    accountId: number;
    userid: string;
    sex: string;
    email: string;
    groupId: number;
    state: number;
    unbanTime: number;
    expirationTime: number;
    logincount: number;
    lastlogin: string;
    lastIp: string;
    birthdate: string;
    characterSlots: number;
    vipTime: number;
    oldGroup: number;
  };
  walletAddress: string | null;
}

export const USER_LOGIN_INTERFACEInitialState = {
  user: {
    accountId: 0,
    userid: "",
    sex: "",
    email: "",
    groupId: 0,
    state: 0,
    unbanTime: 0,
    expirationTime: 0,
    logincount: 0,
    lastlogin: "",
    lastIp: "",
    birthdate: "",
    characterSlots: 0,
    vipTime: 0,
    oldGroup: 0,
  },
  walletAddress: "",
};

export interface BindingWalletSuccessResponse {
  accountId: number;
  createdAt: string;
  walletAddress: string;
}

export const recaphaTokenAtom = atom("");
export const errorMessageAtom = atom("");

export function parseCookies(req: any) {
  // console.log("req: ", req);
  // console.log('window: ',window);
  return cookie.parse(req ? req.headers.cookie || "" : "");
}
//create user service class
class UserService {
  private axiosInstance: AxiosInstance;
  private userInfo: IUserInfo;
  private userCookie: EONHUB_COOKIE_INTERFACE;
  private token: string;

  constructor() {
    const [cookie, setCookie] = useCookies(["eonhub-auth"]);
    this.userInfo = cookie["eonhub-auth"];
    this.userCookie = cookie["eonhub-auth"];
    this.token = this.userCookie?.token
    this.axiosInstance = eonhubApiCreate(this.token);
  }

  public fetchUserInfo(token: string, setCookie: Function, removeCookie: Function, setEonhubUserDetail: Function) {
    return token && new Promise((resolve, reject) => {
      const req = this.axiosInstance
        .get(`/api/user/detail`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data.data;
          if (!payload) return;
          setCookie(
            "eonhub-auth",
            JSON.stringify(
              { ...this.userCookie, ...payload, token }
            ),
            {
              path: "/",
              maxAge: 3600 * 1000, // Expires after 1hr
              sameSite: true,
              expires: new Date(Date.now() + 3600 * 1000)
            }
          );
          resolve(response);
        })
        .catch((error) => {
          removeCookie("eonhub-auth");
          reject(error);
        });
      return req
    });


  }

  public registerZeroRefCode(token: string, googleToken: string) {
    return token && new Promise((resolve, reject) => {
      const req = this.axiosInstance
        .post(`/api/ref/register`, { 
            "gameId": `${ZERO_ETERNAL_LOVE_GAME_ID}`,
            "refCode": "",
            token: googleToken 
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data;
          // setRefCode(payload); 
          // removeCookie("eonhub-auth")
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
      return req
    });
  }

  public registerSealRefCode(token: string, googleToken: string) {
    return token && new Promise((resolve, reject) => {
      const req = this.axiosInstance
        .post(`/api/ref/register`, { 
            "gameId": `${SEAL_METAVERSE_GAME_ID}`,
            "refCode": "",
            token: googleToken 
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data.data;
          // setRefCode(payload); 
          // removeCookie("eonhub-auth")
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
      return req
    });
  }

  public fetchZeroRefCode(token: string, setCookie: Function, removeCookie: Function, setRefCode: Function) {
    return token && new Promise((resolve, reject) => {
      const req = this.axiosInstance
        .get(`/api/ref/${ZERO_ETERNAL_LOVE_GAME_ID}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data;
          setRefCode(payload);
          // removeCookie("eonhub-auth")
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
      return req
    });
  }

  public submitZeroRefCode(token: string, refCode: string, setCookie: Function, removeCookie: Function, setRefCode: Function) {
    return token && new Promise((resolve, reject) => {
      const req = this.axiosInstance
        .post(`/api/ref/${ZERO_ETERNAL_LOVE_GAME_ID}`, {
          referCode: refCode
        },{
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data;
          toast.success("Referral Code has been submitted successfully !")
          // setRefCode(payload);
          // removeCookie("eonhub-auth")
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
      return req
    });
  }

  public fetchSealRefCode(token: string, setCookie: Function, removeCookie: Function, setRefCode: Function) {
    return token && new Promise((resolve, reject) => {
      const req = this.axiosInstance
      .get(`/api/ref/${SEAL_METAVERSE_GAME_ID}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data;
          setRefCode(payload);
          // removeCookie("eonhub-auth")
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
      return req
    });
  }

  public fetchZeroInfo(token: string, setCookie: Function, removeCookie: Function, setZeroEternalLoveAccountInfo: Function, gameId: number, serverID: number) {
    return token && new Promise((resolve, reject) => {
      if(!serverID || !gameId || !token) return
      const req = this.axiosInstance
        .get(`/api/user/${gameId}/info?serverId=${serverID}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data.data; 
          setZeroEternalLoveAccountInfo(payload);
          // removeCookie("eonhub-auth")
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
      return req
    });


  }

  public fetchZeroPcInfo(token: string, setCookie: Function, removeCookie: Function, setZeroPCAccountInfo: Function, serverID: number) {
    return token && new Promise((resolve, reject) => {
      if(!serverID || !token) return
      const req = this.axiosInstance
        .get(`/api/user/${RO_ZERO_PC_GAME_ID}/info?serverId=${serverID}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data.data; 
          debugger
          // setZeroPCAccountInfo(payload);
          // removeCookie("eonhub-auth")
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
      return req
    });


  }

  public fetchGameCharactersInfo(token: string, setCookie: Function, removeCookie: Function, setAccountInfo: Function, gameId: number, serverID: number) {
    return token && new Promise((resolve, reject) => {
      if(!serverID || !gameId || !token) return
      const req = this.axiosInstance
        .get(`/api/user/${gameId}/info?serverId=${serverID}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data.data; 
          // debugger
          setAccountInfo(payload || []); 
          resolve(response);
        })
        .catch((error) => {
          setAccountInfo([]);
          reject(error);
        });
      return req
    });


  }
 

  public fetchSealInfo(token: string, setCookie: Function, removeCookie: Function, setSealMetaverseAccountInfo: Function) {
    return token && new Promise((resolve, reject) => {
      const req = this.axiosInstance
        .get(`/api/user/${SEAL_METAVERSE_GAME_ID}/info`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then((response) => {
          const payload = response.data.data;
          // setSealMetaverseAccountInfo(payload);
          // setCookie(
          //   "eonhub-auth",
          //   JSON.stringify(
          //     { ...this.userCookie, ...payload, token }
          //   ),
          //   {
          //     path: "/",
          //     maxAge: 3600 * 1000, // Expires after 1hr
          //     sameSite: true,
          //   }
          // );
          resolve(response);
        })
        .catch((error) => {
          // removeCookie("eonhub-auth")
          reject(error);
        });
      return req
    });


  }

  public fetchUserLoginWithGoogle(
    setCookie: Function,
    removeCookie: Function,
    setAuthInfo: Function,
    setEonhubUserDetail: Function,
    payload: any
  ) {
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .post(`api/auth/verify`, {
          token: payload.access_token,
          email: payload.email,
          gameId: payload.gameId,
          refererCode: payload?.refCode ? payload.refCode : ``,
        })
        .then((response) => {
          const payload = response.data;
          setAuthInfo(payload);
          this.fetchUserInfo(this.userCookie?.token, setCookie, removeCookie, setEonhubUserDetail);
          resolve(response);
        })
        .catch((error) => {
          if (error?.response?.data?.message) {
            
          }
          setAuthInfo(undefined);
          removeCookie("eonhub-auth");

          reject(error);
        });
    });
  }

  // public fetchUserNftInWallet() {
  //   return new Promise((resolve, reject) => {
  //     this.axiosInstance
  //       .get(`${EONHUB_API_URL}/nft/wallet`)
  //       .then((response) => {
  //         // setUserLoginInfo(response.data);
  //         resolve(response);
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // }

  public fetchGameCharacters() {
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}/game/character`)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public fetchCharInventory(charId: number) {
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}/game/inventory?charId=${charId}&forMint=true`)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public fetchCashPoint(server_id: number) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}/cashpoint/balance`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "X-Server-ID": server_id,
          },
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public getUserInfoStorage() {
    return this.userInfo;
  }

  public submitLinkAccount(
    recaphaToken: string,
    web3Token: string,
    userCookie: EONHUB_COOKIE_INTERFACE,
    setCookie: Function
  ) {
    // ReactSwal.fire("Linking Wallet to Account", "..", "question");
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .post(
          `${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}/wallet/bind`,
          { web3Token },
          { headers: { "X-Recaptcha-Token": recaphaToken } }
        )
        .then((response) => {
          if (
            response.data &&
            response.data.accountId &&
            response.data.createdAt &&
            response.data.walletAddress
          ) {
            
            setCookie(
              "eonhub-auth",
              JSON.stringify({
                ...userCookie,
                token: web3Token,
                walletAddress: response.data.walletAddress,
              }),
              {
                path: "/",
                maxAge: 3600, // Expires after 1hr
                sameSite: true,
              }
            );
          }
          resolve(response);
        })
        .catch((error) => {
          if (error?.response?.data?.message) {
            // ReactSwal.close();
            // ReactSwal.fire(
            //   "Linking Wallet to Account Error !",
            //   `${error?.response?.data?.message}`,
            //   "error"
            // );
          }
          reject(error);
        });
    });
  }
}

export default UserService;
