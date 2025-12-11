import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "./ui/button";

const DeviceNavbar = () => {
  const navigate = useNavigate();
  const { user_id } = useParams({ strict: false });
  const { pathname } = useLocation();
  const Apfc = pathname.includes("Apfc");
  const StarterBox = pathname.includes("StarterBox");
  const handleNavigation = () => {
    navigate({
      to: `/users/${user_id}/apfc/add`,
    });
  };
  return (
    <div className="p-2">
      <div
        className={`flex items-center bg-E4F5E3 w-fit rounded-md cursor-pointer`}
      >
        <Button
          onClick={() => handleNavigation}
          className="h-fit ml-auto px-4 py-2 hover:bg-05A155 bg-05A155 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm cursor-pointer"
        >
          <span>+ Add</span>
        </Button>
      </div>
    </div>
  );
};

export default DeviceNavbar;
