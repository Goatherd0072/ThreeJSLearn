import { EffectComposer, SSAO, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
export default function Effects() {
  return /*#__PURE__*/ React.createElement(
    EffectComposer,
    {
      multisampling: 16,
    },
    /*#__PURE__*/ React.createElement(Bloom, {
      kernelSize: KernelSize.LARGE,
      luminanceThreshold: 0.55,
      luminanceSmoothing: 0.2,
    }),
    /*#__PURE__*/ React.createElement(SSAO, {
      intensity: 5,
      samples: 50,
      rings: 6,
      distanceThreshold: 0.1,
      distanceFalloff: 0.1,
      rangeThreshold: 0.15,
      rangeFalloff: 0.1,
      luminanceInfluence: 0.9,
      radius: 50,
      scale: 0.05,
      bias: 0.5,
    })
  );
}
