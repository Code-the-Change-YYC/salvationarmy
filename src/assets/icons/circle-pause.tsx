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
    aria-label="Circle Pause"
    {...props}
  >
    <title>Circle Pause</title>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} fill="none" />
    <rect x="9" y="8" width="2" height="8" rx="0.5" fill={color} />
    <rect x="13" y="8" width="2" height="8" rx="0.5" fill={color} />
  </svg>
);

const Pause = memo(SvgComponent);
export default Pause;
