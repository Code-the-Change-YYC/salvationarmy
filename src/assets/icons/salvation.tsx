import type { SVGProps } from "react";
import { memo } from "react";
import salvationImg from "@/assets/images/salvation.png";

const SvgComponent = ({
  width = "56px",
  height = "65px",
  color = "currentColor",
  ...props
}: SVGProps<SVGSVGElement>) => (
  <img src={salvationImg.src} alt="Alberta Logo" width={width} height={height} />
);

const Salvation = memo(SvgComponent);
export default Salvation;
