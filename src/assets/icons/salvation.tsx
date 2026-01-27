import Image, { type ImageProps } from "next/image";
import { memo } from "react";

const SalvationArmyLogo = (props: Omit<ImageProps, "src" | "alt">) => {
  return (
    <Image
      src="/images/salvation.png"
      alt="Salvation Army Logo"
      width={56}
      height={65}
      {...props}
    />
  );
};

export default memo(SalvationArmyLogo);
