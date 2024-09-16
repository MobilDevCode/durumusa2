import React, { createContext, useContext, useState, useEffect } from "react";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";

type BluetoothContextType = {
  connectedDevice: BluetoothDevice | null;
  connectToDevice: (device: BluetoothDevice) => Promise<void>;
  disconnectDevice: () => Promise<void>;
};

const BluetoothContext = createContext<BluetoothContextType | undefined>(
  undefined
);

export const BluetoothProvider: React.FC = ({ children }) => {
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      const connected = await device.connect();
      if (connected) {
        setConnectedDevice(device);
      }
    } catch (e) {
      console.error("Connection error", e);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      await connectedDevice.disconnect();
      setConnectedDevice(null);
    }
  };

  // İlk bağlantıyı kontrol etme
  useEffect(() => {
    const checkInitialConnection = async () => {
      try {
        // Daha önce bağlı olan cihazın adresini bir yerden (async storage, context, vs.) almanız gerekebilir.
        // Örneğin:
        const address = "00:00:00:00:00:00"; // Yerini, daha önce bilinen cihaz adresiyle değiştirebilirsiniz.
        const device = await RNBluetoothClassic.getConnectedDevice(address);
        if (device) {
          setConnectedDevice(device);
        }
      } catch (e) {
        console.error("No connected device found", e);
      }
    };

    checkInitialConnection();
  }, []);

  return (
    <BluetoothContext.Provider
      value={{ connectedDevice, connectToDevice, disconnectDevice }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
};
