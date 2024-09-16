import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Home } from "../screens/Home";
import { ThreeDScan } from "../screens/ThreeDScan";
import { LiveScan } from "../screens/LiveScan";
import { Files } from "../screens/Files";
import { DeviceManager } from "../screens/DeviceManager";

const Stack = createStackNavigator();

export function MainNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: "Deep 3D",
          }}
        />
        <Stack.Screen
          name="ThreeDScan"
          component={ThreeDScan}
          options={{
            title: "3D Zemin Tarama",
          }}
        />
        <Stack.Screen
          name="LiveScan"
          component={LiveScan}
          options={{
            title: "Canlı Tarama",
          }}
        />
        <Stack.Screen
          name="Files"
          component={Files}
          options={{
            title: "Dosya Görüntüle",
          }}
        />
        <Stack.Screen
          name="DeviceManager"
          component={DeviceManager}
          options={{
            title: "Cihaz Yönetimi",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
