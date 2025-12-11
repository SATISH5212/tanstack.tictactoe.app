export function RedDot(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="9"
      viewBox="0 0 11 11"
      fill="none"
      {...props}
    >
      <circle cx="5.5001" cy="5.49961" r="4.65" fill="#D01717" />
      <circle
        cx="5.5001"
        cy="5.49961"
        r="4.65"
        stroke="#D61818"
        strokeWidth="0.5"
      />
      <circle
        cx="5.5001"
        cy="5.49961"
        r="4.65"
        stroke="black"
        strokeOpacity="0.13"
        strokeWidth="0.5"
      />
    </svg>
  );
}
