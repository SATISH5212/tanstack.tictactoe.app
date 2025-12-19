import AddUserForm from "@/components/users/AddUserForm";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "src/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "src/components/ui/sheet";
import AddDeviceForm from "./AddDeviceForm";

const AddDevice = () => {
  const { userId } = useUserDetails();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"addDevice" | "addUser">("addDevice");

  const handleCloseAddSideBar = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="h-7 px-4 bg-blue-500 hover:bg-blue-600 text-xs text-white">
          + Add
        </Button>
      </SheetTrigger>

      <SheetContent className="bg-white px-6 py-4 overflow-y-auto w-[50vw] max-w-[500px] min-w-[300px]"      >
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "addDevice" | "addUser")
          }
          className="w-full"        >

          <div className="flex flex-row  justify-between items-start ">
            <TabsList className="flex gap-1 bg-gray-200 rounded-lg p-1 mb-5 w-fit ">
              <TabsTrigger
                value="addDevice"
                className={`px-4 py-1 text-xs font-medium rounded-md transition-all
                ${activeTab === "addDevice"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-300"
                  }`}
              >
                Add Device
              </TabsTrigger>

              <TabsTrigger
                value="addUser"
                className={`px-4 py-1 text-xs font-medium rounded-md transition-all
                ${activeTab === "addUser"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-300"
                  }`}
              >
                Add User
              </TabsTrigger>
            </TabsList>
            <div
              onClick={handleCloseAddSideBar}
              className="flex rounded-full hover:bg-red-100 text-red-500 "
            >
              <X size={14} strokeWidth={2.5} />
            </div>
          </div>
          <TabsContent value="addDevice" className="">
            <AddDeviceForm
              userId={userId}
              onClose={handleCloseAddSideBar}
            />
          </TabsContent>

          <TabsContent value="addUser">
            <AddUserForm
              userId={userId}
              onClose={handleCloseAddSideBar}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default AddDevice;
