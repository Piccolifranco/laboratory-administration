import React from "react";
import { Select } from "@headlessui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Paciente, Visitas } from "../../../../types/supabase";
import { pdf } from "@react-pdf/renderer";
import DocumentoPDF from "../DocumentoPDF";
import { defaultValues } from "./defaultValues";
import { useRemoveQueryParam } from "@/app/utils/removeQueryParams";
import { useRouter } from "next/navigation";
export type NewVisitaDialogBody = {
  onSubmitHandler: (data: Visitas) => void;
  paciente: Paciente;
};

function NewVisitaDialogBody({
  onSubmitHandler,
  paciente,
}: NewVisitaDialogBody) {
  const { register, watch, handleSubmit, reset } = useForm<Visitas>({
    defaultValues,
  });
  const router = useRouter();
  const type = watch("type");
  const status = watch("status");

  const { removeQueryParams } = useRemoveQueryParam();
  const onSubmit: SubmitHandler<Visitas> = async (data) => {
    onSubmitHandler(data);
    const blob = await pdf(
      <DocumentoPDF visita={data} paciente={paciente} />
    ).toBlob();
    const pdfURL = URL.createObjectURL(blob);
    window.open(pdfURL, "_blank");
    removeQueryParams();
    router.refresh();
  };

  const isPapDiagnosisBase = [
    "pap",
    "silDeBajoGradoDiagnosis",
    "silAltoGradoDiagnosis",
  ].includes(type);

  const isBiopsiaDiagnosisBase = [
    "biopsiaDiagnosis",
    "diverticuloMeckelDiagnosis",
    "polipoColoEndometrioDiagnosis",
    "polipoEndometrialCopiaDiagnosis",
    "quisteDeOvarioDiagnosis",
    "quistePilonidalDiagnosis",

    "adenocaColonMucinosoDiagnosis",
    "adenocaEndometrioDiagnosis",
    "condilomasMultiplesDiagnosis",

    "conoSilBajoGradoDiagnosis",
    "conoSilAltoGradoDiagnosis",
    "corangiosisPlacentariaDiagnosis",
    "lipomaDiagnosis",
    "queratiosisSeborreicaDiagnosis",
    "vulvaDiagnosis",
    "apendicitisGangrenosaDiagnosis",
    "basocelularDiagnosis",
    "colecistitisAgudaDiagnosis",
    "condilomaAcuminadoDiagnosis",
    "cuelloEndocervixDiagnosis",
    "cuelloVaginaDiagnosis",
    "estomagoPolipoRectoDiagnosis",
    "gastritisDiagnosis",
    "hemoroidesDiagnosis",
    "hstBilateralMiomasDiagnosis",
    "hstTotalMasAnexosPolipoEndometrioDiagnosis",
    "infartoIntestinalDiagnosis",
    "placentaHematomaRetroDiagnosis",
    "placentaHTADiagnosis",
    "polipoEndometrioDiagnosis",
    "polipoEstomagoYEstomagoDiagnosis",
    "quisteDeInclusionEpidDiagnosis",
    "tejidoNecroticoDiagnosis",
    "ulceraGastricaDiagnosis",
    "mamaFibroadenomaDiagnosis",
    "partesBlandasDiagnosis",
    "pielDiagnosis",
    "pielNevusDiagnosis",
    "placentaDiagnosis",
    "placentaAcretaDiagnosis",
    "polipoColonDiagnosis",
    "polipoEndocervicalDiagnosis",
    "prolapsoDiagnosis",
    "restosPlacentariosDiagnosis",
    "vaginaDiagnosis",
    "verrugaVulgarDeVulvaDiagnosis",
    "vesiculaDiagnosis",
    "endocervixYEndometrioDiagnosis",
    "endometrioDiagnosis",
    "endometrioDisgregadoDiagnosis",
    "estomagoYDuodenoDiagnosis",
    "extraccionDiuDiagnosis",
    "fibromaBlandoDiagnosis",
    "granulomaDeVaginaDiagnosis",
    "histerectomiaSimpleDiagnosis",
    "leiomiomaHipercelularDiagnosis",
    "liquidoPleuralDiagnosis",
    "liquidoPeritonealDiagnosis",
    "tiroidesDiagnosis",
    "marshTipo3CeliaquiaDiagnosis",
    "metaplasiaIntestinalDiagnosis",
    "moluscoContagiosoDiagnosis",
    "paafDeMamaDiagnosis",
    "placentaEnvejecimientoPlacentarioDiagnosis",
  ].includes(type);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" bg-card text-card-foreground shadow-sm w-full max-w-[90%] mx-auto"
      data-v0-t="card"
    >
      <div className="p-6 space-y-4 grid grid-cols-3 gap-x-20">
        <div className="flex flex-col gap-5 mt-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="date"
            >
              Fecha de Visita
            </label>
            <input
              {...register("date")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="date"
              placeholder="Ingrese la fecha de visita"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="secondaryDoctor"
            >
              Médico Secundario
            </label>
            <input
              {...register("secondaryDoctor")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="secondaryDoctor"
              placeholder="Ingrese el nombre del médico secundario"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="material"
            >
              Material
            </label>
            <input
              {...register("material")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="material"
              placeholder="Ingrese el material"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="colpo"
            >
              Colpo
            </label>
            <input
              {...register("colpo")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="colpo"
              placeholder="Ingrese el colpo"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="protocol"
            >
              Protocolo
            </label>
            <input
              {...register("protocol")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="protocol"
              placeholder="Ingrese el protocolo"
            />
          </div>

          <div className="space-y-2 flex-col flex">
            <label
              htmlFor="diagnosis"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tipo de Diagnóstico
            </label>
            <Select
              {...register("type")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              name="type"
              aria-label="Project status"
            >
              <option value="pap">Pap</option>
              <option value="silDeBajoGradoDiagnosis">SIL de Bajo Grado</option>
              <option value="silAltoGradoDiagnosis">SIL de Alto Grado</option>
              <option value="cepilladoDiagnosis">Cepillado</option>
              <option value="biopsiaDiagnosis">Biopsia</option>

              <option value="diverticuloMeckelDiagnosis">
                Divertículo de Meckel
              </option>
              <option value="polipoColoEndometrioDiagnosis">
                Pólipo Colo-Endometrio
              </option>
              <option value="polipoEndometrialCopiaDiagnosis">
                Pólipo Endometrial Copia
              </option>
              <option value="quisteDeOvarioDiagnosis">Quiste de Ovario</option>
              <option value="quistePilonidalDiagnosis">Quiste Pilonidal</option>
              <option value="adenocaColonMucinosoDiagnosis">
                Adenocarcinoma de Colon Mucinoso
              </option>
              <option value="adenocaEndometrioDiagnosis">
                Adenocarcinoma de Endometrio
              </option>
              <option value="condilomasMultiplesDiagnosis">
                Condilomas Múltiples
              </option>

              <option value="conoSilBajoGradoDiagnosis">
                Cono SIL de Bajo Grado
              </option>
              <option value="conoSilAltoGradoDiagnosis">
                Cono SIL de Alto Grado
              </option>
              <option value="corangiosisPlacentariaDiagnosis">
                Caroangiosis Placentaria
              </option>

              <option value="lipomaDiagnosis">El Dipoma</option>
              <option value="queratiosisSeborreicaDiagnosis">
                Queratiosis Seborreica
              </option>
              <option value="vulvaDiagnosis">Vulva</option>
              <option value="apendicitisGangrenosaDiagnosis">
                Apéndice Gangrenosa
              </option>
              <option value="basocelularDiagnosis">Basocelular</option>
              <option value="colecistitisAgudaDiagnosis">
                Colecistitis Aguda
              </option>
              <option value="condilomaAcuminadoDiagnosis">
                Condiloma Acuminado
              </option>
              <option value="cuelloEndocervixDiagnosis">
                Cuello Endocervix
              </option>
              <option value="cuelloVaginaDiagnosis">Cuello Vagina</option>
              <option value="estomagoPolipoRectoDiagnosis">
                Estómago Pólipo Recto
              </option>
              <option value="gastritisDiagnosis">Gastritis</option>
              <option value="hemoroidesDiagnosis">Hemoroides</option>
              <option value="hstBilateralMiomasDiagnosis">
                HST Bilateral Miomas
              </option>
              <option value="hstTotalMasAnexosPolipoEndometrioDiagnosis">
                Hst Total Más Anexos Pólipo Endometrio
              </option>
              <option value="infartoIntestinalDiagnosis">
                Infarto Intestinal
              </option>
              <option value="placentaHematomaRetroDiagnosis">
                Placenta Hematoma Retro
              </option>
              <option value="placentaHTADiagnosis">Placenta HTA</option>
              <option value="polipoEndometrioDiagnosis">
                Pólipo Endometrio
              </option>
              <option value="polipoEstomagoYEstomagoDiagnosis">
                Pólipo Estómago y Estómago
              </option>
              <option value="quisteDeInclusionEpidDiagnosis">
                Quiste de Inclusión Epidermica
              </option>
              <option value="tejidoNecroticoDiagnosis">Tejido Necrótico</option>
              <option value="ulceraGastricaDiagnosis">Úlcera Gástrica</option>
              <option value="mamaFibroadenomaDiagnosis">
                Mama Fibroadenoma
              </option>
              <option value="partesBlandasDiagnosis">Partes Blandas</option>
              <option value="pielDiagnosis">Piel</option>
              <option value="pielNevusDiagnosis">Piel Nevus</option>
              <option value="placentaDiagnosis">Placenta</option>
              <option value="placentaAcretaDiagnosis">Placenta Acreta</option>
              <option value="polipoColonDiagnosis">Pólipo de Colon</option>
              <option value="polipoEndocervicalDiagnosis">
                Pólipo Endocervical
              </option>
              <option value="prolapsoDiagnosis">Prolapso</option>
              <option value="restosPlacentariosDiagnosis">
                Restos Placentarios
              </option>
              <option value="vaginaDiagnosis">Vagina</option>
              <option value="verrugaVulgarDeVulvaDiagnosis">
                Verruga Vulgar de Vulva
              </option>
              <option value="vesiculaDiagnosis">Vesícula</option>
              <option value="endocervixYEndometrioDiagnosis">
                Endocervix y Endometrio
              </option>
              <option value="endometrioDiagnosis">Endometrio</option>
              <option value="endometrioDisgregadoDiagnosis">
                Endometrio Disgregado
              </option>
              <option value="estomagoYDuodenoDiagnosis">
                Estómago y Duodeno
              </option>
              <option value="extraccionDiuDiagnosis">Extracción DIU</option>
              <option value="fibromaBlandoDiagnosis">Fibroma Blando</option>
              <option value="granulomaDeVaginaDiagnosis">
                Granuloma de Vagina
              </option>
              <option value="histerectomiaSimpleDiagnosis">
                Histerectomía Simple
              </option>
              <option value="leiomiomaHipercelularDiagnosis">
                Leiomioma Hipercelular
              </option>
              <option value="liquidoPleuralDiagnosis">Líquido Pleural</option>
              <option value="liquidoPeritonealDiagnosis">
                Líquido Peritoneal
              </option>
              <option value="tiroidesDiagnosis">Tiroides</option>
              <option value="marshTipo3CeliaquiaDiagnosis">
                Mama Tipo 3aB
              </option>
              <option value="metaplasiaIntestinalDiagnosis">
                Metaplasia Intestinal
              </option>
              <option value="moluscoContagiosoDiagnosis">
                Molusco Contagioso
              </option>
              <option value="paafDeMamaDiagnosis">PAAF de Mama</option>
              <option value="placentaEnvejecimientoPlacentarioDiagnosis">
                Placenta Envejecimiento Placentario
              </option>
            </Select>
          </div>
        </div>
        {isPapDiagnosisBase &&
          !isBiopsiaDiagnosisBase &&
          type !== "cepilladoDiagnosis" && (
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="adecuacionEvaluacion"
                >
                  Evaluación:
                </label>
                <input
                  {...register(`${type}.evaluation`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="adecuacionEvaluacion"
                  placeholder="Ingrese la evaluación de adecuación del espécimen"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="adecuacionAspecto"
                >
                  Aspecto:
                </label>
                <input
                  {...register(`${type}.aspect`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="adecuacionAspecto"
                  placeholder="Ingrese el aspecto de adecuación del espécimen"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="adecuacionFondo"
                >
                  Fondo:
                </label>
                <input
                  {...register(`${type}.fondo`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="adecuacionFondo"
                  placeholder="Ingrese el fondo de adecuación del espécimen"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="papFlora"
                >
                  Flora
                </label>
                <input
                  {...register(`${type}.flora`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="papFlora"
                  placeholder="Ingrese la flora"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="papCelPav"
                >
                  Evaluacion de células Pavimentosas:
                </label>
                <textarea
                  {...register(`${type}.celPav`)}
                  className="flex h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="papCelPav"
                  placeholder="Ingrese las células pavimentosas"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="papEvHorm"
                >
                  Evaluacion Hormonal
                </label>
                <input
                  {...register(`${type}.evHorm`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="papEvHorm"
                  placeholder="Ingrese la evolución hormonal"
                />
              </div>
            </div>
          )}
        {isPapDiagnosisBase &&
          !isBiopsiaDiagnosisBase &&
          type !== "cepilladoDiagnosis" && (
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="papCelCil"
                >
                  Evaluacion de celulas cilindricas:
                </label>
                <input
                  {...register(`${type}.celCil`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="papCelCil"
                  placeholder="Ingrese las células ciliadas"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="papTitle"
                >
                  Diagnostico:
                </label>
                <textarea
                  {...register(`${type}.title`)}
                  className="flex h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="papTitle"
                  placeholder="Ingrese el título del diagnóstico de Pap"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaNotas"
                >
                  Notas:
                </label>
                <textarea
                  {...register("notes")}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaNotas"
                  placeholder="Ingrese las notas del diagnóstico de biopsia"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="papClass"
                >
                  Clase:
                </label>
                <input
                  {...register(`${type}.class`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="papClass"
                  placeholder="Ingrese la clase del diagnóstico de Pap"
                />
              </div>
              <div className="space-y-2 flex-col flex">
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Estado
                </label>
                <Select
                  {...register("status")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  name="status"
                  aria-label="Project status"
                >
                  <option value="paid">Pago</option>
                  <option value="pending">Pendiente</option>
                </Select>
              </div>
              {status === "pending" && (
                <div className="space-y-2 flex flex-col">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cantidad
                  </label>
                  <input
                    type="text"
                    {...register("amount")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ingrese un monto"
                  />
                </div>
              )}
            </div>
          )}

        {type === "cepilladoDiagnosis" && (
          <div className="flex flex-col gap-5">
            {/* Inputs for 'cepillado' type */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="evaluation"
              >
                Evaluación de Cepillado:
              </label>
              <input
                {...register("cepilladoDiagnosis.evaluation")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="cepilladoEval"
                placeholder="Ingrese la evaluación de cepillado"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="cepilladoAspect"
              >
                Aspecto:
              </label>
              <input
                {...register("cepilladoDiagnosis.aspect")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="cepilladoTitle"
                placeholder="Ingrese el aspecto del cepillado"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="cepilladoAspect"
              >
                Fondo:
              </label>
              <input
                {...register("cepilladoDiagnosis.fondo")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="cepilladoTitle"
                placeholder="Ingrese el fondo del cepillado"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="cepilladoAspect"
              >
                Descripcion:
              </label>
              <textarea
                {...register("cepilladoDiagnosis.description")}
                className="flex h-52 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="cepilladoTitle"
                placeholder="Ingrese la descripcion del cepillado"
              ></textarea>
            </div>

            {/* Other inputs for 'cepillado' type */}
            {/* ... */}
          </div>
        )}
        {type === "cepilladoDiagnosis" && (
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="cepilladoAspect"
              >
                Diagnostico:
              </label>
              <textarea
                {...register("cepilladoDiagnosis.title")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="cepilladoTitle"
                placeholder="Ingrese el diagnostico del cepillado"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="biopsiaNotas"
              >
                Notas:
              </label>
              <textarea
                {...register("notes")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="biopsiaNotas"
                placeholder="Ingrese las notas del diagnóstico de biopsia"
              ></textarea>
            </div>
            <div className="space-y-2 flex-col flex">
              <label
                htmlFor="status"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Estado
              </label>
              <Select
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                name="status"
                aria-label="Project status"
              >
                <option value="paid">Pago</option>
                <option value="pending">Pendiente</option>
              </Select>
            </div>
            {status === "pending" && (
              <div className="space-y-2 flex flex-col">
                <label
                  htmlFor="amount"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Cantidad
                </label>
                <input
                  type="text"
                  {...register("amount")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese un monto"
                />
              </div>
            )}
          </div>
        )}

        {isBiopsiaDiagnosisBase &&
          type !== "pap" &&
          type !== "silDeBajoGradoDiagnosis" &&
          type !== "silAltoGradoDiagnosis" &&
          type !== "cepilladoDiagnosis" && (
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaMacro"
                >
                  Evaluacion macroscópica:
                </label>
                <textarea
                  {...register(`${type}.macro`)}
                  className="flex h-52 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaMacro"
                  placeholder="Ingrese el macroscópico del diagnóstico de biopsia"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaMicro"
                >
                  Evaluacion Microscópica:
                </label>
                <textarea
                  {...register(`${type}.micro`)}
                  className="flex h-52 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaMicro"
                  placeholder="Ingrese el microscópico del diagnóstico de biopsia"
                ></textarea>
              </div>
            </div>
          )}
        {isBiopsiaDiagnosisBase &&
          type !== "pap" &&
          type !== "silDeBajoGradoDiagnosis" &&
          type !== "silAltoGradoDiagnosis" &&
          type !== "cepilladoDiagnosis" && (
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaTitle"
                >
                  Diagnostico:
                </label>
                <input
                  {...register(`${type}.title`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaTitle"
                  placeholder="Ingrese el título del diagnóstico de biopsia"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaDescription"
                >
                  Descripción del Diagnóstico:
                </label>
                <textarea
                  {...register(`${type}.description`)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaDescription"
                  placeholder="Ingrese la descripción del diagnóstico de biopsia"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaNotas"
                >
                  Notas:
                </label>
                <textarea
                  {...register("notes")}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaNotas"
                  placeholder="Ingrese las notas del diagnóstico de biopsia"
                ></textarea>
              </div>
              <div className="space-y-2 flex-col flex">
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Estado
                </label>
                <Select
                  {...register("status")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  name="status"
                  aria-label="Project status"
                >
                  <option value="paid">Pago</option>
                  <option value="pending">Pendiente</option>
                </Select>
              </div>
              {status === "pending" && (
                <div className="space-y-2 flex flex-col">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cantidad
                  </label>
                  <input
                    type="text"
                    {...register("amount")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ingrese un monto"
                  />
                </div>
              )}
            </div>
          )}
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        Guardar y descargar
      </button>
    </form>
  );
}

export { NewVisitaDialogBody };
