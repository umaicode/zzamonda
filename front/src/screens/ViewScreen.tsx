import React, {useEffect, useState} from 'react';
import {View, Text, Button, ScrollView} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';

export default function ViewScreen({route, navigation}) {
  const {docId} = route.params;
  const [data, setData] = useState(null);

  useEffect(() => {
    firestore()
      .collection('charts')
      .doc(docId)
      .get()
      .then(doc => setData(doc.data()));
  }, [docId]);

  if (!data) return <Text style={{color: '#fff', margin: 16}}>로딩 중…</Text>;

  const {eyeCount = [], yawnCount = [], neckDownCount = []} = data;
  const minLen = Math.min(
    eyeCount.length,
    yawnCount.length,
    neckDownCount.length,
  );
  const labels = Array.from(
    {length: minLen},
    (_, i) => `${i * 10}-${i * 10 + 10}s`,
  );

  return (
    <ScrollView style={{backgroundColor: '#111', flex: 1}}>
      <Text
        style={{color: '#fff', fontSize: 20, textAlign: 'center', margin: 16}}>
        측정 데이터 상세
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
