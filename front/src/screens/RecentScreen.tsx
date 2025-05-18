import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function RecentScreen({navigation}) {
  const [data, setData] = useState([]);
  useEffect(() => {
    firestore()
      .collection('charts')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get()
      .then(sn => setData(sn.docs.map(doc => ({id: doc.id, ...doc.data()}))));
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: '#111', padding: 16}}>
      <Text style={{color: '#fff', fontSize: 20, marginBottom: 16}}>
        최근 측정 데이터
      </Text>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('View', {docId: item.id})}>
            <Text
              style={{
                color: '#fff',
                padding: 12,
                backgroundColor: '#222',
                marginBottom: 8,
                borderRadius: 4,
              }}>
              {item.timestamp?.toDate?.().toLocaleString?.() ||
                item.timestamp ||
                '시간정보 없음'}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Button title="홈으로" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}
