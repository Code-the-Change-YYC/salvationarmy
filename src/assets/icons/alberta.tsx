import Image, { type ImageProps } from "next/image";
import { memo } from "react";

const Alberta = (props: Omit<ImageProps, "src" | "alt">) => {
  return <Image src="/images/alberta.png" alt="Alberta Logo" width={146} height={57} {...props} />;
};

export default memo(Alberta);
