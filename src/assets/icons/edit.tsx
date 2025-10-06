import { memo } from "react";
import type { SVGProps } from "react";

const SvgComponent = ({ width = "20px", height = "20px", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 20 20"
    aria-label="Edit"
    {...props}
  >
    <title>Edit</title>
    <path
      stroke="#434343"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 16.667h7.5"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M10 16.667h7.5M10 16.667h7.5M10 16.667h7.5M10 16.667h7.5M10 16.667h7.5"
    />
    <path
      stroke="#434343"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.75 2.917a1.768 1.768 0 0 1 2.5 2.5L5.833 15.833l-3.333.834.833-3.334L13.75 2.917Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M13.75 2.917a1.768 1.768 0 0 1 2.5 2.5L5.833 15.833l-3.333.834.833-3.334L13.75 2.917Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M13.75 2.917a1.768 1.768 0 0 1 2.5 2.5L5.833 15.833l-3.333.834.833-3.334L13.75 2.917Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M13.75 2.917a1.768 1.768 0 0 1 2.5 2.5L5.833 15.833l-3.333.834.833-3.334L13.75 2.917Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M13.75 2.917a1.768 1.768 0 0 1 2.5 2.5L5.833 15.833l-3.333.834.833-3.334L13.75 2.917Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={2}
      d="M13.75 2.917a1.768 1.768 0 0 1 2.5 2.5L5.833 15.833l-3.333.834.833-3.334L13.75 2.917Z"
    />
  </svg>
);
const Edit = memo(SvgComponent);
export default Edit;
