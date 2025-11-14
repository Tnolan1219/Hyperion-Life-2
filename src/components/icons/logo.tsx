export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/>
    <path d="M2 7L12 12"/>
    <path d="M12 22V12"/>
    <path d="M22 7L12 12"/>
    <path d="M17 4.5L7 9.5"/>
  </svg>
);
