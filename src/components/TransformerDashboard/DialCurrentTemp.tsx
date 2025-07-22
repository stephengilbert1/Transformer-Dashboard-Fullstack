import { TemperatureReading } from "@/src/types";
import { TemperatureDial } from "@/src/components/TemperatureDial";

type Props = {
  history: TemperatureReading[];
};

export default function DialCurrentTemp({ history }: Props) {
  const currentTemp =
    history
      .slice()
      .reverse()
      .find((entry) => new Date(entry.timestamp).getTime() <= Date.now())?.tempC ?? null;

  return <TemperatureDial label="Current Temp." value={currentTemp} />;
}
