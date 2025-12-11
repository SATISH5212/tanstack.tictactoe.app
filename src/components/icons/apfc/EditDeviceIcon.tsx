const EditDeviceIcon = ({ className }: { className?: string }) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" data-locator-target="vscode://file/${projectPath}${filePath}:${line}:${column}">
            <g id="pencil (2) 1" clipPath="url(#clip0_864_1119)">
                <g id="01 align center">
                    <path id="Vector" d="M17.205 0.795047C16.6951 0.285945 16.004 0 15.2835 0C14.563 0 13.8719 0.285945 13.362 0.795047L0 14.157V18H3.843L17.205 4.63805C17.7139 4.12807 17.9997 3.43702 17.9997 2.71655C17.9997 1.99608 17.7139 1.30503 17.205 0.795047ZM3.225 16.5H1.5V14.775L11.4825 4.80005L13.2075 6.52505L3.225 16.5ZM16.1445 3.57755L14.2642 5.4578L12.543 3.7328L14.4225 1.85555C14.6512 1.6268 14.9615 1.49829 15.285 1.49829C15.6085 1.49829 15.9188 1.6268 16.1475 1.85555C16.3762 2.0843 16.5048 2.39455 16.5048 2.71805C16.5048 3.04155 16.3762 3.3518 16.1475 3.58055L16.1445 3.57755Z" fill="#e47078" />
                </g>
            </g>
            <defs>
                <clipPath id="clip0_864_1119">
                    <rect width="18" height="18" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

export default EditDeviceIcon;