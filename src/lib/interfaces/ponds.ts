import { Dispatch, SetStateAction } from "react";
import { Motor, Pond } from "./maps/ponds";

interface PondDataTypes {
  id: number;
  title: string;
  location: {
    id: number;
    title: string;
  };
  motors: {
    id: number;
    title: string;
    state: number;
    starter_id: number | null;
    motor_ref_id: number | null;
    starterBox: any | null;
  }[];
  motorCount: number;
}


export interface AddMotorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, hp: string) => void;
  motorLocation: { lng: number; lat: number } | null;
  isPending: boolean;
  motorErrorMessage: Record<string, string> | null;
  setMotorErrorMessage: Dispatch<SetStateAction<Record<string, string> | null>>;
  motorName: string
  setMotorName: Dispatch<SetStateAction<string>>
  motorHp: string
  setMotorHp: Dispatch<SetStateAction<string>>
}

export interface IMotorCardsListProps {
  motors: Motor[]
  selectedMotorIds: number[]
  handleMotorToggle: (motorId: number) => void
  setSelectedMotorIds: Dispatch<SetStateAction<number[]>>
}

export interface IMotorActivitySheetProps {
  selectedPondIndex: number | null;
  mapPonds: Pond[];
  dateValue: Date[] | null;
  setDateValue: (value: Date[] | null) => void;
  dateRange: Date[] | null;
  setDateRange: (value: Date[] | null) => void;

  singleMotorData: Motor | null;
  isMotorLoading: boolean;
  selectedMotorIds: number[];
  setSelectedMotorIds: Dispatch<SetStateAction<number[]>>;
}
