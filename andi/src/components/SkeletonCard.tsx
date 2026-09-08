import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/lib/theme";

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity }]} />
      <Animated.View style={[styles.line, { width: "70%", opacity }]} />
      <Animated.View style={[styles.line, { width: "40%", opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 168, marginEnd: spacing.md },
  image: { width: "100%", height: 130, borderRadius: radius.md, backgroundColor: colors.border, marginBottom: spacing.sm },
  line: { height: 12, borderRadius: 4, backgroundColor: colors.border, marginBottom: spacing.xs },
});
