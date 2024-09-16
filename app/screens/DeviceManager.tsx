import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import { useBluetooth } from "../context/BluetoothContext";

export function DeviceManager() {
  const { connectedDevice, connectToDevice, disconnectDevice } = useBluetooth();
  const [pairedDevices, setPairedDevices] = React.useState<BluetoothDevice[]>(
    []
  );
  const [loading, setLoading] = useState("");

  const getPairedDevices = async () => {
    try {
      const available = await RNBluetoothClassic.isBluetoothAvailable();
      if (available) {
        const paired = await RNBluetoothClassic.getBondedDevices();
        const filteredPaired = paired.filter((device) =>
          device.name.toLowerCase().includes("deep")
        );
        setPairedDevices(filteredPaired);
      }
    } catch (e) {
      console.error("Bluetooth mevcut değil", e);
    }
  };

  const handleDevicePress = async (device: BluetoothDevice) => {
    if (connectedDevice && connectedDevice.address === device.address) {
      Alert.alert(
        "Zaten Bağlı",
        `${connectedDevice.name} cihazına zaten bağlısınız.`
      );
      return;
    }

    try {
      setLoading(device.id);
      await connectToDevice(device).then(() => {
        setLoading("");
      });
    } catch (e) {
      Alert.alert(
        "Bağlantı Başarısız",
        `${device.name} cihazına bağlanılamadı.`
      );
      console.error("Bağlantı hatası", e);
      setLoading("");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectDevice();
    } catch (e) {
      console.error("Bağlantı kesme hatası", e);
    }
  };

  useEffect(() => {
    getPairedDevices();
  }, []);

  const renderItem = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceButton}
      onPress={() => {
        connectedDevice && connectedDevice.address === item.address
          ? handleDisconnect()
          : handleDevicePress(item);
      }}
    >
      <View style={styles.deviceContainer}>
        <View>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceAddress}>{item.address}</Text>
        </View>
        {loading === item.id ? (
          <ActivityIndicator size={24} color="#FFF" />
        ) : connectedDevice && connectedDevice.address === item.address ? (
          <Text style={styles.disconnectText}>Sonlandır</Text>
        ) : (
          <Text style={styles.connectText}>Bağlan</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        style={{ flex: 1, backgroundColor: "#fff" }}
        data={pairedDevices}
        keyExtractor={(item) => item.address}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyList}>Eşleşmiş Cihaz Bulunamadı</Text>
        }
        contentContainerStyle={styles.listContent}
      />
      {connectedDevice && (
        <View style={styles.connectedDeviceContainer}>
          <Text style={styles.connectedDeviceText}>
            {connectedDevice.name} Cihazına Bağlı
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deviceButton: {
    backgroundColor: "#1e90ff",
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  deviceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceName: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  deviceAddress: {
    fontSize: 14,
    color: "#D1E9FF",
  },
  connectText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  disconnectText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyList: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontSize: 16,
  },
  connectedDeviceContainer: {
    padding: 16,
    backgroundColor: "#22c55e",
    alignItems: "center",
    margin: 16,
    borderRadius: 8,
  },
  connectedDeviceText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    paddingVertical: 16,
  },
});
