import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";
import { buildDateOptions, DateChipPicker, formatDateLabel } from "@/components/DateChipPicker";
import { useAuth } from "@/lib/hooks/useAuth";
import { paymentProvider } from "@/lib/services/payment";
import type { Item, ItemBlockedDate, PlatformSettings } from "@/types/database.types";

type Step = "dates" | "confirm" | "paying" | "success";

export default function Booking() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [step, setStep] = useState<Step>("dates");
  const [startKey, setStartKey] = useState<string | null>(null);
  const [endKey, setEndKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const itemQuery = useQuery({
    queryKey: ["booking-item", itemId],
    queryFn: async () => {
      const { data } = await supabase.from("items").select("*").eq("id", itemId).single();
      return data as Item;
    },
  });

  const blockedQuery = useQuery({
    queryKey: ["blocked-dates", itemId],
    queryFn: async () => {
      const { data } = await supabase.from("item_blocked_dates").select("*").eq("item_id", itemId);
      return (data ?? []) as ItemBlockedDate[];
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*").eq("id", 1).single();
      return data as PlatformSettings;
    },
  });

  const blockedKeys = useMemo(
    () => new Set((blockedQuery.data ?? []).map((b) => b.blocked_date)),
    [blockedQuery.data]
  );

  const startOptions = useMemo(() => buildDateOptions(45, blockedKeys), [blockedKeys]);
  const selectedStart = startOptions.find((o) => o.key === startKey);

  const endOptions = useMemo(() => {
    if (!selectedStart || !itemQuery.data) return [];
    const minDate = new Date(selectedStart.date);
    minDate.setDate(minDate.getDate() + (itemQuery.data.min_rental_days - 1));
    return buildDateOptions(itemQuery.data.max_rental_days, blockedKeys, minDate);
  }, [selectedStart, itemQuery.data, blockedKeys]);

  const selectedEnd = endOptions.find((o) => o.key === endKey);

  const daysCount =
    selectedStart && selectedEnd
      ? Math.round((selectedEnd.date.getTime() - selectedStart.date.getTime()) / 86_400_000) + 1
      : 0;

  const item = itemQuery.data;
  const settings = settingsQuery.data;
  const subtotal = item && daysCount ? Number(item.price_per_day) * daysCount : 0;
  const deposit = item ? Number(item.deposit_amount) : 0;
  const platformFee = settings ? Number(settings.platform_fee_flat) : 1;
  const total = subtotal + deposit + platformFee;

  const confirm = async () => {
    if (!item || !profile || !selectedStart || !selectedEnd) return;
    setErrorMsg(null);
    setStep("paying");

    try {
      const { data: rental, error: rentalError } = await supabase
        .from("rentals")
        .insert({
          item_id: item.id,
          renter_id: profile.id,
          owner_id: item.owner_id,
          start_date: selectedStart.key,
          end_date: selectedEnd.key,
          days_count: daysCount,
          price_per_day: item.price_per_day,
          subtotal,
          deposit_amount: deposit,
          platform_fee: platformFee,
          total_amount: total,
          status: "pending",
        })
        .select()
        .single();

      if (rentalError || !rental) throw rentalError;

      const charge = await paymentProvider.charge({
        rentalId: rental.id,
        amount: total,
        currency: "JOD",
        description: `استئجار ${item.title}`,
      });

      await supabase.from("payments").insert({
        rental_id: rental.id,
        amount: total,
        provider: "mock",
        provider_ref: charge.providerRef,
        type: "rental_payment",
        status: charge.status,
      });

      if (deposit > 0) {
        await supabase.from("security_deposits").insert({ rental_id: rental.id, amount: deposit, status: "held" });
      }

      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("item_id", item.id)
        .eq("renter_id", profile.id)
        .maybeSingle();

      if (!existingConversation) {
        await supabase
          .from("conversations")
          .insert({ item_id: item.id, rental_id: rental.id, renter_id: profile.id, owner_id: item.owner_id });
      }

      setStep("success");
    } catch {
      setErrorMsg(t.common.error);
      setStep("confirm");
    }
  };

  if (itemQuery.isLoading || !item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: spacing.lg }}>{t.common.loading}</Text>
      </SafeAreaView>
    );
  }

  if (step === "success") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <Text style={{ fontSize: 56 }}>🎉</Text>
          <Text style={typography.h2}>{t.booking.success}</Text>
          <Text style={styles.successBody}>{t.booking.successBody}</Text>
          <PrimaryButton label={t.booking.backHome} onPress={() => router.replace("/(tabs)")} style={{ marginTop: spacing.xl, width: "100%" }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={typography.h2}>{t.booking.title}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>

        <Text style={styles.label}>{t.booking.from}</Text>
        <DateChipPicker
          options={startOptions}
          selectedKey={startKey}
          onSelect={(o) => {
            setStartKey(o.key);
            setEndKey(null);
          }}
        />

        {selectedStart ? (
          <>
            <Text style={styles.label}>{t.booking.to}</Text>
            <DateChipPicker options={endOptions} selectedKey={endKey} onSelect={(o) => setEndKey(o.key)} />
          </>
        ) : null}

        {selectedStart && selectedEnd ? (
          <View style={styles.summaryCard}>
            <Text style={typography.h3}>{t.booking.priceBreakdown}</Text>
            <SummaryRow label={`${item.price_per_day} × ${daysCount} ${daysCount === 1 ? t.item.day : t.item.days}`} value={`${subtotal.toFixed(2)} ${t.common.jod}`} />
            {deposit > 0 ? <SummaryRow label={t.booking.deposit} value={`${deposit.toFixed(2)} ${t.common.jod}`} /> : null}
            <SummaryRow label={t.booking.platformFee} value={`${platformFee.toFixed(2)} ${t.common.jod}`} />
            <View style={styles.totalDivider} />
            <SummaryRow label={t.booking.total} value={`${total.toFixed(2)} ${t.common.jod}`} bold />
          </View>
        ) : null}

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={step === "paying" ? t.booking.paying : t.booking.confirm}
          onPress={confirm}
          loading={step === "paying"}
          disabled={!selectedStart || !selectedEnd || step === "paying"}
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={bold ? typography.bodyBold : typography.body}>{value}</Text>
      <Text style={bold ? typography.bodyBold : typography.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  itemTitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { ...typography.bodyBold, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: "right" },
  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.xl, gap: spacing.sm },
  summaryRow: { flexDirection: "row-reverse", justifyContent: "space-between" },
  totalDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.md, textAlign: "center" },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  successBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  successBody: { ...typography.body, color: colors.textMuted, textAlign: "center" },
});
