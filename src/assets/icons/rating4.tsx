import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({ width = "32px", height = "32px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="currentcolor"
    viewBox="0 0 32 32"
    aria-label="Rating4"
    {...props}
  >
    <title>Rating4</title>
    <path
      stroke="#424242"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M16 29.333c7.364 0 13.333-5.97 13.333-13.333 0-7.364-5.97-13.333-13.333-13.333C8.636 2.667 2.667 8.637 2.667 16c0 7.364 5.97 13.333 13.333 13.333Z"
    />
    <path
      stroke="#424242"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M16 29.333c7.364 0 13.333-5.97 13.333-13.333 0-7.364-5.97-13.333-13.333-13.333C8.636 2.667 2.667 8.637 2.667 16c0 7.364 5.97 13.333 13.333 13.333Z"
    />
    <path
      stroke="#424242"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M10.667 18.667S12.667 20 16 20s5.333-1.333 5.333-1.333M12 12h.013M20 12h.013"
    />
  </svg>
);

const Rating4 = memo(SvgComponent);
export default Rating4;
