import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({
  width = "56px",
  height = "65px",
  color = "currentColor",
  ...props
}: SVGProps<SVGSVGElement>) => (
  <img src={"/images/salvation.png"} alt="Alberta Logo" width={width} height={height} />
);

const Salvation = memo(SvgComponent);
export default Salvation;
