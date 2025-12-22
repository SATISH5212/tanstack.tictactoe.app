
import { Dispatch, SetStateAction } from "react";

export interface pageProps {
  columns: any[];
  data: any[];
  loading?: boolean;
  heightClass?: string;
  getData?: any;
  paginationDetails?: any;
  removeSortingForColumnIds?: string[];
  noDataLabel?: string;
  isFetchingNextPage?: boolean;
  onRowClick?: (row: any) => void;
}

export interface iConfirmDialog {
  removeConfirm: boolean;
  setRemoveConfirm: Dispatch<SetStateAction<boolean>>;
  name?: string;
  contactTypes?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleteLoading?: boolean;
  setDeleteReason?: Dispatch<SetStateAction<string>>;
  deleteReason?: string
}


export interface UseIntersectionObserverProps {
  onIntersect: () => void;
  enabled?: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
};