import { TemperatureReading } from "@/src/types";
import { TemperatureDial } from "@/src/components/TemperatureDial";
import { calculatePeak } from "@/src/utils/calculatePeak";

type Props = {
  history: TemperatureReading[];
};

export default function DialPeakTemp({ history }: Props) {
  const peak = calculatePeak(history);
  return <TemperatureDial label="24hr Peak" value={peak} />;
}
