import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({ width = "16px", height = "16px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 16 16"
    aria-label="Cross"
    {...props}
  >
    <title>Cross</title>
    <g clipPath="url(#a)">
      <g
        stroke="#A03145"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        clipPath="url(#b)"
      >
        <path d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334ZM10 6l-4 4M6 6l4 4" />
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
const Cross = memo(SvgComponent);
export default Cross;
