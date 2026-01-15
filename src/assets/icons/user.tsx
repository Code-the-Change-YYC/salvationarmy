import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({
  width = "32px",
  height = "32px",
  stroke = "#434343",
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 32 32"
    aria-label="User"
    {...props}
  >
    <title>User</title>
    <path
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M24 25.333v-1.777c0-.943-.421-1.848-1.172-2.515C22.078 20.375 21.061 20 20 20h-8c-1.06 0-2.078.375-2.828 1.041C8.422 21.708 8 22.613 8 23.556v1.777M16 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
    />
    <path
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16.133 29.223c7.364 0 13.333-5.97 13.333-13.334S23.496 2.556 16.133 2.556c-7.364 0-13.334 5.97-13.334 13.333 0 7.364 5.97 13.334 13.334 13.334Z"
    />
    <g>
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.2}
        strokeWidth={2}
        d="M24 25.333v-1.777c0-.943-.421-1.848-1.172-2.515C22.078 20.375 21.061 20 20 20h-8c-1.06 0-2.078.375-2.828 1.041C8.422 21.708 8 22.613 8 23.556v1.777M16 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      />
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.2}
        strokeWidth={2}
        d="M16.133 29.223c7.364 0 13.333-5.97 13.333-13.334S23.496 2.556 16.133 2.556c-7.364 0-13.334 5.97-13.334 13.333 0 7.364 5.97 13.334 13.334 13.334Z"
      />
    </g>
  </svg>
);

const User = memo(SvgComponent);
export default User;
