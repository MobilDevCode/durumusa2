import React, { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import { useBluetooth } from "../context/BluetoothContext";
import WebView from "react-native-webview";

export function LiveScan() {
  const { connectedDevice } = useBluetooth();
  const [scanData, setScanData] = useState<number>(0);

  const WebViewRef: any = useRef();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const sendCommand = async () => {
      if (connectedDevice) {
        try {
          await connectedDevice.write("L");
          const response: any = await connectedDevice.read();
          const parsedResponse = parseFloat(response); // Cihazdan gelen cevabı sayıya çeviriyoruz
          if (!isNaN(parsedResponse)) {
            setScanData(parsedResponse); // Veriyi state'e kaydediyoruz
          }
        } catch (e) {
          console.error("Komut gönderme hatası", e);
        }
      }
    };

    if (connectedDevice) {
      interval = setInterval(() => {
        sendCommand();
      }, 200);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [connectedDevice]);

  useEffect(() => {
    if (WebViewRef.current) {
      WebViewRef.current.postMessage(JSON.stringify({ gaugeValue: scanData }));
    }
  }, [scanData]);

  const chartData = {
    labels: ["Veri"], // Grafik üzerindeki etiket
    data: [scanData / 100], // Veriyi 0 ile 1 arasında olacak şekilde normalleştiriyoruz
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={WebViewRef}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        source={{ uri: "file:///android_asset/gauge.html" }}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scanData: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
  },
});
