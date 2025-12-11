import { RadioGroup, RadioGroupItem } from "src/components/ui/radio-group";
import { Label } from "src/components/ui/label";

const GroupRadioButtons = ({ setting, handleChange, formData }: any) => {
    return (
        <div className="space-y-1">
            <Label className="text-xs 3xl:text-sm text-gray-600">{setting?.label}</Label>
            <RadioGroup
                name={setting?.name}
                value={formData[setting?.name] ?? ""}
                onValueChange={handleChange}
                className="flex flex-row gap-4"

            >
                {setting?.options?.map((option: { label: string; value: string }) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem

                            value={option.value}
                            id={`${setting?.name}-${option.value}`}
                        />
                        <Label
                            htmlFor={`${setting?.name}-${option.value}`}
                            className="text-xs 3xl:text-sm text-gray-700"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
};

export default GroupRadioButtons;