import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './zeno-reactor.module.css' // Import CSS module for styling
import { useCookies } from 'react-cookie'
import { useAtom } from 'jotai'
import { selectedServerAtom, ZeroEternalLoveAccountInfoAtom } from '@/atoms/eonhub'
import { eonhubApiCreate } from '@/axios'
import userService from '@/services/user.service'
import { IEonUserDetail } from '@/types/eonhub'
import UserService from '@/services/user.service'
import { ROM_SERVERS } from './zero-eternal-love/inventoryWhitelist'
import { IZeroEternalLoveCharInfo } from '@/types/zero-eternal-love'
import { toast } from 'react-toastify'
import { useWeb3React } from '@web3-react/core'
import { useWalletSigner } from '@/hooks/useWeb3Token'
import { providers } from 'ethers'

// Define types
type ReactorDetailResponse = {
  itemName: string
  itemBag: string
  itemPictureUrl: string
}

type ReactorListResponse = {
  reactorName: string
  reactorLevel: number
  priceEon: number
  priceZeny: number
  reactorDetails: ReactorDetailResponse[]
}

type UpReactorRequest = {
  priceType: string
  characterId: string
  serverId: number
  walletToken: string | null
}

type UpReactorResponse = {
  id: string
  itemName: string
  itemPicture: string
  itemPictureUrl: string
}

type ClaimItemRequest = {
  id: string
  characterId: string
  serverId: number
}

type CliamItemResponse = {
  itemName: string
  itemPicture: string
}

