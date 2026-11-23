import { redirect } from "next/navigation";
import { pilotEvent } from "@/lib/preview/data";

export default function Page() {
  redirect(pilotEvent.href);
}
