import { AcademyHomePage } from "@/components/academy/academy-home-page";
import { AcademyDirectory } from "@/components/panel/academy-directory";
import { isAcademyPathRequest } from "@/lib/panel-route.server";

export default async function Home() {
  if (await isAcademyPathRequest()) {
    return <AcademyHomePage />;
  }

  return <AcademyDirectory />;
}
