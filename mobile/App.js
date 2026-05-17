import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

const STORAGE_KEY = "km-budget-studio-v1";

const starterCategories = [
  "Salary|income", "Side income|income", "Refunds|income", "Other income|income",
  "Rent / Mortgage|expense", "Utilities|expense", "Groceries|expense", "Dining out|expense",
  "Transportation|expense", "Insurance|expense", "Phone / Internet|expense", "Subscriptions|expense",
  "Debt payments|expense", "Savings / Investing|expense", "Health|expense", "Personal care|expense",
  "Shopping|expense", "Entertainment|expense", "Travel|expense", "Gifts / Donations|expense",
  "Miscellaneous|expense", "Buffer|expense"
].map((item, index) => {
  const [name, type] = item.split("|");
  return { id: `cat-${index}`, name, type, budget: 0, sort: index };
});

const emptyState = {
  activeMonth: monthKey(new Date()),
  categories: starterCategories,
  transactions: []
};

export default function App() {
  const [state, setState] = useState(emptyState);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [syncText, setSyncText] = useState("");
  const [tab, setTab] = useState("daily");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!saved) return;
      try {
        setState(normalizeImportedState(JSON.parse(saved)));
      } catch (_) {}
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const expenseCategories = useMemo(
    () => state.categories.filter((cat) => cat.type === "expense").sort((a, b) => a.sort - b.sort),
    [state.categories]
  );

  useEffect(() => {
    if (!expenseCategories.find((cat) => cat.name === category)) {
      setCategory(expenseCategories[0]?.name || "Miscellaneous");
    }
  }, [expenseCategories, category]);

  const todayRows = state.transactions.filter((tx) => tx.date === todayKey() && tx.type === "expense");
  const monthRows = state.transactions.filter((tx) => monthKey(tx.date) === state.activeMonth);
  const todaySpent = sum(todayRows.map((tx) => tx.amount));
  const monthSpent = sum(monthRows.filter((tx) => tx.type === "expense").map((tx) => tx.amount));
  const monthIncome = sum(monthRows.filter((tx) => tx.type === "income").map((tx) => tx.amount));

  function addDailySpend() {
    const parsedAmount = parseMoney(amount);
    if (parsedAmount <= 0) {
      Alert.alert("Amount needed", "Enter an amount greater than 0 KM.");
      return;
    }

    const next = {
      id: createId(),
      date: todayKey(),
      type: "expense",
      category,
      description: description.trim(),
      method: "Mobile",
      account: "",
      amount: parsedAmount,
      cleared: "yes",
      createdAt: new Date().toISOString()
    };

    setState((current) => ({
      ...current,
      activeMonth: monthKey(next.date),
      transactions: [...current.transactions, next]
    }));
    setAmount("");
    setDescription("");
  }

  async function copySyncString() {
    const value = encodeSyncState(state);
    setSyncText(value);
    await Clipboard.setStringAsync(value);
    Alert.alert("Copied", "Sync string copied. Send it to your PC and import it there.");
  }

  function importSyncString() {
    try {
      const imported = normalizeImportedState(decodeSyncState(syncText.trim()));
      setState(imported);
      Alert.alert("Imported", "Your budget data was updated on this phone.");
    } catch (_) {
      Alert.alert("Import failed", "That sync string is not valid.");
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f7f9fb" }} contentContainerStyle={{ padding: 18, paddingTop: 58, gap: 16 }}>
      <StatusBar style="dark" />
      <View style={{ gap: 4 }}>
        <Text selectable style={{ color: "#177e89", fontSize: 13, fontWeight: "800" }}>KM Budget Studio</Text>
        <Text selectable style={{ color: "#101828", fontSize: 30, fontWeight: "900", letterSpacing: 0 }}>Daily spending</Text>
        <Text selectable style={{ color: "#667085", fontSize: 14, lineHeight: 20 }}>Fast entry first. Full history moves between phone and PC with sync strings.</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TabButton label="Daily" active={tab === "daily"} onPress={() => setTab("daily")} />
        <TabButton label="Sync" active={tab === "sync"} onPress={() => setTab("sync")} />
      </View>

      {tab === "daily" ? (
        <>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Stat label="Today" value={km(todaySpent)} tone="#177e89" />
            <Stat label="Month" value={km(monthSpent)} tone="#b42318" />
          </View>
          <Stat label="Month income" value={km(monthIncome)} tone="#2f7d4f" />

          <Card>
            <Text selectable style={styles.cardTitle}>Add spend</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="Amount KM"
              style={styles.input}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {expenseCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.name)}
                  style={[styles.chip, category === cat.name && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === cat.name && styles.chipTextActive]}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Note, optional"
              style={styles.input}
            />
            <Pressable onPress={addDailySpend} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Add to today</Text>
            </Pressable>
          </Card>

          <Card>
            <Text selectable style={styles.cardTitle}>Today’s entries</Text>
            {todayRows.length === 0 ? (
              <Text selectable style={styles.muted}>Nothing added today yet.</Text>
            ) : todayRows.slice().reverse().map((tx) => (
              <View key={tx.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text selectable style={styles.rowTitle}>{tx.category}</Text>
                  <Text selectable style={styles.muted}>{tx.description || "No note"}</Text>
                </View>
                <Text selectable style={styles.amount}>{km(tx.amount)}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Card>
          <Text selectable style={styles.cardTitle}>Phone / PC sync</Text>
          <Text selectable style={styles.muted}>Copy a string from this phone, paste it on PC, or paste a PC string here and import.</Text>
          <Pressable onPress={copySyncString} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Create and copy sync string</Text>
          </Pressable>
          <TextInput
            value={syncText}
            onChangeText={setSyncText}
            placeholder="Paste sync string here"
            multiline
            style={[styles.input, { minHeight: 160, textAlignVertical: "top" }]}
          />
          <Pressable onPress={importSyncString} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Import string</Text>
          </Pressable>
        </Card>
      )}
    </ScrollView>
  );
}

function Card({ children }) {
  return (
    <View style={{ gap: 12, padding: 16, borderRadius: 14, borderCurve: "continuous", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d8e0e7", boxShadow: "0 8px 24px rgba(16, 24, 40, 0.08)" }}>
      {children}
    </View>
  );
}

function Stat({ label, value, tone }) {
  return (
    <View style={{ flex: 1, gap: 6, padding: 14, borderRadius: 14, borderCurve: "continuous", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d8e0e7" }}>
      <Text selectable style={{ color: "#667085", fontSize: 12, fontWeight: "800" }}>{label}</Text>
      <Text selectable style={{ color: tone, fontSize: 24, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{value}</Text>
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = {
  cardTitle: { color: "#101828", fontSize: 17, fontWeight: "900" },
  muted: { color: "#667085", fontSize: 13, lineHeight: 19 },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#d8e0e7", borderRadius: 12, borderCurve: "continuous", paddingHorizontal: 12, paddingVertical: 10, color: "#101828", backgroundColor: "#fff", fontSize: 16 },
  primaryButton: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 12, borderCurve: "continuous", backgroundColor: "#177e89" },
  primaryText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  secondaryButton: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 12, borderCurve: "continuous", borderWidth: 1, borderColor: "#177e89", backgroundColor: "#ffffff" },
  secondaryText: { color: "#177e89", fontSize: 15, fontWeight: "900" },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: "#eef5f4", borderWidth: 1, borderColor: "#d8e0e7" },
  chipActive: { backgroundColor: "#177e89", borderColor: "#177e89" },
  chipText: { color: "#344054", fontSize: 13, fontWeight: "800" },
  chipTextActive: { color: "#ffffff" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#eef2f6" },
  rowTitle: { color: "#101828", fontSize: 14, fontWeight: "900" },
  amount: { color: "#b42318", fontSize: 15, fontWeight: "900", fontVariant: ["tabular-nums"] },
  tab: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d8e0e7" },
  tabActive: { backgroundColor: "#152033", borderColor: "#152033" },
  tabText: { color: "#344054", fontSize: 14, fontWeight: "900" },
  tabTextActive: { color: "#ffffff" }
};

function encodeSyncState(source) {
  const payload = {
    app: "km-budget-studio",
    version: 1,
    exportedAt: new Date().toISOString(),
    activeMonth: source.activeMonth || monthKey(new Date()),
    categories: source.categories || [],
    transactions: source.transactions || []
  };
  return `KMB1.${base64UrlEncode(JSON.stringify(payload))}`;
}

function decodeSyncState(text) {
  const clean = text.replace(/\s+/g, "");
  if (clean.startsWith("KMB1.")) return JSON.parse(base64UrlDecode(clean.slice(5)));
  return JSON.parse(text);
}

function normalizeImportedState(parsed) {
  if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.transactions)) throw new Error("Invalid budget data");
  return {
    activeMonth: parsed.activeMonth || monthKey(new Date()),
    categories: parsed.categories.map((cat, index) => ({
      id: cat.id || `cat-${index}-${Date.now()}`,
      name: String(cat.name || "Untitled"),
      type: cat.type === "income" ? "income" : "expense",
      budget: parseMoney(cat.budget),
      sort: Number.isFinite(Number(cat.sort)) ? Number(cat.sort) : index
    })),
    transactions: parsed.transactions.map((tx, index) => ({
      id: tx.id || `tx-${index}-${Date.now()}`,
      date: tx.date || todayKey(),
      type: tx.type === "income" ? "income" : "expense",
      category: String(tx.category || "Miscellaneous"),
      description: String(tx.description || ""),
      method: String(tx.method || "Mobile"),
      account: String(tx.account || ""),
      amount: parseMoney(tx.amount),
      cleared: tx.cleared === "no" ? "no" : "yes",
      createdAt: tx.createdAt || new Date().toISOString()
    }))
  };
}

function base64UrlEncode(value) {
  const binary = unescape(encodeURIComponent(value));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}

function parseMoney(value) {
  return Math.max(0, Number(String(value || "0").replace(",", ".")) || 0);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function km(value) {
  const clean = Math.abs(value) < 0.005 ? 0 : value;
  return `${clean.toFixed(2)} KM`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(value) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function createId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
