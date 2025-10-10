import { memo } from "react";
import type { SVGProps } from "react";

const SvgComponent = ({ width = "16px", height = "16px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 16 16"
    aria-label="Check"
    {...props}
  >
    <title>Check</title>
    <g clipPath="url(#a)">
      <g
        stroke="#1A641E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        clipPath="url(#b)"
      >
        <path d="M14.667 7.387V8a6.666 6.666 0 1 1-3.954-6.093" />
        <path d="M14.667 2.667 8 9.34l-2-2" />
      </g>
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
      <clipPath id="b">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
const Check = memo(SvgComponent);
export default Check;
