export const FaultIcon = ({
    color,
    ...props
}: React.SVGProps<SVGSVGElement> & { color?: string }) => {
    const strokeColor = color || "currentColor";



    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect
                x="0.428571"
                y="0.428571"
                width="23.1429"
                height="23.1429"
                rx="11.5714"
                stroke={strokeColor}
                strokeWidth="0.857143"
            />
            <g clipPath="url(#clip0_14397_2378)">
                <path
                    d="M17.902 14.418L13.5518 6.42128C12.8529 5.24463 11.1491 5.24307 10.4493 6.42128L6.09934 14.418C5.38485 15.6203 6.24988 17.1429 7.65026 17.1429H16.3507C17.7499 17.1429 18.6165 15.6215 17.902 14.418ZM12.0006 15.6997C11.6028 15.6997 11.279 15.376 11.279 14.9782C11.279 14.5804 11.6028 14.2566 12.0006 14.2566C12.3983 14.2566 12.7221 14.5804 12.7221 14.9782C12.7221 15.376 12.3983 15.6997 12.0006 15.6997ZM12.7221 12.8135C12.7221 13.2113 12.3983 13.5351 12.0006 13.5351C11.6028 13.5351 11.279 13.2113 11.279 12.8135V9.20571C11.279 8.80793 11.6028 8.48415 12.0006 8.48415C12.3983 8.48415 12.7221 8.80793 12.7221 9.20571V12.8135Z"
                    fill={strokeColor}
                />
            </g>
            <defs>
                <clipPath id="clip0_14397_2378">
                    <rect
                        width="13.7143"
                        height="13.7143"
                        fill="white"
                        transform="translate(5.14307 5.14288)"
                    />
                </clipPath>
            </defs>
        </svg>
    )
}

export default FaultIcon
