import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({ width = "16px", height = "16px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 16 16"
    aria-label="Add"
    {...props}
  >
    <title>Add</title>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 3.333v9.334"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M8 3.333v9.334M8 3.333v9.334M8 3.333v9.334M8 3.333v9.334M8 3.333v9.334"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.333 8h9.334"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M3.333 8h9.334M3.333 8h9.334M3.333 8h9.334M3.333 8h9.334M3.333 8h9.334"
    />
  </svg>
);

const Plus = memo(SvgComponent);
export default Plus;
