import { Dispatch, FC, SetStateAction, useState } from "react";
export interface IMotorPowerInputProps {
  motor?: any;
  handleMotorPowerChange: (motorId: number, newPower: string) => void;
  setMotorErrorMessage?: Dispatch<
    SetStateAction<Record<string, string> | null>
  >;
}
const MotorPowerInput: FC<IMotorPowerInputProps> = (props) => {
  const { motor, handleMotorPowerChange, setMotorErrorMessage } = props;
  const [error, setError] = useState("");

  return (
    <div >
      <input
        type="number"
        value={motor?.power || ""}
        placeholder="HP"
        onChange={(e) => {
          let value = e.target.value;

          if (value === "") {
            setError("");
            handleMotorPowerChange(motor.id, "");
            return;
          }

          const decimalRegex = /^\d{0,2}(\.\d{0,2})?$/;
          if (!decimalRegex.test(value)) {
            return;
          }

          const num = parseFloat(value);
          if (isNaN(num)) {
            setError("Enter a valid number");
            return;
          }


          if (num <= 0) {
            setError("Value must be greater than 0");
          } else if (num >= 30) {
            setError("Value must be less than 30");
          } else {
            setError("");
          }

          handleMotorPowerChange(motor.id, value);
          setMotorErrorMessage?.((prev: any) => ({ ...prev, hp: "" }));
        }}
        onBlur={(e) => {
          const num = parseFloat(e.target.value);
          if (!isNaN(num) && num >= 0.1 && num < 30) {
            handleMotorPowerChange(motor.id, num.toString());
          }
        }}
        inputMode="decimal"
        min="0.1"
        step="0.1"
        className={`w-full h-9 px-3 py-3 border rounded focus:outline-none focus:ring-1 
        text-xs text-gray-700
        ${error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-400"}
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
export default MotorPowerInput;
