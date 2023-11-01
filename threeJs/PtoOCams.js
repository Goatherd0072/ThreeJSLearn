function dollyzoom(targetDistance, targetNear, targetFar, duration, easing) {
  return new Promise(function (resolve) {
    var easing = easing || TWEEN.Easing.Linear.None; // TWEEN.Easing.Cubic.InOut
    var duration = duration || 1000;
    var target = cameraTarget;
    var tweenValues = getCameraYawPitchRadius(camera, target);
    var targetValues = { yaw: 0, pitch: Math.PI, radius: targetDistance };
    tweenValues.near = camera.near;
    tweenValues.far = camera.far;
    targetValues.near = targetNear;
    targetValues.far = targetFar;

    var x =
      Math.tan(THREE.Math.degToRad(camera.fov / 2)) *
      camera.position.distanceTo(target);

    var tween = new TWEEN.Tween(tweenValues);
    tween.to(targetValues, duration);
    tween.easing(easing);
    tween.onComplete(function () {
      resolve();
    });
    tween.onUpdate(function () {
      setCameraYawPitch(
        camera,
        target,
        tweenValues.yaw,
        tweenValues.pitch,
        tweenValues.radius
      );

      camera.fov = 2 * THREE.Math.radToDeg(Math.atan(x / tweenValues.radius));
      camera.far = tweenValues.far;
      camera.near = tweenValues.near;

      camera.updateProjectionMatrix();
    });
    tween.start();
  });
}

var transitionAnimating = false;

var removeModeChangeLoader = function () {
  $(".view-mode-wrapper .loader").remove();
};

self.viewportSetMode = function (mode) {
  var title = "";
  if (viewportMode === mode) {
    return;
  }
  if (transitionAnimating) return;

  transitionAnimating = true;

  viewportMode = mode;

  var farRadius = 5000;
  var camNearNormal = 1;
  var camFarNormal = renderDistanceLimit;
  var camNearAway = farRadius + camNearNormal;
  var camFarAway = farRadius + camFarNormal;
  var animationTime = 50;
  var cameraAnimation;
  if (mode === "2d") {
    cameraAnimation = new Promise(function (resolve) {
      viewcube.setView(viewcube.FACES.TOP).then(function () {
        dollyzoom(
          farRadius,
          camNearAway,
          camFarAway,
          animationTime,
          TWEEN.Easing.Quartic.In
        ).then(function () {
          resolve();
          removeModeChangeLoader();
        });
      });
    });

    cameraAnimation.then(function () {
      title = "2D";
      viewModeControl.removeClass("active");
      camera = orthographicCamera;

      viewportModeSwitchAxes("2d");
      if (transformMode === "scale") {
        selectionBox.material.color.set(bbox2dScaleColor);
      }

      viewModeControl.find("span").html(title);

      orbitControl.setObject(camera);
      orbitControl.enableRotate = false;
      orbitControl.enablePan = true;
      orbitControl.setZoom(zoom / 100);

      transformControl.setCamera(camera);
      scaleControl.setCamera(camera);

      viewcube.disable();

      transformControl.setRotationSnap(THREE.Math.degToRad(snapAngle2d));

      transitionAnimating = false;
      removeModeChangeLoader();
    });
  } else {
    cameraAnimation = new Promise(function (resolve) {
      var targetRadius = orbitControl.getInitialRadius() / (zoom / 100);

      // set camera and start animation
      camera = perspectiveCamera;
      orbitControl.setObject(perspectiveCamera);
      selectionBox.material.color.set(bboxDefaultColor);
      transformControl.setCamera(camera);
      scaleControl.setCamera(camera);
      viewportModeSwitchAxes("3d");

      dollyzoom(
        targetRadius,
        camNearNormal,
        camFarNormal,
        animationTime,
        TWEEN.Easing.Quartic.Out
      ).then(function () {
        viewcube.enable();

        viewcube
          .setView(viewcube.FACES.TOP_FRONT_RIGHT_CORNER)
          .then(function () {
            resolve();
          });
      });
    });

    cameraAnimation.then(function () {
      title = "3D";
      viewModeControl.addClass("active");

      orbitControl.enableRotate = true;
      orbitControl.enablePan = false;
      viewcube.updateOrientation();

      viewModeControl.find("span").html(title);

      orbitControl.setZoom(zoom / 100);

      transformControl.setRotationSnap(null);

      transitionAnimating = false;
      removeModeChangeLoader();
    });
  }
};

function getCameraYawPitchRadius(camera, target) {
  var spherical = new THREE.Spherical();
  var offset = new THREE.Vector3();

  // so camera.up is the orbit axis
  var quat = new THREE.Quaternion().setFromUnitVectors(
    camera.up,
    new THREE.Vector3(0, 1, 0)
  );
  var position = camera.position;

  offset.copy(position).sub(target);

  // rotate offset to "y-axis-is-up" space
  offset.applyQuaternion(quat);

  // angle from z-axis around y-axis
  spherical.setFromVector3(offset);

  return {
    yaw: spherical.theta,
    pitch: Math.PI / 2 - spherical.phi,
    radius: spherical.radius,
  };
}

function setCameraYawPitch(camera, target, yaw, pitch, radius) {
  var spherical = new THREE.Spherical();
  var offset = new THREE.Vector3();

  // so camera.up is the orbit axis
  var quat = new THREE.Quaternion().setFromUnitVectors(
    camera.up,
    new THREE.Vector3(0, 1, 0)
  );
  var quatInverse = quat.clone().inverse();
  var position = camera.position;

  offset.copy(position).sub(target);

  // rotate offset to "y-axis-is-up" space
  offset.applyQuaternion(quat);

  // angle from z-axis around y-axis
  spherical.setFromVector3(offset);

  var thetaDelta = yaw - spherical.theta;
  var phiDelta = -pitch + Math.PI / 2 - spherical.phi;

  spherical.theta += thetaDelta;
  spherical.phi += phiDelta;

  if (typeof radius !== "undefined") {
    spherical.radius = radius;
  }

  spherical.makeSafe();
  offset.setFromSpherical(spherical);

  // rotate offset back to "camera-up-vector-is-up" space
  offset.applyQuaternion(quatInverse);

  camera.position.copy(target).add(offset);
  camera.lookAt(target);
}
