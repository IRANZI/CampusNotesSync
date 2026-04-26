import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from "react-native-progress";

export default function Home() {
  // UI state for API posts and note form input
  const [posts, setPosts] = useState<any[]>([]);
  const [note, setNote] = useState("");

  // Persisted upload state and pending offline queue
  const [uploadedNotes, setUploadedNotes] = useState<string[]>([]);
  const [pendingNotes, setPendingNotes] = useState<string[]>([]);

  // Connection and loading state
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize network listener and load saved notes from storage
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });

    loadUploaded();
    loadPendingNotes();

    return () => unsub();
  }, []);

  // Load already uploaded notes from AsyncStorage
  const loadUploaded = async () => {
    const saved = await AsyncStorage.getItem("uploadedNotes");
    if (saved) {
      setUploadedNotes(JSON.parse(saved));
    }
  };

  // Load queued notes saved while offline
  const loadPendingNotes = async () => {
    const pending = await AsyncStorage.getItem("pendingActions");
    if (pending) {
      setPendingNotes(JSON.parse(pending));
    }
  };

  // Fetch posts from an API and cache them for offline use
  const fetchPosts = () => {
    setLoading(true);
    setTimeout(async () => {
      if (isOnline) {
        const r = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await r.json();
        const small = data.slice(0, 5);
        setPosts(small);
        await AsyncStorage.setItem("cachedPosts", JSON.stringify(small));
      } else {
        const cache = await AsyncStorage.getItem("cachedPosts");
        if (cache) {
          setPosts(JSON.parse(cache));
        }
      }
      setLoading(false);
    }, 1200);
  };

  // Upload a note, or queue it for later if offline
  const uploadNote = async () => {
    if (!note.trim()) {
      Alert.alert("Enter note first");
      return;
    }

    if (!isOnline) {
      const pending = await AsyncStorage.getItem("pendingActions");
      const queue = pending ? JSON.parse(pending) : [];
      const updatedQueue = [note, ...queue];
      await AsyncStorage.setItem(
        "pendingActions",
        JSON.stringify(updatedQueue),
      );
      setPendingNotes(updatedQueue);
      setNote("");
      Alert.alert("Offline", "Your note was queued and will sync when online.");
      return;
    }

    // Simulated upload progress while online
    setUploading(true);
    setProgress(0);
    let v = 0;

    const timer = setInterval(async () => {
      v += 0.12;
      setProgress(v);

      if (v >= 1) {
        clearInterval(timer);
        const updated = [note, ...uploadedNotes];
        setUploadedNotes(updated);
        await AsyncStorage.setItem("uploadedNotes", JSON.stringify(updated));
        setNote("");
        setUploading(false);
        Alert.alert("Uploaded successfully");
      }
    }, 220);
  };

  // Sync any pending offline notes when the network returns
  useEffect(() => {
    const syncPending = async () => {
      if (!isOnline) {
        return;
      }

      const pending = await AsyncStorage.getItem("pendingActions");
      if (pending) {
        const queued: string[] = JSON.parse(pending);
        if (queued.length) {
          const merged = [...queued, ...uploadedNotes];
          setUploadedNotes(merged);
          setPendingNotes([]);
          await AsyncStorage.setItem("uploadedNotes", JSON.stringify(merged));
          await AsyncStorage.removeItem("pendingActions");
          Alert.alert("Reconnected", `${queued.length} queued note(s) synced.`);
        }
      }
    };

    syncPending();
  }, [isOnline]);

  return (
    <ScrollView className="flex-1 bg-sky-50 px-5 pt-14">
      <View className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 rounded-[32px] p-6 shadow-xl mb-5">
        <Text className="text-white text-3xl font-bold">Campus Notes Sync</Text>
        <Text className="text-violet-100 mt-2">
          Networking + offline-first note demo
        </Text>
      </View>

      {/* Offline banner shown when there is no network connection */}
      {!isOnline && (
        <View className="bg-orange-100 p-4 rounded-2xl mb-4">
          <Text className="font-semibold text-orange-800">
            Offline mode active
          </Text>
          <Text className="text-orange-700 mt-1">
            Notes will queue until the connection returns.
          </Text>
        </View>
      )}

      {/* Button to fetch placeholder posts from the API */}
      <TouchableOpacity
        onPress={fetchPosts}
        className="bg-emerald-500 rounded-2xl p-4 mb-4"
      >
        <Text className="text-white text-center font-bold">
          Fetch API Notes
        </Text>
      </TouchableOpacity>

      {loading && (
        <View className="bg-white rounded-3xl p-5 mb-4 shadow">
          <Text className="text-slate-600">Fetching latest notes…</Text>
        </View>
      )}

      {/* Render fetched posts or cached posts when offline */}
      {posts.map((item: any) => (
        <View key={item.id} className="bg-white rounded-3xl p-5 mb-3 shadow">
          <Text className="font-bold text-lg mb-2">{item.title}</Text>
          <Text className="text-slate-600">{item.body}</Text>
        </View>
      ))}

      {/* Note upload form */}
      <View className="bg-white rounded-3xl p-5 mt-4 shadow">
        <Text className="text-xl font-bold mb-3">Upload Note</Text>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Type your class note..."
          multiline
          className="border border-slate-300 rounded-2xl p-4 min-h-[96px] text-base"
        />

        <TouchableOpacity
          onPress={uploadNote}
          className="bg-pink-500 rounded-2xl p-4 mt-4"
        >
          <Text className="text-white text-center font-bold">Upload Note</Text>
        </TouchableOpacity>

        {uploading && (
          <View className="mt-5 items-center">
            <Progress.Bar progress={progress} width={260} color="#7c3aed" />
            <Text className="mt-2 text-slate-600">
              Uploading {Math.round(progress * 100)}%
            </Text>
          </View>
        )}
      </View>

      {/* Display notes that are pending sync while offline */}
      {pendingNotes.length > 0 && (
        <View className="bg-yellow-50 rounded-3xl p-5 mt-6 shadow">
          <Text className="text-xl font-bold mb-3">Queued Notes</Text>
          <Text className="text-slate-600 mb-3">
            These notes are waiting to sync when you are back online.
          </Text>
          {pendingNotes.map((noteText, index) => (
            <View key={index} className="bg-yellow-100 rounded-2xl p-4 mb-3">
              <Text className="font-semibold text-slate-800">{noteText}</Text>
              <Text className="text-sm text-slate-500 mt-1">Queued</Text>
            </View>
          ))}
        </View>
      )}

      {/* Persisted uploaded notes section */}
      <View className="mt-6 mb-10">
        <Text className="text-2xl font-bold mb-3">Uploaded Notes</Text>

        {uploadedNotes.length === 0 && (
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-slate-600">No uploaded notes yet</Text>
          </View>
        )}

        {uploadedNotes.map((n, i) => (
          <View key={i} className="bg-cyan-100 rounded-2xl p-4 mb-3 shadow-sm">
            <Text className="text-slate-900">{n}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
