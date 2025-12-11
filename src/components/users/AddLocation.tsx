import { ILocationBlock } from "src/lib/interfaces/users";
import { FC } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import MapSearchBox from "@/components/dashboard/MapSearchBox";
import { useAddLocation } from "@/lib/helpers/map/addLocationHelper";
import { Label } from "@/components/ui/label";

const AddLocation: FC<ILocationBlock> = (props) => {
    const {
        handleSubmitNewLocation,
        errors,
        formData,
        handleChange,
        handleCancelAddLocation,
        isStatusPending,
        errormessage,
        setFormData,
        setErrors,
    } = props;

    const {
        searchQuery,
        searchResults,
        isSearching,
        showResults,
        locationData,
        setSearchQuery,
        selectLocation,
        clearSearch,
        setShowResults
    } = useAddLocation({
        title: formData?.title || "",
    });

    const handleSearchQueryChange = (
        value: string | ((prevState: string) => string)
    ) => {
        setSearchQuery(value);
        const newValue = typeof value === "function" ? value(searchQuery) : value;
        setFormData((prev: any) => ({
            ...prev,
            title: newValue,
        }));
        if (newValue !== "" && (errors?.title || errors?.location_coordinates)) {
            setErrors((prev: any) => ({
                ...prev,
                title: null,
                location_coordinates: null,
            }));
        }
    };

    const handleSelectLocation = (feature: any) => {
        selectLocation(feature);
        const coordinates = feature.geometry?.coordinates || [];
        setFormData((prev: any) => ({
            ...prev,
            location_coordinates: {
                lng: coordinates[0],
                lat: coordinates[1],
            },
        }));
        if (errors?.location_coordinates) {
            setErrors((prev: any) => ({
                ...prev,
                location_coordinates: null,
            }));
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.location_coordinates) {
            return;
        }

        handleSubmitNewLocation(e);
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-2 mb-4 w-3/5 pl-3">
                <Label className="text-smd 3xl:text-base text-4F4F4F font-normal">
                    Location Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative w-full [&>div]:!static [&>div]:!left-0 [&>div]:!top-0">
                    <MapSearchBox
                        searchQuery={searchQuery}
                        setSearchQuery={handleSearchQueryChange}
                        searchResults={searchResults}
                        isSearching={isSearching}
                        showResults={showResults}
                        selectLocation={handleSelectLocation}
                        clearSearch={clearSearch}
                        isAddingLocation={true}
                        setShowResults={setShowResults}
                    />
                </div>

                {locationData.location_coordinates && (
                    <div className="text-xs mt-1">
                        <span className="text-green-600">Latitude:</span>{" "}
                        {locationData.location_coordinates.lat.toFixed(6)}{" "}
                        <span className="text-green-600 ml-2">Longitude:</span>{" "}
                        {locationData.location_coordinates.lng.toFixed(6)}
                    </div>
                )}
                {errors?.title && (
                    <p className="text-red-500 text-xs">{errors?.title}</p>
                )}
                {errors?.location_coordinates && (
                    <p className="text-red-500 text-xs">
                        {errors?.location_coordinates as any}
                    </p>
                )}
            </div>
            <div className="flex flex-col gap-2 w-3/5 pl-3">
                <label className="text-smd 3xl:text-base text-4F4F4F font-normal">
                    Gateway
                </label>
                <Input
                    name="gateway_title"
                    value={formData.gateway_title || ""}
                    onChange={handleChange}
                    placeholder="Enter Gateway (optional)"
                    className="text-sm rounded-md p-2 shadow-none outline-none focus:outline-none focus-visible:outline-none !focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-none h-10 bg-FAFAFA border-EAEAEA"
                    maxLength={30}
                />
                {errors?.gateway_title && (
                    <p className="text-red-500 text-xs">
                        {errors?.gateway_title}
                    </p>
                )}
            </div>
            <div className="flex gap-2 items-center justify-end mt-4 pr-3">
                <Button
                    size="sm"
                    variant="outline"
                    className="text-black/80 border  hover:bg-transparent hover:text-black/80 py-1.5 hover:bg-gray-100 px-4 h-fit font-normal text-[13px]"
                    onClick={handleCancelAddLocation}
                    type="button"
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-600 border border-green-500 text-white py-1.5 px-4 h-fit !rounded font-light text-[13px]"
                    type="submit"
                    disabled={isStatusPending}
                >
                    {isStatusPending ? (
                        <Loader2 className="animate-spin" size={14} />
                    ) : (
                        "Save "
                    )}
                </Button>
            </div>
            {errormessage && (
                <p className="text-red-500 text-xs p-2 border-t text-center">
                    {errormessage}
                </p>
            )}
        </form>
    );
};

export default AddLocation