import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { http } from "../../src/api/http";
import { Theme } from "../../src/styles/Theme";
import { useAuth } from "../../src/context/AuthContext";

export default function Files() {
  const { token } = useAuth();
  
  // state for the list of files
  const [files, setFiles] = useState([]);
  
  // ui states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // function to load data from server
  const fetchFiles = async () => {
    try {
      setError("");
      
      // request to get all files (adjust route if needed, e.g. /files/my)
      // the token is passed automatically by our api wrapper if provided here
      const data = await http.get("/files", { token });

      // we assume the server returns an array or an object { files: [] }
      const list = Array.isArray(data) ? data : (data?.files || []);
      setFiles(list);

    } catch (e) {
      console.log("failed to load files", e);
      setError("Could not load your files");
    } finally {
      // stop loading indicators
      setLoading(false);
      setRefreshing(false);
    }
  };

  // load on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchFiles();
  };

  // render a single file row
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* simple icon */}
      <View style={styles.iconBox}>
        <Text style={{ fontSize: 20 }}>📄</Text>
      </View>
      
      {/* file details */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.filename || item.name || "Unknown File"}
        </Text>
        <Text style={styles.meta}>
          {/* simple size formatter */}
          {item.size ? (item.size / 1024).toFixed(1) + " KB" : "0 KB"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* show error if any */}
      {!!error && (
        <View style={styles.center}>
            <Text style={styles.err}>{error}</Text>
        </View>
      )}

      {/* show loading only on first load */}
      {loading && !refreshing && !error && (
        <View style={styles.center}>
            <Text style={styles.txt}>Loading...</Text>
        </View>
      )}

      {/* the list of files */}
      {!loading && !error && (
        <FlatList
          data={files}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[Theme.colors.primary]} 
                tintColor={Theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
                <Text style={styles.txt}>No files found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  listContent: {
    padding: Theme.spacing.m,
  },
  center: {
    padding: Theme.spacing.xl,
    alignItems: "center",
  },
  txt: {
    color: Theme.colors.muted,
    fontSize: Theme.font.body,
  },
  err: {
    color: Theme.colors.danger,
    fontSize: Theme.font.body,
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.m,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.s,
    backgroundColor: Theme.colors.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.m,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Theme.colors.text,
    fontSize: Theme.font.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  meta: {
    color: Theme.colors.muted,
    fontSize: Theme.font.small,
  },
});