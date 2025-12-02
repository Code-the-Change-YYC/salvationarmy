import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({ width = "32px", height = "32px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Logout"
    {...props}
  >
    <title>Logout</title>
    <path
      fill="#fa5252"
      d="M13 2a5 5 0 0 0-5 5 1 1 0 1 0 2 0 3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3 1 1 0 1 0-2 0 5 5 0 0 0 5 5h4a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"
    ></path>
    <path
      fill="#fa5252"
      d="M14 11a1 1 0 1 1 0 2zM5.718 11a39 39 0 0 0 1.027-1.325l.047-.063.012-.017.004-.007L6 9l.808.588a1 1 0 0 0-1.617-1.176l-.003.004-.01.014-.042.057-.16.216c-.14.184-.337.442-.57.736-.472.595-1.068 1.31-1.613 1.854L2.086 12l.707.707c.545.545 1.141 1.26 1.613 1.854a38 38 0 0 1 .73.952l.042.057.01.014.002.003a1 1 0 0 0 1.619-1.175l-.81.588.81-.588-.005-.007-.012-.017-.047-.063-.172-.23A40 40 0 0 0 5.718 13H14v-2z"
    ></path>
  </svg>
);

const Logout = memo(SvgComponent);
export default Logout;
