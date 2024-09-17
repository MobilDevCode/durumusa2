import React, { useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import WebView from "react-native-webview";
import RNFS from "react-native-fs"
import { useBluetooth } from "../context/BluetoothContext";

interface ThreeDScanProps {
  route: any;
  navigation: any;
}

interface DataPoint {
  x: number;
  y: number;
  z: number;
}

export function ThreeDScan({ route, navigation }: ThreeDScanProps) {
  const { connectedDevice } = useBluetooth();
  const params = route.params;
  const WebViewRef = useRef<WebView>(null);
  const [CSVData, SetCSVData] = useState<DataPoint[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isZigzag, setIsZigzag] = useState<boolean>(route.params.zigzag);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  const createData = (rows: number, cols: number) => {
    const step = 30;
    const data: DataPoint[] = [];

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        data.push({ x: x * step, y: y * step, z: 0 });
      }
    }

    SetCSVData(data);
  };

  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  };

  

  const saveToCSV = async () => {
    if (CSVData) {
      // CSV başlıklarını ekleyelim
      const header = "x,y,z\n";
      const csvContent = CSVData.map(
        (data) => `${data.x},${data.y},${data.z}`
      ).join("\n");
      const completeContent = header + csvContent;

      const directoryPath = RNFS.DownloadDirectoryPath;

      try {
        // Klasörün var olup olmadığını kontrol edin, yoksa oluşturun
        const dirExists = await RNFS.exists(directoryPath);
        if (!dirExists) {
          await RNFS.mkdir(directoryPath);
        }

        const finalFileName = fileName ? fileName : `Deep3D_${getFormattedDate()}.csv`;
        const path = `${directoryPath}/${finalFileName}.csv`;

        await RNFS.writeFile(path, completeContent, "utf8");
        Alert.alert(
          "Başarılı",
          `Veri ${finalFileName}.csv adıyla ${directoryPath} klasörüne kaydedildi.`
        );
      } catch (error) {
        Alert.alert("Hata", "Veri kaydedilirken bir hata oluştu.");
      }
    }
  };


  const getData: any = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.write("M");
        const response: any = await connectedDevice.read();
        const parsedResponse = parseFloat(response); // Cihazdan gelen cevabı sayıya çeviriyoruz
        return parsedResponse;
      } catch (e) {
        console.error("Komut gönderme hatası", e);
      }
    }
  };

  const updateZValue = async () => {
    if (CSVData && currentIndex < CSVData.length) {
      const newData = [...CSVData];
      if (isZigzag) {
        const rowLength = params.x;
        const zigzagIndex =
          Math.floor(currentIndex / rowLength) % 2 === 0
            ? currentIndex
            : Math.floor(currentIndex / rowLength) * rowLength +
              (rowLength - 1) -
              (currentIndex % rowLength);
        newData[zigzagIndex].z = await getData();
      } else {
        newData[currentIndex].z = await getData();
      }
      SetCSVData(newData);

      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      // Tüm veriler güncellendiğinde uyarı verme
      if (newIndex === CSVData.length) {
        Alert.alert(
          "Tamamlandı",
          "Tüm ölçümler tamamlandı. Veriyi kaydetmek istiyor musunuz?",
          [
            {
              text: "Hayır",
              onPress: () => console.log("Veri kaydedilmedi."),
              style: "cancel",
            },
            {
              text: "Evet",
              onPress: () => setIsModalVisible(true),
            },
          ]
        );
      }
    }
  };

  const handleSave = () => {
    setIsModalVisible(false);
    saveToCSV();
  };

  useEffect(() => {
    if (WebViewRef.current && CSVData) {
      WebViewRef.current.postMessage(JSON.stringify({ values: CSVData }));
    }
  }, [CSVData]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <WebView
        ref={WebViewRef}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        source={{ uri: "file:///android_asset/scanmode.html" }}
        javaScriptEnabled
        onLoadEnd={() => {
          createData(params.x, params.y);
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
        onPress={updateZValue}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>
          Ölçüm Al
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: "white",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ marginBottom: 10 }}>Dosya Adını Girin:</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 20,
                width: "100%",
                paddingHorizontal: 10,
              }}
              placeholder="Dosya adı"
              value={fileName}
              onChangeText={setFileName}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#000",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
                width: "100%",
              }}
              onPress={handleSave}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
