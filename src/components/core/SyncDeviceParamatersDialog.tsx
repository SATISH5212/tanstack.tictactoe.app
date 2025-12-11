import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "src/components/ui/dialog"; 
import { Button } from "src/components/ui/button";
import { useParams } from "@tanstack/react-router";

interface SyncDialogProps {
  openSyncParamsDialog: boolean;
  setOpenSyncParamsDialog: (open: boolean) => void;
  handleSync: () => void;
  handleClose: () => void;
}

const SyncDeviceDialog: React.FC<SyncDialogProps> = ({
  openSyncParamsDialog,
  setOpenSyncParamsDialog,
  handleSync,
  handleClose
}) => {

  return (
    <Dialog open={openSyncParamsDialog} onOpenChange={setOpenSyncParamsDialog}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Sync Device</DialogTitle>
          <DialogDescription>
            Would you like to sync the device now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
            onClick={() => {
              handleClose();

            }}

          >
            No
          </Button>
          <Button
            onClick={() => {
              handleSync();

            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncDeviceDialog;
