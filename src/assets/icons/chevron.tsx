import type { SVGProps } from "react";
import { memo } from "react";

type ChevronDirection = "left" | "right" | "up" | "down";

interface ChevronProps extends SVGProps<SVGSVGElement> {
  width?: string;
  height?: string;
  rotation?: ChevronDirection | number;
}

const rotationMap: Record<ChevronDirection, number> = {
  left: 0,
  right: 180,
  up: 90,
  down: 270,
};

const SvgComponent = ({
  width = "24px",
  height = "24px",
  rotation = "left",
  style,
  ...props
}: ChevronProps) => {
  const degrees = typeof rotation === "number" ? rotation : rotationMap[rotation];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Chevron"
      style={{
        transform: `rotate(${degrees}deg)`,
        transition: "transform 0.2s ease",
        ...style,
      }}
      {...props}
    >
      <title>Chevron</title>
      <path
        d="M15 18L9 12L15 6"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Chevron = memo(SvgComponent);
export default Chevron;
