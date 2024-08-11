import React from "react";
import { Document } from "@react-pdf/renderer";
import {
  CepilladoDiagnosisComponent,
  PapDiagnosisComponent,
  BiopsiaDiagnosisComponent,
} from "@/app/ui/pdfComponents";

import {
  Visitas,
  Paciente,
  PapDiagnosis,
  PapVisita,
  BiopsiaVisita,
} from "../../../types/supabase";

const DocumentoPDF = ({
  paciente,
  visita,
}: {
  paciente: Paciente;
  visita: Visitas;
}) => {
  const pdfComponent = (() => {
    switch (visita.type) {
      case "pap":
      case "silDeBajoGradoDiagnosis":
      case "silAltoGradoDiagnosis":
        return (
          <PapDiagnosisComponent
            paciente={paciente}
            visita={visita as PapVisita}
          />
        );
      case "cepilladoDiagnosis":
        return (
          <CepilladoDiagnosisComponent paciente={paciente} visita={visita} />
        );
      case "biopsiaDiagnosis":
      case "diverticuloMeckelDiagnosis":
      case "polipoColonAdenomatosoDiagnosis":
      case "polipoEndometrialCopiaDiagnosis":
      case "quisteDeOvarioDiagnosis":
      case "quistePilonidalDiagnosis":
      case "adenocaColonMucinosoDiagnosis":
      case "adenocaEndometrioDiagnosis":
      case "condilomasMultiplesDiagnosis":
      case "conoSilBajoGradoDiagnosis":
      case "conoSilAltoGradoDiagnosis":
      case "corangiosisPlacentariaDiagnosis":
      case "queratiosisSeborreicaDiagnosis":
      case "vulvaDiagnosis":
      case "apendicitisGangrenosaDiagnosis":
      case "basocelularDiagnosis":
      case "colecistitisAgudaDiagnosis":
      case "condilomaAcuminadoDiagnosis":
      case "cuelloEndocervixDiagnosis":
      case "cuelloVaginaDiagnosis":
      case "estomagoPolipoRectoDiagnosis":
      case "gastritisDiagnosis":
      case "hemoroidesDiagnosis":
      case "hstBilateralMiomasDiagnosis":
      case "hstTotalMasAnexosPolipoEndometrioDiagnosis":
      case "infartoIntestinalDiagnosis":
      case "placentaHematomaRetroDiagnosis":
      case "placentaHTADiagnosis":
      case "polipoEndometrioDiagnosis":
      case "polipoEstomagoYEstomagoDiagnosis":
      case "quisteDeInclusionEpidDiagnosis":
      case "tejidoNecroticoDiagnosis":
      case "ulceraGastricaDiagnosis":
      case "lipomaDiagnosis":
      case "mamaFibroadenomaDiagnosis":
      case "partesBlandasDiagnosis":
      case "pielDiagnosis":
      case "pielNevusDiagnosis":
      case "placentaDiagnosis":
      case "placentaAcretaDiagnosis":
      case "polipoColonDiagnosis":
      case "polipoEndocervicalDiagnosis":
      case "prolapsoDiagnosis":
      case "restosPlacentariosDiagnosis":
      case "vaginaDiagnosis":
      case "verrugaVulgarDeVulvaDiagnosis":
      case "vesiculaDiagnosis":
      case "endocervixYEndometrioDiagnosis":
      case "endometrioDiagnosis":
      case "endometrioDisgregadoDiagnosis":
      case "estomagoYDuodenoDiagnosis":
      case "extraccionDiuDiagnosis":
      case "fibromaBlandoDiagnosis":
      case "granulomaDeVaginaDiagnosis":
      case "histerectomiaSimpleDiagnosis":
      case "leiomiomaHipercelularDiagnosis":
      case "liquidoPeritonealDiagnosis":
      case "liquidoPleuralDiagnosis":
      case "tiroidesDiagnosis":
      case "marshTipo3CeliaquiaDiagnosis":
      case "metaplasiaIntestinalDiagnosis":
      case "moluscoContagiosoDiagnosis":
      case "paafDeMamaDiagnosis":
      case "placentaEnvejecimientoPlacentarioDiagnosis":
        return (
          <BiopsiaDiagnosisComponent
            paciente={paciente}
            visita={visita as BiopsiaVisita}
          />
        );
      default:
        return null; // Manejo de caso por defecto si el tipo de visita no coincide con ninguno de los casos anteriores
    }
  })();

  return <Document>{pdfComponent}</Document>;
};

export default DocumentoPDF;
