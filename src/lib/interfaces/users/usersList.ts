import { LocationContextType } from "../locations/userLocations";
import { UsersList } from "../users";

export interface ExtendedLocationContextType extends LocationContextType {
  users: UsersList[];
  selectedUser: UsersList | null;
  selectedUserId: number | null;
  userSearchString: string;
  debounceUserSearchString: string;
  setUserSearchString: (value: string) => void;
  isUsersLoading: boolean;
  // isUsersError: boolean;
  // isFetchingNextUserPage: boolean;
  // hasNextUserPage: boolean;
  // fetchNextUserPage: () => void;
  userLoadMoreRef: React.RefObject<HTMLDivElement | null>;
  isUserSelectOpen: boolean;
  setIsUserSelectOpen: (value: boolean) => void;
  setSelectedUserId: (id: number | null) => void;
  setSelectedUser: (user: UsersList | null) => void;
  handleUserChange: (value: string) => void;
  handleClearUser: () => void;
}