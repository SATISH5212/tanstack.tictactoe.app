
import { useState, useEffect } from "react";
import { Input } from "src/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "src/components/ui/select";
import { Label } from "src/components/ui/label";
import {
    AuthenticationSettings,
    CommunicationSettings,
    CompensationSettings,
    ControlSensitivitySettings,
    CurrentTransformerSettings,
    DeviceConfiguration,
    DisplaySettings,
    FrequencySettings,
    PotentialTransformerSettings,
    TimingSettings,
} from "src/lib/constants/apfcSettingsConstants";
import RangeWithUnits from "src/components/core/RangeWithUnits";
import PasswordInput from "src/components/core/PasswordInput";
import GroupRadioButtons from "src/components/core/GroupRadioButtons";
import SaveAndConfirmationButtons from "./SaveAndConfirmationButtons";

interface FormLevel1ComponentProps {
    levelBasedData: any;
    isLoading: boolean;
    refetchData: () => void;
}

const ErrorMessagesComponent = ({ errorMessage }: { errorMessage?: string }) =>
    errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null;

const FormLevel1Component = ({ levelBasedData, isLoading, refetchData }: FormLevel1ComponentProps) => {
    const [formData, setFormData] = useState<any>({});
    const [errorMessages, setErrorMessages] = useState<any>({});

    useEffect(() => {
        if (levelBasedData) {
            setFormData(levelBasedData);
        }
    }, [levelBasedData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
        setErrorMessages((prev: any) => ({ ...prev, [name]: "" }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
        setErrorMessages((prev: any) => ({ ...prev, [name]: "" }));
    };

    const renderField = (setting: any) => {
        switch (setting?.type) {
            case "text":
                return (
                    <div className="space-y-1" key={setting?.name}>
                        <Label htmlFor={setting?.name} className="text-xs 3xl:text-sm text-gray-600">
                            {setting?.label}
                        </Label>
                        <Input
                            id={setting?.name}
                            name={setting?.name}
                            value={formData[setting?.name] || ""}
                            onChange={handleChange}
                            className="h-8 rounded-md border-gray-300 text-sm"
                            disabled={isLoading}
                        />
                        <ErrorMessagesComponent errorMessage={errorMessages[setting?.name]} />
                    </div>
                );
            case "number":
                return (
                    <div className="space-y-1" key={setting?.name}>
                        <RangeWithUnits
                            setting={setting}
                            value={formData}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <ErrorMessagesComponent errorMessage={errorMessages[setting?.name]} />
                    </div>
                );
            case "password":
                return (
                    <div className="space-y-1" key={setting?.name}>
                        <PasswordInput
                            name={setting?.name}
                            value={formData[setting?.name] || ""}
                            onChange={handleChange}
                            label={setting?.label}
                        />
                        <ErrorMessagesComponent errorMessage={errorMessages[setting?.name]} />
                    </div>
                );
            case "select":
                return (
                    <div className="space-y-1" key={setting?.name}>
                        <Label htmlFor={setting?.name} className="text-xs 3xl:text-sm text-gray-600">
                            {setting?.label}
                        </Label>
                        <Select
                            name={setting?.name}
                            value={formData[setting?.name] || ""}
                            onValueChange={(value) => handleSelectChange(setting?.name, value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="h-8 rounded-md border-gray-300 text-sm">
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {setting?.options?.map((option: string) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <ErrorMessagesComponent errorMessage={errorMessages[setting?.name]} />
                    </div>
                );
            case "radio":
                return (
                    <div className="space-y-1" key={setting?.name}>
                        <GroupRadioButtons
                            setting={setting}
                            handleChange={(value: string) => handleSelectChange(setting?.name, value)}
                            formData={formData}
                            disabled={isLoading}
                        />
                        <ErrorMessagesComponent errorMessage={errorMessages[setting?.name]} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mx-auto w-full  mt-4">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <section className="flex-1 rounded-lg bg-white p-2 border">
                        <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
                            Authentication Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{AuthenticationSettings?.map(renderField)}</div>
                        <h3 className="border-b border-gray-200 px-2 py-2 text-smd 3xl:text-base font-medium text-black">
                            Device Configuration
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{DeviceConfiguration?.map(renderField)}</div>
                        <h3 className="border-b border-gray-200 px-2 py-2 text-smd 3xl:text-base font-medium text-black">
                            Current Transformer (CT) Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{CurrentTransformerSettings?.map(renderField)}</div>
                        <h3 className="border-b border-gray-200 px-2 py-2 text-smd 3xl:text-base font-medium text-black">
                            Potential Transformer (PT) Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{PotentialTransformerSettings?.map(renderField)}</div>
                    </section>

                    <section className="flex-1 rounded-lg bg-white p-2 border">
                        <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
                            Compensation Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{CompensationSettings?.map(renderField)}</div>
                        <h3 className="border-b border-gray-200 px-2 py-2 text-smd 3xl:text-base font-medium text-black">
                            Timing Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{TimingSettings?.map(renderField)}</div>
                    </section>

                    <section className="flex-1 rounded-lg bg-white p-2 border">
                        <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
                            Control Sensitivity Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{ControlSensitivitySettings?.map(renderField)}</div>
                        <h3 className="border-b border-gray-200 px-2 py-2 text-smd 3xl:text-base font-medium text-black">
                            Communication Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{CommunicationSettings?.map(renderField)}</div>
                        <h3 className="border-b border-gray-200 px-2 py-2 text-smd 3xl:text-base font-medium text-black">
                            Display Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{DisplaySettings?.map(renderField)}</div>
                        <h3 className="border-b border-gray-200 px-2 py-2 text-smd 3xl:text-base font-medium text-black">
                            Frequency Settings
                        </h3>
                        <div className="mb-3 space-y-2 p-2">{FrequencySettings?.map(renderField)}</div>
                    </section>
                </div>

                <SaveAndConfirmationButtons
                    formData={formData}
                    refetchData={refetchData}
                    setErrorMessages={setErrorMessages}
                />
            </div>
        </div>
    );
};

export default FormLevel1Component;
