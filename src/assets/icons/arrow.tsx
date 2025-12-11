import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({
  width = "24px",
  height = "24px",
  color = "currentColor",
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Arrow"
    {...props}
  >
    <title>Arrow</title>
    <g
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      clipPath="url(#a)"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

const Arrow = memo(SvgComponent);
export default Arrow;
