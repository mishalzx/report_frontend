import { redirect } from "next/navigation";
import { getUserMeLoader } from "@/app/data/services/get-user-me-loader";

export default async function Home() {
  const user = await getUserMeLoader();
  if (!user.ok) {
    redirect("/signin");
  }
  redirect("/dashboard");
}
