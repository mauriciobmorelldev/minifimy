import type { Metadata } from "next";
import { ComingSoonLoader } from "@/components/loading/ComingSoonLoader";

export const metadata: Metadata = {
  title: "Cargando 70%",
  description: "Pagina cargando, proximamente.",
};

export default function LoadingSeventyPage() {
  return <ComingSoonLoader progress={70} />;
}
