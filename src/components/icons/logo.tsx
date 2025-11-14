export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={32}
    height={32}
    {...props}
  >
    <g fill="currentColor">
      <path d="M128 32l96 192H32L128 32z" opacity={0.2} />
      <path d="M128 32L32 224h192L128 32zm0 4l90.36 180.72H37.64L128 36z" />
      <path
        d="M128 112v80"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
      <path
        d="M96 144h64"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
    </g>
  </svg>
);
