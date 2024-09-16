import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Modal,
  Button,
  Dimensions,
  TouchableOpacity,
} from "react-native";

export function Home({ route, navigation }: any) {
  const [List, SetList] = useState([
    {
      id: "1",
      name: "3D Zemin Tarama",
      description:
        "Yüksek doğrulukta 3D zemin modellemesi için gelişmiş tarama modülü.",
      color: "#1e90ff", // Mavi
      path: "ThreeDScan",
      modal: true,
    },
    {
      id: "2",
      name: "Canlı Tarama",
      description:
        "Anlık verilerle zemin yapısını gerçek zamanlı izleme ve analiz etme.",
      color: "#32cd32", // Yeşil
      path: "LiveScan",
    },
    {
      id: "3",
      name: "Dosya Görüntüle",
      description:
        "Önceden kaydedilmiş tarama verilerini hızlıca gözden geçirin.",
      color: "#ff4500", // Turuncu
      path: "Files",
    },
    {
      id: "4",
      name: "Cihaz Yönetimi",
      description:
        "Bağlantılı tarama cihazlarının ayarlarını yönetin ve kontrol edin.",
      color: "#8a2be2", // Mor
      path: "DeviceManager",
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [pulseCount, setPulseCount] = useState(10);
  const [searchOrder, setSearchOrder] = useState(10);
  const [scanDirection, setScanDirection] = useState("Zigzag");

  const RenderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => {
        if (item.modal) {
          setModalVisible(true);
        } else {
          navigation.navigate(item.path);
        }
      }}
    >
      <View style={[styles.item, { backgroundColor: item.color }]}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={List}
        renderItem={RenderItem}
        keyExtractor={(item) => item.id}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.directionContainer}>
              <Text style={styles.modalText}>Tarama Yönü</Text>
              <View style={styles.directionOptions}>
                <TouchableOpacity
                  style={[
                    styles.directionButton,
                    scanDirection === "Zigzag" && styles.selectedDirection,
                  ]}
                  onPress={() => setScanDirection("Zigzag")}
                >
                  <Text
                    style={[
                      styles.directionText,
                      { color: scanDirection === "Zigzag" ? "#fff" : "#000" },
                    ]}
                  >
                    Zigzag
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.directionButton,
                    scanDirection === "Paralel" && styles.selectedDirection,
                  ]}
                  onPress={() => setScanDirection("Paralel")}
                >
                  <Text
                    style={[
                      styles.directionText,
                      { color: scanDirection === "Paralel" ? "#fff" : "#000" },
                    ]}
                  >
                    Paralel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.counterContainer}>
              <Text style={styles.modalText}>Sinyal Darbe Sayısı</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setPulseCount((prevCount) => Math.max(prevCount - 1, 0))
                  }
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>{pulseCount}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setPulseCount((prevCount) => prevCount + 1)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.counterContainer}>
              <Text style={styles.modalText}>Arama Sırası</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setSearchOrder((prevOrder) => Math.max(prevOrder - 1, 0))
                  }
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>{searchOrder}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setSearchOrder((prevOrder) => prevOrder + 1)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                display: "flex",
                width: Dimensions.get("screen").width - 70,
              }}
            >
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                  navigation.navigate("ThreeDScan", {
                    x: pulseCount,
                    y: searchOrder,
                    zigzag: scanDirection == "Zigzag" ? true : false,
                  });
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.startButtonText}>Taramaya Başla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
  },
  item: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 10,
    gap: 5,
  },
  title: {
    fontSize: 18,
    color: "#FFF",
  },
  description: {
    fontSize: 12,
    color: "#FFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  modalContent: {
    width: Dimensions.get("screen").width - 30,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  counterContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 150,
  },
  counterButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    padding: 10,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  counterText: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  directionContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  directionOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  directionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
    width: Dimensions.get("screen").width / 2 - 50,
  },
  directionText: {
    fontSize: 16,
  },
  selectedDirection: {
    backgroundColor: "#000",
  },
  startButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#000",
    fontSize: 16,
  },
});
