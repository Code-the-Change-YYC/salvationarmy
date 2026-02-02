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
    aria-label="Play"
    {...props}
  >
    <title>Play</title>
    <path
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z"
    />
  </svg>
);

const Play = memo(SvgComponent);
export default Play;
