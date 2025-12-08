import type { SVGProps } from "react";
import { memo } from "react";
import albertaImg from "@/assets/images/alberta.png";

const SvgComponent = ({
  width = "146px",
  height = "57px",
  color = "currentColor",
  ...props
}: SVGProps<SVGSVGElement>) => (
  <img src={albertaImg.src} alt="Alberta Logo" width={width} height={height} />
);

const Alberta = memo(SvgComponent);
export default Alberta;
