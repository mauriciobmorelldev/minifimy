import type { Metadata } from "next";
import { ComingSoonLoader } from "@/components/loading/ComingSoonLoader";

export const metadata: Metadata = {
  title: "Cargando 99%",
  description: "Pagina cargando, proximamente.",
};

export default function LoadingNinetyNinePage() {
  return <ComingSoonLoader progress={99} />;
}
