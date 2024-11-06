import React, { useEffect, useRef, useState } from "react";
import { View, Platform, Alert, TouchableOpacity, Text, ActivityIndicator } from "react-native";
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

      // Yeni dosya seçildiğinde eski veriyi sıfırlıyoruz
      SetCSVData(null);

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

              const { x, y, z, c } = keys;

              // z ve c değerlerinin olup olmadığını kontrol et
              const zExists = z !== undefined && !isNaN(parseFloat(z));
              const cExists = c !== undefined && !isNaN(parseFloat(c));

              if (x !== undefined && y !== undefined) {
                return {
                  x: parseFloat(x),
                  y: parseFloat(y),
                  z: zExists ? parseFloat(z) : null,
                  c: cExists ? parseFloat(c) : null,
                  zExists, // true veya false olarak kaydet
                  cExists  // true veya false olarak kaydet
                };
              }
              return null;
            })
            .filter((row: any) => row !== null);

          if (data.length > 0) {
            SetCSVData(data);
          } else {
            Alert.alert(
              "Desteklenmeyen Dosya Türü",
              "Bu dosya x, y, z ve c verilerini içermiyor."
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
      // z ve c değerlerinin olup olmadığını kontrol et
      const hasZData = CSVData.some((row: any) => row.z !== null && !isNaN(row.z)); // NaN kontrolü ekledik
      const hasCData = CSVData.some((row: any) => row.c !== null && !isNaN(row.c)); // NaN kontrolü ekledik

      console.log("hasZData:", hasZData); // Konsola yazdırarak kontrol et
      console.log("hasCData:", hasCData); // Konsola yazdırarak kontrol et

      // WebView'e verileri ve hasZData, hasCData değerlerini gönderiyoruz
      WebViewRef.current.postMessage(
        JSON.stringify({ values: CSVData, hasZData, hasCData })
      );
    }
  }, [CSVData]);


  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <WebView
        ref={WebViewRef}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        source={{ uri: "file:///android_asset/surface.html" }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="compatibility"
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" color="#0000ff" />}
        cacheEnabled={false}
        setLayerType={Platform.OS === "android" ? "software" : "hardware"}
        onLoadEnd={() => {
          if (CSVData) {
            WebViewRef.current.postMessage(JSON.stringify({ values: CSVData }));
          }
        }}
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
