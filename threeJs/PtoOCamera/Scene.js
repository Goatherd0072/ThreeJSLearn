import { Canvas } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import { useState } from "react";
import Effects from "./Effects";
import Camera from "./Camera";
export default function Scene() {
  return /*#__PURE__*/ React.createElement(
    Canvas,
    {
      frameloop: "demand",
      shadows: true,
      dpr: [1, 2],
    },
    /*#__PURE__*/ React.createElement(Camera, null),
    /*#__PURE__*/ React.createElement("directionalLight", {
      intensity: 1,
      position: [2, 2, 0],
      color: "#ffaaff",
      distance: 5,
    }),
    /*#__PURE__*/ React.createElement("spotLight", {
      intensity: 1,
      position: [-5, 10, 2],
      angle: 0.2,
      penumbra: 1,
    }),
    /*#__PURE__*/ React.createElement(Boxes, null),
    /*#__PURE__*/ React.createElement(Effects, null)
  );
}
function Boxes() {
  const [boxAHover, setBoxAHover] = useState(false);
  const [boxBHover, setBoxBHover] = useState(false);
  const [boxCHover, setBoxCHover] = useState(false);
  const [boxDHover, setBoxDHover] = useState(false);
  return /*#__PURE__*/ React.createElement(
    React.Fragment,
    null,
    /*#__PURE__*/ React.createElement(
      Box,
      {
        position: [-2, 0.5, 0],
        scale: boxAHover ? 1.25 : 1,
        onPointerOver: () => setBoxAHover(true),
        onPointerLeave: () => setBoxAHover(false),
      },
      /*#__PURE__*/ React.createElement("meshStandardMaterial", {
        attach: "material",
        color: boxAHover ? "#ff8888" : "red",
      })
    ),
    /*#__PURE__*/ React.createElement(
      Box,
      {
        position: [2, 0.5, 0],
        scale: boxBHover ? 1.25 : 1,
        onPointerOver: () => setBoxBHover(true),
        onPointerLeave: () => setBoxBHover(false),
      },
      /*#__PURE__*/ React.createElement("meshStandardMaterial", {
        attach: "material",
        color: boxBHover ? "#88ff88" : "green",
      })
    ),
    /*#__PURE__*/ React.createElement(
      Box,
      {
        position: [-0.5, 0.5, -2],
        scale: boxCHover ? 1.25 : 1,
        onPointerOver: () => setBoxCHover(true),
        onPointerLeave: () => setBoxCHover(false),
      },
      /*#__PURE__*/ React.createElement("meshStandardMaterial", {
        attach: "material",
        color: boxCHover ? "#8888ff" : "blue",
      })
    ),
    /*#__PURE__*/ React.createElement(
      Box,
      {
        position: [0.5, 0.5, 2],
        scale: boxDHover ? 1.25 : 1,
        onPointerOver: () => setBoxDHover(true),
        onPointerLeave: () => setBoxDHover(false),
      },
      /*#__PURE__*/ React.createElement("meshStandardMaterial", {
        attach: "material",
        color: boxDHover ? "#ffff88" : "orange",
      })
    ),
    /*#__PURE__*/ React.createElement(
      Box,
      {
        position: [0, -0.05, 0],
        scale: [10, 0.1, 10],
      },
      /*#__PURE__*/ React.createElement("meshStandardMaterial", {
        attach: "material",
        color: "#f3f3f3",
      })
    )
  );
}
