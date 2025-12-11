import { Mail, Phone, MapPin, Edit } from "lucide-react";
import {
  statusLabelMap,
  userTypeLabelMap,
} from "@/lib/constants/exportDeviceData";

interface ProfileCardProps {
  profileData: any;
  onEdit: () => void;
}

const ProfileCard = ({ profileData, onEdit }: ProfileCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-600";
      case "inactive":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const FORM_STYLES = {
    div: "flex items-start gap-2 p-1 mt-2 hover:bg-gray-50 rounded-lg transition-colors",
    icon: "w-5 h-5 text-black mt-0.5 flex-shrink-0",
    label: "text-sm font-normal text-black mb-1",
    input: "text-xs break-words text-gray-500",
  }

  return (
    <div className="bg-white w-full">
      <div className="flex flex-col items-center">
        <div className="flex items-start justify-between w-full">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="relative mb-2">
            <img
              src={
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(profileData?.full_name || "User")
              }
              alt={profileData?.full_name}
              className="w-14 h-14 rounded-full object-cover"
            />
          </div>

          <h2 className="text-lg 3xl:!text-xl font-medium text-gray-900 mb-1">
            {profileData?.full_name || "-"}
          </h2>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-gray-600 text-sm">
              {userTypeLabelMap[profileData?.user_type] ||
                profileData?.user_type ||
                "-"}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border border-green-500 ${getStatusColor(profileData?.status)}`}
            >
              {statusLabelMap[profileData?.status] ||
                profileData?.status ||
                "-"}
            </span>
          </div>
        </div>
        <div className="flex justify-end">
        <button
          onClick={onEdit}
          className="p-2  bg-orange-50 hover:bg-orange-100 rounded-full transition-colors"
          title="Edit user"
        >
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      </div> 

      <hr className="w-full border-gray-200"/>

        <div className="w-full space-y-3">
          {/* Email */}
          <div className={FORM_STYLES.div}>
            <Mail className={FORM_STYLES.icon} strokeWidth={1.5}/>
            <div className="flex-1 min-w-0">
              <p className={FORM_STYLES.label}>Email</p>
              <p className={FORM_STYLES.input}>
                {profileData?.email || "-"}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className={FORM_STYLES.div}>
            <Phone className={FORM_STYLES.icon} strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className={FORM_STYLES.label}>
                Phone number
              </p>
              <p className={FORM_STYLES.input}>
                {profileData?.phone || "-"}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className={FORM_STYLES.div}>
            <MapPin className={FORM_STYLES.icon} strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className={FORM_STYLES.label}>Location</p>
              <p className={FORM_STYLES.input}>
                {profileData?.address || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
