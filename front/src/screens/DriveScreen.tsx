import React, {useRef, useEffect, useState} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import MediapipeFacemesh from 'react-native-mediapipe-facemesh';
import {runOnJS} from 'react-native-reanimated';

const EAR_THRESHOLD = 0.25;
const FATIGUE_FRAME_COUNT = 10;
const MAR_THRESHOLD = 0.7;
const YAWN_CONSEC_FRAMES = 15;
const NECK_CONSEC_FRAMES = 15;
const PITCH_THRESHOLD = 85;

export default function DriveScreen({navigation}) {
  const devices = useCameraDevices();
  const device = useCameraDevice('front', {
    physicalDevices: ['wide-angle-camera'],
  });
  const {hasPermission, requestPermission} = useCameraPermission();

  // 통계 상태
  const [eyeCount, setEyeCount] = useState([]);
  const [yawnCount, setYawnCount] = useState([]);
  const [neckDownCount, setNeckDownCount] = useState([]);
  const blinkEvents = useRef(0);
  const yawnEvents = useRef(0);
  const neckDownEvents = useRef(0);
  const closedEyeFrames = useRef(0);
  const openMouthFrames = useRef(0);
  const neckDownFrames = useRef(0);
  const smoothedPitch = useRef(0);

  // 10초마다 집계
  useEffect(() => {
    const timer = setInterval(() => {
      setEyeCount(prev => [...prev, blinkEvents.current]);
      setYawnCount(prev => [...prev, yawnEvents.current]);
      setNeckDownCount(prev => [...prev, neckDownEvents.current]);
      blinkEvents.current = yawnEvents.current = neckDownEvents.current = 0;
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 프레임 프로세서
  const onFaceMeshResult = result => {
    if (!result || !result.landmarks || result.landmarks.length !== 468) return;
    const lm = result.landmarks;
    const EAR =
      (calcEAR(lm, [33, 160, 158, 133, 153, 144]) +
        calcEAR(lm, [362, 385, 387, 263, 373, 380])) /
      2;
    const MAR = calcMAR(lm, [13, 14, 78, 308]);
    let rawPitch;
    if (result.worldLandmarks) {
      const w = result.worldLandmarks;
      rawPitch =
        (Math.atan2(w[152].y - w[1].y, w[152].z - w[1].z) * 180) / Math.PI;
    } else {
      rawPitch = calcHeadPitch(lm);
    }
    smoothedPitch.current = 0.2 * rawPitch + 0.8 * smoothedPitch.current;
    const pitch = smoothedPitch.current;

    if (EAR < EAR_THRESHOLD) {
      closedEyeFrames.current++;
    } else {
      if (closedEyeFrames.current >= FATIGUE_FRAME_COUNT) blinkEvents.current++;
      closedEyeFrames.current = 0;
    }
    if (MAR > MAR_THRESHOLD) {
      openMouthFrames.current++;
    } else {
      if (openMouthFrames.current >= YAWN_CONSEC_FRAMES) yawnEvents.current++;
      openMouthFrames.current = 0;
    }
    if (pitch < PITCH_THRESHOLD) {
      neckDownFrames.current++;
    } else {
      if (neckDownFrames.current >= NECK_CONSEC_FRAMES)
        neckDownEvents.current++;
      neckDownFrames.current = 0;
    }
  };

  // VisionCamera 프레임 프로세서 (Worklet)
  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    // 프레임을 base64로 변환하는 플러그인이 필요합니다.
    // 예시 (실제 구현 필요):
    // const base64 = frameToBase64(frame);
    // MediapipeFacemesh.runFaceMeshWithBase64Images([base64]).then(result => {
    //   runOnJS(onFaceMeshResult)(result);
    // });
  }, []);

  const handleFinish = () => {
    navigation.replace('Result', {
      eyeCount,
      yawnCount,
      neckDownCount,
    });
  };

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }
  function calcEAR(lm, idx) {
    const [p1, p2, p3, p4, p5, p6] = idx.map(i => lm[i]);
    return (distance(p2, p6) + distance(p3, p5)) / (2 * distance(p1, p4));
  }
  function calcMAR(lm, idx) {
    const [t, b, lft, rt] = idx.map(i => lm[i]);
    return distance(t, b) / distance(lft, rt);
  }
  function calcHeadPitch(lm) {
    const n = lm[1],
      c = lm[152];
    return Math.abs((Math.atan2(c.y - n.y, c.x - n.x) * 180) / Math.PI);
  }

  // 권한/카메라 준비 UI
  if (!hasPermission || !device) {
    return (
      <View style={styles.permissionView}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 카메라 프리뷰 + 오버레이
  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
      <Camera
        style={{flex: 1}}
        device={device}
        isActive={true}
        // frameProcessor={frameProcessor}
        // frameProcessorFps={5}
      />
      <View style={styles.overlay}>
        <Text style={styles.info}>측정 중… (종료: 버튼 클릭)</Text>
        <Button title="측정 종료" onPress={handleFinish} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  info: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  permissionView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
