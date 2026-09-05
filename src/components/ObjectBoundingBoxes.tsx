import React, { useRef } from "react";
import type { RecognizedObject } from "../store/useObjectRecognitionStore";

type ObjectBoundingBoxesProps = {
  boxes: RecognizedObject[];
};

const ObjectBoundingBoxes: React.FC<ObjectBoundingBoxesProps> = ({ boxes }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!boxes.length) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="object-bbox-overlay"
      aria-label="Detected object boxes"
    >
      {boxes.map((box, index) => {
        const [x1, y1, x2, y2] = box.bbox;

        const left = Math.min(x1, x2) * 100;
        const top = Math.min(y1, y2) * 100;
        const boxWidth = Math.abs(x2 - x1) * 100;
        const boxHeight = Math.abs(y2 - y1) * 100;

        return (
          <div
            key={`${box.id ?? "bbox"}-${index}`}
            className="object-bbox"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${boxWidth}%`,
              height: `${boxHeight}%`,
            }}
            title={`object ${box.id} (${box.score.toFixed(3)})`}
          />
        );
      })}
    </div>
  );
};

export default ObjectBoundingBoxes;
