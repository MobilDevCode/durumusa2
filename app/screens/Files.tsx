import React, { useEffect, useRef, useState } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import WebView from "react-native-webview";

export function Files() {
  const WebViewRef: any = useRef();
  const [CSVData, SetCSVData]: any = useState(null);

  const pickDocument = async () => {
    try {
      const res: any = await DocumentPicker.getDocumentAsync({});

      if (res.canceled) {
        console.log("Kullanıcı seçimden vazgeçti");
        return;
      }

      const fileUri = res.assets[0].uri;
      if (!fileUri) {
        throw new Error("Dosya URI'si alınamadı");
      }

      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const data = result.data
            .map((row: any) => {
              const keys = Object.keys(row).reduce((acc: any, key) => {
                acc[key.trim().toLowerCase()] = row[key];
                return acc;
              }, {});

              const { x, y, z } = keys;

              if (x !== undefined && y !== undefined && z !== undefined) {
                return { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) };
              }
              return null;
            })
            .filter((row: any) => row !== null);

          if (data.length > 0) {
            SetCSVData(data);
            console.log(data);
          } else {
            Alert.alert(
              "Desteklenmeyen Dosya Türü",
              "Bu dosya x, y, z verilerini içermiyor."
            );
          }
        },
        error: (err: any) => {
          console.error("CSV parse hatası:", err);
        },
      });
    } catch (err) {
      console.error("Dosya seçimi hatası:", err);
    }
  };

  useEffect(() => {
    if (WebViewRef.current && CSVData) {
      WebViewRef.current.postMessage(JSON.stringify({ values: CSVData }));
    }
  }, [CSVData]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <WebView
        ref={WebViewRef}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        source={{ uri: "file:///android_asset/surface.html" }}
        javaScriptEnabled
      />
      <TouchableOpacity
        style={{
          padding: 16,
          backgroundColor: "#000",
          alignItems: "center",
          margin: 16,
          borderRadius: 8,
        }}
        onPress={pickDocument}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>
          CSV Dosyası Seç
        </Text>
      </TouchableOpacity>
    </View>
  );
}
