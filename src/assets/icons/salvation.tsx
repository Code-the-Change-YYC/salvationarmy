import type { SVGProps } from "react";
import { memo } from "react";

const SvgComponent = ({
  width = "56px",
  height = "65px",
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={"/images/salvation.png"} alt="Salvation Army Logo" width={width} height={height} />
);

const Salvation = memo(SvgComponent);
export default Salvation;
