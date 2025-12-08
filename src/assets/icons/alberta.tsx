import { memo } from "react";

const SvgComponent = ({
  width = "146px",
  height = "57px",
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={"/images/alberta.png"} alt="Alberta Logo" width={width} height={height} />
);

const Alberta = memo(SvgComponent);
export default Alberta;
