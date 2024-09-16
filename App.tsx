import { useEffect } from "react";
import { MainNavigation } from "./app/navigations/MainNavigation";
import { BluetoothProvider } from "./app/context/BluetoothContext";

export default function App() {
  useEffect(() => {}, []);

  return (
    <BluetoothProvider>
      <MainNavigation />
    </BluetoothProvider>
  );
}
