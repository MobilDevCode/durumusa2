import React, { useEffect, useState } from "react";
import { View, Text, Button, PermissionsAndroid, Platform, FlatList, TouchableOpacity } from "react-native";
import BleManager from "react-native-ble-manager";

const App = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);

  useEffect(() => {
    BleManager.start({ showAlert: false });
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);

      return (
        granted["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.BLUETOOTH_ADVERTISE"] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true; // iOS does not require runtime permissions for Bluetooth
  };

  const scanDevices = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      console.log("Permissions not granted");
      return;
    }

    BleManager.scan([], 5, true).then(() => {
      console.log("Scanning...");
      setTimeout(() => {
        BleManager.getDiscoveredPeripherals([]).then((peripheralsArray) => {
          console.log("Discovered Peripherals:", peripheralsArray);
          setDevices(peripheralsArray); // Bulunan cihazları state'e kaydediyoruz
        });
      }, 3000);
    });
  };

  const connectToDevice = (device) => {
    BleManager.connect(device.id)
      .then(() => {
        console.log("Connected to", device.name);
        setConnectedDevice(device);
      })
      .catch((error) => {
        console.log("Connection error", error);
      });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Bluetooth Connection</Text>
      <Button title="Scan Devices" onPress={scanDevices} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: connectedDevice && connectedDevice.id === item.id ? 'green' : 'white',
              marginBottom: 5,
              borderRadius: 5,
            }}
            onPress={() => connectToDevice(item)}
          >
            <Text>{item.name || "Unnamed Device"}</Text>
            <Text>ID: {item.id}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default App;
