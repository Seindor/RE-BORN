/* AUTO-GENERATED. DO NOT EDIT. */
import { token as __token0 } from "../Providers/Shared/Singletons/API/AbilityAPI/AbilityAPIToken";
import { token as __token1 } from "../Providers/Shared/Singletons/API/AnimationsAPI/AnimationsAPIToken";
import { token as __token2 } from "../Providers/Shared/Singletons/API/AssetsHelperAPIProvider/AssetsHelperAPIToken";
import { token as __token3 } from "../Providers/Shared/Singletons/API/AtomAPI/AtomAPIToken";
import { token as __token4 } from "../Providers/Shared/Singletons/API/CameraAPI/CameraAPIToken";
import { token as __token5 } from "../Providers/Shared/Singletons/API/CameraTESTAPI/CameraTESTAPIToken";
import { token as __token6 } from "../Providers/Shared/Singletons/API/ClickDetectorAPI/ClickDetectorAPIToken";
import { token as __token7 } from "../Providers/Shared/Singletons/API/ContextAPIProvder/ContextAPIToken";
import { token as __token8 } from "../Providers/Shared/Singletons/API/EntitiesStorageAPI/EntitiesStorageAPIToken";
import { token as __token9 } from "../Providers/Shared/Singletons/API/EventBusAPIProvider/EventBusAPIToken";
import { token as __token10 } from "../Providers/Shared/Singletons/API/HitboxAPI/HitboxAPIToken";
import { token as __token11 } from "../Providers/Shared/Singletons/API/MotionAPI/MotionAPIToken";
import { token as __token12 } from "../Providers/Shared/Singletons/API/PassiveAPIProvider/PassiveAPIToken";
import { token as __token13 } from "../Providers/Shared/Singletons/API/PhaseResolverAPI/PhaseResolverAPIToken";
import { token as __token14 } from "../Providers/Shared/Singletons/API/ProximityAPIProvider/ProximityAPIToken";
import { token as __token15 } from "../Providers/Shared/Singletons/API/RenderDistanceAPI copy/RenderDistanceAPIToken";
import { token as __token16 } from "../Providers/Shared/Singletons/API/ReplicatedStatusEffectsAPIProvider/ReplicatedStatusEffectsAPIToken";
import { token as __token17 } from "../Providers/Shared/Singletons/API/SolverAPIProvder/SolverAPIToken";
import { token as __token18 } from "../Providers/Shared/Singletons/API/ToolAPIProvider/ToolAPIToken";
import { token as __token19 } from "../Providers/Shared/Singletons/API/UIWrapperAPIProvider/UIWrapperAPIToken";

export const SharedRegistry = {
  Singletons: {
    API: {
      AbilityAPI: __token0,
      AnimationsAPI: __token1,
      AssetsHelperAPI: __token2,
      AtomAPI: __token3,
      CameraAPI: __token4,
      CameraTESTAPI: __token5,
      ClickDetectorAPI: __token6,
      ContextAPI: __token7,
      EntitiesStorageAPI: __token8,
      EventBusAPI: __token9,
      HitboxAPI: __token10,
      MotionAPI: __token11,
      PassiveAPI: __token12,
      PhaseResolverAPI: __token13,
      ProximityAPI: __token14,
      RenderDistanceAPI: __token15,
      ReplicatedStatusEffectsAPI: __token16,
      SolverAPI: __token17,
      ToolAPI: __token18,
      UIWrapperAPI: __token19,
    },
  },
} as const;

export type SharedRegistryShape = typeof SharedRegistry;
