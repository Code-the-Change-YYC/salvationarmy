import { memo } from "react";
import type { SVGProps } from "react";

const SvgComponent = ({ width = "24px", height = "24px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Bell"
    {...props}
  >
    <title>Bell</title>
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} clipPath="url(#a)">
      <path stroke="#434343" d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
      <path stroke="#000" strokeOpacity={0.2} d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
      <path stroke="#000" strokeOpacity={0.2} d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
      <path stroke="#000" strokeOpacity={0.2} d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
      <path stroke="#000" strokeOpacity={0.2} d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
      <path stroke="#000" strokeOpacity={0.2} d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
      <path stroke="#434343" d="M13.73 21a1.999 1.999 0 0 1-3.46 0" />
      <path stroke="#000" strokeOpacity={0.2} d="M13.73 21a1.999 1.999 0 0 1-3.46 0" />
      <path stroke="#000" strokeOpacity={0.2} d="M13.73 21a1.999 1.999 0 0 1-3.46 0" />
      <path stroke="#000" strokeOpacity={0.2} d="M13.73 21a1.999 1.999 0 0 1-3.46 0" />
      <path stroke="#000" strokeOpacity={0.2} d="M13.73 21a1.999 1.999 0 0 1-3.46 0" />
      <path stroke="#000" strokeOpacity={0.2} d="M13.73 21a1.999 1.999 0 0 1-3.46 0" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
const Bell = memo(SvgComponent);
export default Bell;
