import { AppScreen } from "@/components/AppScreen";
import { Text } from "react-native";
import { colors, type } from "@/theme";

export default function RewardsPlaceholder() {
  return <AppScreen><Text style={{ ...type.displayL, color: colors.forest }}>Rewards</Text></AppScreen>;
}
