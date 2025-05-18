import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

export default function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>졸음운전방지 프로그램</Text>
      <Button title="운전 시작" onPress={() => navigation.navigate('Drive')} />
      <Button
        title="최근 데이터 보기"
        onPress={() => navigation.navigate('Recent')}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {color: '#fff', fontSize: 24, marginBottom: 32},
});
