import { Input } from "../ui/input";
import { Label } from "../ui/label";

const RangeWithUnits = ({ setting, value, onChange, disabled }: any) => (
  <div className="space-y-1">
    <Label
      htmlFor={setting?.name}
      className="text-xs 3xl:text-sm text-gray-600"
    >
      {setting?.label}
    </Label>
    <div className="relative w-1/3">
      <Input
        id={setting?.name}
        type={setting?.type}
        name={setting?.name}
        value={value[setting?.name] ?? ""}
        onChange={onChange}
        className="h-8 rounded-md border-gray-300 text-sm pr-10" 
      />
      {setting?.unit && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {setting?.unit}
        </span>
      )}
    </div>
  </div>
);

export default RangeWithUnits;
