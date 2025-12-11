
import { createContext, useContext, useState, ReactNode } from "react";
import { Pond } from "@/lib/interfaces/maps/ponds";

interface PondContextType {
  mapPonds: Pond[];
  setMapPonds: (ponds: Pond[]) => void;
  selectedPondIndex: number | null;
  setSelectedPondIndex: (index: number | null) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const PondContext = createContext<PondContextType | undefined>(undefined);

export const PondProvider = ({ children }: { children: ReactNode }) => {
  const [mapPonds, setMapPonds] = useState<Pond[]>([]);
  const [selectedPondIndex, setSelectedPondIndex] = useState<number | null>(
    null
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <PondContext.Provider
      value={{
        mapPonds,
        setMapPonds,
        selectedPondIndex,
        setSelectedPondIndex,
        isChatOpen,
        setIsChatOpen,
      }}
    >
      {children}
    </PondContext.Provider>
  );
};

export const usePondContext = () => {
  const context = useContext(PondContext);
  if (!context) {
    throw new Error("usePondContext must be used within a PondProvider");
  }
  return context;
};
