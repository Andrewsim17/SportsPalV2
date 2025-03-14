import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors } from '../constants/colors';

export default function SearchBar({ value, onChangeText, placeholder, onClear }) {
  return (
    <View style={styles.container}>
      <Search size={20} color={colors.textLight} />
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Search..."}
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <Pressable onPress={onClear}>
          <X size={20} color={colors.textLight} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});