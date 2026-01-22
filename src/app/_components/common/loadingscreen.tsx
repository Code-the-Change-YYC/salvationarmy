import { Loader, Stack, Text } from "@mantine/core";
import styles from "./loadingscreen.module.scss";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className={styles.container}>
      <Stack align="center" gap="md">
        <Loader size="lg" color="#A03145" />
        <Text size="lg">{message}</Text>
      </Stack>
    </div>
  );
}
