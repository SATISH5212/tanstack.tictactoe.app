const HpImg = ({className}: {className?: string}) => {
    return (  
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect width="10" height="10" rx="5" fill="#E0FFE0" />
            <circle cx="5" cy="5" r="3.125" fill="#45A845" />
        </svg>
    );
}
 
export default HpImg;