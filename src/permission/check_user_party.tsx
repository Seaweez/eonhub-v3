import { forwardRef, useMemo } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import * as Cookies from "js-cookie"

export interface IEonhubAdminUser {
  email: string;
  eonPoint: string;
  lastLoginTime: string;
  referralPoint: number;
  userId: number;
  userParty: string;
  userStatus: string;
  username: string;
  walletAddress: string;
  refCode: string | undefined;
  shortenUrl: string | undefined;
  token: string;
  topupCredit?: number;
  permissions: string[];
}


interface Props {
    children?: React.ReactNode | React.ReactNodeArray;
    alt?: React.ReactNode | React.ReactNodeArray;
    groups?: string[];
    perms?: string[];
  }

  const ProtectedContent = forwardRef((props: Props, ref): JSX.Element => {
    const { children, groups, perms, alt } = props;

    const [cookie] = useCookies(["eonhub-auth"]);
    const tmp = jwtDecode(cookie["eonhub-auth"].token) as any;
    const userCookie: IEonhubAdminUser = tmp.user;

    // groups the user is a member of
    const userGroups = useMemo(() => {
      return userCookie.userParty;
    }, [userCookie]);

    const userPermissions = useMemo(() => {
      return userCookie.permissions;
    }, [userCookie]);

    // all userCookie permissions
    // const permsSet = useMemo(() => {
    //   return userCookie?.user_permissions || [];
    // }, [userCookie]);

    let showContent = false;

    // Block rendering content if the user is not authenticated
    if (!userCookie) {
      return <p>User is not authenticated!</p>;
    }
    if (groups) {
      showContent = groups.some((group) => userGroups.includes(group));
    }

    if (perms) {

      if (!userPermissions) {
        Cookies.remove("eonhub-auth");
      }
      showContent = perms.some((perm) => userPermissions.includes(perm));
    }

    // If the user is an admin/superuser, grant access to everything
    // if (userCookie?.is_superuser) {
    //   showContent = true;
    // } else {
    //   // Show content if the user is a member of any groups passed as props
    //   showContent = userGroups == group

    //   // Show content if the user has any of the permissions passed as props
    //   if (!showContent) {
    //     showContent = permsSet.some((perm: string) => perms?.includes(perm));
    //   }
    // }

    // Either render the protected content or an alterative for unauthorized users
    return showContent ? <>{children}</> : <>{alt}</>;
  });
  ProtectedContent.displayName = 'ProtectedContent'
  export default ProtectedContent;