const SuccessIcon = ({className}: {className?: string}) => {
    return (  
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clipPath="url(#clip0_8109_24637)">
                <rect width="16" height="16" rx="8" fill="#45A845" />
                <path d="M8 0C3.58862 0 0 3.58862 0 8C0 12.4114 3.58862 16 8 16C12.4114 16 16 12.4114 16 8C16 3.58862 12.4114 0 8 0Z" fill="#45A845" />
                <path d="M12.0562 6.30457L7.72278 10.6378C7.59277 10.7678 7.42212 10.8333 7.25146 10.8333C7.08081 10.8333 6.91016 10.7678 6.78015 10.6378L4.61353 8.47119C4.35278 8.21057 4.35278 7.78918 4.61353 7.52856C4.87415 7.26782 5.29541 7.26782 5.55615 7.52856L7.25146 9.22388L11.1135 5.36194C11.3741 5.1012 11.7954 5.1012 12.0562 5.36194C12.3168 5.62256 12.3168 6.04382 12.0562 6.30457Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_8109_24637">
                    <rect width="16" height="16" rx="8" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
 
export default SuccessIcon;