import { getCronHello } from "../../../api/servers/cron";

export default function CronPage() {
  return <div>{getCronHello()}</div>;
}
