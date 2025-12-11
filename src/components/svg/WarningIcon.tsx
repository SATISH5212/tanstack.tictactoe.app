const WarningIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            role="img"
            aria-label="Warning Icon"
        >
            <circle cx="12" cy="12" r="12" fill="#FFBA36" />
            <rect x="11" y="6" width="2" height="9" rx="1" fill="white" />
            <circle cx="12" cy="18" r="1.5" fill="white" />
        </svg>
    );
};

export default WarningIcon;
