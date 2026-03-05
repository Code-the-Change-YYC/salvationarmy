import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({ width = "32px", height = "32px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 32 32"
    aria-label="Vehicle"
    {...props}
  >
    <title>Vehicle</title>
    <path
      fill="#434343"
      d="M11 7.5a1.5 1.5 0 0 0-1.415 1.002L8 13H6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h10v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2l-1.585-4.498A1.5 1.5 0 0 0 21 7.5h-10ZM10.5 13l1-3h9l1 3h-11Zm1 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
    />
  </svg>
);

const Vehicle = memo(SvgComponent);
export default Vehicle;