export default function ReactorROM() {
  const [reactorList, setReactorList] = useState<ReactorListResponse[]>([])
  const [reactorLevel, setReactorLevel] = useState<number | null>(null)
  const [selectedReactor, setSelectedReactor] = useState<string | null>(null)
  const [upgradeResponse, setUpgradeResponse] = useState<UpReactorResponse | null>(null)
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<IZeroEternalLoveCharInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false);


  const [cookies, setCookie, removeCookie] = useCookies(['zero-pa-auth'])
 
  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  useEffect(() => {
    // if (cookies["eonhub-auth"]) {
    //   const savedToken = cookies["eonhub-auth"];
    //   setToken(savedToken);
    //   setIsLoggedIn(true);
    // }
  }, [cookies])


  const [uCookie, setUCookie, removeUCookie] = useCookies(["eonhub-auth"]);
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
  const userCookie: IEonUserDetail = uCookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);

  const userService = new UserService();

  useEffect(() => {
    userService.fetchZeroInfo(userCookie?.token, setUCookie, removeUCookie, setZeroEternalLoveAccountInfo, selectedServer.gameId, selectedServer.serverID)
  }, [selectedServer?.serverID])

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter your username and password.')
      return
    }
    
    // === TODO: Uncomment this block of code to enable login ===
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROM_API_URL}/api/auth/login`, {
        username,
        password,
      })

      const authToken = response.data.token
      setToken(authToken)
      setCookie('zero-pa-auth', authToken, { path: '/', maxAge: 3600 })
      setIsLoggedIn(true)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  useEffect(() => {
    if (!isLoggedIn || !token) return

    const headers = {
      Authorization: `Bearer ${token}`,
    }

    // Fetch reactor level
    axios
      .get(`${process?.env?.NEXT_PUBLIC_ROM_API_URL || ''}/api/reactor/level`, { headers })
      .then((response) => {
        setReactorLevel(response?.data?.data)
      })
      .catch(() => setReactorLevel(null))

    // Fetch reactor list
    axios
      .get(`${process?.env?.NEXT_PUBLIC_ROM_API_URL || ''}/api/reactor`, { headers })
      .then((response) => {
        setReactorList(response?.data?.data || [])
      })
      .catch(() => setReactorList([]))
  }, [isLoggedIn, token])


  const { library, account, chainId, activate, deactivate } = useWeb3React();

  const { sign: signWallet } = useWalletSigner(
    library as providers.Web3Provider
  );

  
  const upgradeReactor = async (priceType: string) => {
    if (!selectedCharacter || !selectedServer) return toast.error("Please select a character and server");
    if(reactorLevel >= 5) return toast.error("Reactor level is already at max level"); 
    setIsProcessing(true); // Start animation
    setHighlightedCell(null); // Reset any previous highlights
  
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let walletToken = null;
  
    if (userCookie?.walletAddress) {
      if (!account) return toast.error("Please connect your wallet");
      if (account?.toLowerCase() === userCookie?.walletAddress?.toLowerCase()) {
        walletToken = await signWallet();
      }
      if (!walletToken) return toast.error("Failed to sign wallet");
    }

    // Simulate running animation for 3 seconds
    let duration = 3000; // Total animation duration
    let interval = 100; // Interval between highlights
    const highlightInterval = setInterval(() => {
      const cellIndex = Math.floor(Math.random() * 9); // Randomly pick a cell
      setHighlightedCell(cellIndex);
      duration -= interval;
  
      if (duration <= 0) {
        clearInterval(highlightInterval);
      }
    }, interval);
  
    const requestBody: UpReactorRequest = {
      priceType,
      characterId: `${selectedCharacter?.characterId}`,
      serverId: selectedServer?.serverID,
      walletToken,
    };
  
    try {
      const response = await axios.post(`${process?.env?.NEXT_PUBLIC_ROM_API_URL || ''}/api/reactor/`, requestBody, {
        headers,
      });


      // Stop the running highlight animation and show the final highlighted cell
      setTimeout(() => {
        setIsProcessing(false); // End animation
        clearInterval(highlightInterval); // Clear animation interval
        setHighlightedCell(parseInt(response?.data?.id) % 9); // Highlight the final cell
        setUpgradeResponse(response?.data?.data);
  
        // Fetch reactor level and update the UI
        axios
          .get(`${process?.env?.NEXT_PUBLIC_ROM_API_URL || ''}/api/reactor/level`, { headers })
          .then((res) => {
            setReactorLevel(res?.data?.data)
            if(res?.data?.data <= 1) {
              switch(priceType) {
                case 'ZENY':
                  userService.fetchZeroInfo(userCookie?.token, setUCookie, removeUCookie, setZeroEternalLoveAccountInfo, selectedServer.gameId, selectedServer.serverID)
                  break;
                case 'ZERO_POINT':
                  userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
                  break;
              }
            }
      
          })
          .catch(() => setReactorLevel(null));
      }, duration); // End the animation at the right time
      
    } catch (error) {
      setIsProcessing(false);
      clearInterval(highlightInterval);
      toast.error("Upgrade failed. Please try again.");
      if(upgradeResponse) {
        setUpgradeResponse(null);
        // setReactorLevel(null);
      }
    }
  };
  
  

  const claimItem = async () => {
    if (!upgradeResponse) return

    const headers = {
      Authorization: `Bearer ${token}`,
    }

    const requestBody: ClaimItemRequest = {
      id: upgradeResponse.id,
      characterId: `${selectedCharacter?.characterId}`,
      serverId: selectedServer?.serverID,
    }

    const response = await axios.post(`${process?.env?.NEXT_PUBLIC_ROM_API_URL || ''}/api/reactor/claim`, requestBody, {
      headers,
    })
    setUpgradeResponse(null);
    setReactorLevel(null);
    toast.success(`Item Claimed: ${response?.data?.data?.itemName}`)
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer + ` my-auto mx-auto w-fit h-fit flex flex-col justify-start gap-4`}>
        {/* <h3>Login</h3> */}
        <input type="text" placeholder="Username" className='text-center max-h-8 rounded-md' value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" className='text-center max-h-8 rounded-md' value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleLogin}
          className="hover:bg-secondary-dark max-h-8 rounded-md border-2 border-secondary bg-secondary px-4 py-[1px] text-white transition duration-300"
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="reactor-management">
  {/* Header */}
  <h1 className="text-2xl font-bold mb-4">Reactor Management</h1>

    {/* Display Bonus Points */}
    <div className="flex justify-center mb-4">
      <h2 className="text-lg font-medium shadow-inner px-4 py-1 rounded-md bg-gray-100">ZERO Point: {userCookie?.bonusPoint || 0}</h2>
    </div>

  {/* Reactor Upgrade Buttons */}
  <div className="flex gap-4 mb-6 justify-center">
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:scale-105"
      onClick={() => upgradeReactor('ZERO_POINT')}
      aria-label="Upgrade reactor with ZERO POINT"
    >
      Upgrade with ZERO POINT
    </button>
    
    <button
      className={`px-4 py-2 ${reactorLevel ? `bg-primary` :`bg-secondary`} text-white rounded-md hover:scale-105`}
      onClick={() => upgradeReactor('ZENY')}
      aria-label="Upgrade reactor with ZENY"
    >
      {reactorLevel ? `Upgrade`:`Upgrade with ZENY`}
    </button>
  </div>

  {/* Reactor Level Display */}
  <div className="mb-6">
  <div className="reactor-level-container flex justify-center">
  <div className="animated-border">
    <div className="level-table">
      <h2 className="text-lg font-medium">Reactor Level: {reactorLevel || 0}</h2>
    </div>
  </div>
</div>

  </div>

  {/* Selected Reactor Details */}
  {/* {selectedReactor && (
    <div className="selected-reactor bg-gray-100 p-4 rounded-md mb-6">
      <h3 className="text-md font-semibold">Upgrade Reactor: {selectedReactor}</h3>
      <div className="flex gap-4 mt-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => upgradeReactor('EON')}
        >
          Upgrade with EON
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          onClick={() => upgradeReactor('ZENY')}
        >
          Upgrade with ZENY
        </button>
      </div>
    </div>
  )} */}

  {/* Upgrade Response Section */}
  {isProcessing ? (
  <div className="flex justify-center items-center flex-col">
    <div className="spinner"></div>
    <p className="mt-4 text-gray-700">Upgrading Reactor... Please wait!</p>
  </div>
) : (
  upgradeResponse && (
    <div className="upgrade-response bg-green-50 p-4 rounded-md">
      <h3 className="text-md font-bold text-green-700">Upgrade Successful!</h3>
      <p className="mt-2 text-gray-700">
        <span className="font-medium">Item Name:</span> {upgradeResponse.itemName}
      </p>
      <img
        className="mt-4 mx-auto"
        src={upgradeResponse?.itemPictureUrl}
        alt={upgradeResponse.itemName}
        width="80"
        height="80"
      />
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        onClick={claimItem}
      >
        Claim Item
      </button>
    </div>
  )
)}

</div>


      {/* <div className={styles.board + ` mx-auto w-fit`}>
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className={`${styles.cell} ${highlightedCell === index ? styles.highlighted : ''}`}>
            {index + 1}
          </div>
        ))}
      </div> */}

<div className={`${styles.board} mx-auto w-fit`}>
  {Array.from({ length: 9 }).map((_, index) => {
    // Ensure reactor data exists
    const reactor = reactorList[reactorLevel];
    const reactorDetail = reactor?.reactorDetails?.[index]; // Get the first level item details
    // console.log(`reactorDetail [${index}]`, reactorDetail);

    return (
      <div
        key={index}
        className={`${styles.cell} ${
          highlightedCell === index ? styles.highlighted : ''
        }`}
      >
        {reactorDetail?.itemPictureUrl ? (
          <img
            src={reactorDetail.itemPictureUrl}
            alt={reactorDetail.itemName || `Item ${index + 1}`}
            width="50"
            height="50"
            className="object-contain"
          />
        ) : (
          index + 1 // Fallback to the cell number if no image is found
        )}
      </div>
    );
  })}
</div>





<div className="flex flex-col mt-4">
  {/* Server Dropdown */}
  <select
    id="romServerDropdown"
    className="text-center border rounded-md p-2"
    aria-label="Select a server"
    value={selectedServer?.serverName || ''}
    onChange={(e) => {
      const selectedValue = e.target.value;
      const server = ROM_SERVERS?.find((srv) => srv.serverName === selectedValue);
      setSelectedServer(server);
    }}
  >
    <option value="" disabled>
      -- Choose a server --
    </option>
    {ROM_SERVERS?.map((server) => (
      <option key={server.serverName} value={server.serverName}>
        {server.serverName}
      </option>
    ))}
  </select>

  {/* Characters List */}
  <div className="flex flex-wrap justify-center gap-4 mt-4">
    {zeroEternalLoveAccountInfo?.characterNames?.length > 0 ? (
      zeroEternalLoveAccountInfo.characterNames.map((characterInfo) => (
        <div
          key={characterInfo.characterId}
          className={`cursor-pointer rounded-md px-3 py-2 ${
            selectedCharacter?.characterId === characterInfo.characterId
              ? 'bg-secondary text-white'
              : 'bg-neutral-200 text-black'
          }`}
          onClick={() =>
            characterInfo?.isOnline ? null : setSelectedCharacter(characterInfo)
          }
        >
          <p className="font-medium">{characterInfo.characterName}</p>
          <p className={`text-sm ${selectedCharacter?.characterId ? `` :`text-gray-600`}`}>
            {characterInfo.zeny?.toLocaleString('en-US', {})}z
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No characters available.</p>
    )}
  </div>
</div>




      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
  {reactorList?.length > 0 &&
    reactorList.map((reactor) => (
      <div key={reactor.reactorName} className="mt-2">
        <details className="bg-gray-100 rounded-lg p-4 shadow-md">
          <summary className="cursor-pointer font-semibold text-center">
            {reactor.reactorName}
          </summary>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {reactor.reactorDetails.map((detail, index) => (
              <div
                key={index}
                className="relative group flex items-center justify-center rounded-md bg-white p-4 lg:p-1 shadow-md transition-all hover:shadow-lg"
              >
                <img
                  src={detail.itemPictureUrl}
                  alt={detail.itemName}
                  width="50"
                  className="rounded-md"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-b-md">
                  {detail.itemName}
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    ))}
</div>

    </div>
  )
}
