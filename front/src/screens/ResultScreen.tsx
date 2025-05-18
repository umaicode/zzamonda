import React, {useEffect} from 'react';
import {View, Text, Button, ScrollView} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';

export default function ResultScreen({route, navigation}) {
  const {eyeCount, yawnCount, neckDownCount} = route.params;
  const minLen = Math.min(
    eyeCount.length,
    yawnCount.length,
    neckDownCount.length,
  );
  const labels = Array.from(
    {length: minLen},
    (_, i) => `${i * 10}-${i * 10 + 10}s`,
  );

  // Firestore 저장
  useEffect(() => {
    const save = async () => {
      await firestore().collection('charts').add({
        timestamp: new Date(),
        eyeCount,
        yawnCount,
        neckDownCount,
      });
    };
    save();
  }, []);

  return (
    <ScrollView style={{backgroundColor: '#111', flex: 1}}>
      <Text
        style={{color: '#fff', fontSize: 20, textAlign: 'center', margin: 16}}>
        측정 결과
      </Text>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: eyeCount.slice(0, minLen),
              color: () => '#00f',
              strokeWidth: 2,
              label: '눈 깜빡임',
            },
          ],
        }}
        width={320}
        height={180}
        chartConfig={{backgroundColor: '#222', color: () => '#fff'}}
      />
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: yawnCount.slice(0, minLen),
              color: () => '#ff0',
              strokeWidth: 2,
              label: '하품',
            },
          ],
        }}
        width={320}
        height={180}
        chartConfig={{backgroundColor: '#222', color: () => '#fff'}}
      />
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: neckDownCount.slice(0, minLen),
              color: () => '#f00',
              strokeWidth: 2,
              label: '고개 숙임',
            },
          ],
        }}
        width={320}
        height={180}
        chartConfig={{backgroundColor: '#222', color: () => '#fff'}}
      />
      <Button title="홈으로" onPress={() => navigation.navigate('Home')} />
    </ScrollView>
  );
}
