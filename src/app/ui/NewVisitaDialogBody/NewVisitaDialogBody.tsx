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
  visita?: Visitas;
};

function NewVisitaDialogBody({
  onSubmitHandler,
  paciente,
  visita,
}: NewVisitaDialogBody) {
  const { register, watch, handleSubmit, reset } = useForm<Visitas>({
    defaultValues: visita || defaultValues,
  });
  const router = useRouter();
  const type = watch("type");
  const status = watch("status");

  const { removeQueryParams } = useRemoveQueryParam();
  // Save only (no download)
  const onSaveOnly: SubmitHandler<Visitas> = (data) => {
    onSubmitHandler(data);
    removeQueryParams();
    router.refresh();
  };

  // Save and download
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
      className="bg-card text-card-foreground shadow-sm w-full max-w-[90%] mx-auto flex flex-col"
      data-v0-t="card"
    >
      <div className="p-4 space-y-2 grid grid-cols-3 gap-x-8">
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
              MÃ©dico Secundario
            </label>
            <input
              {...register("secondaryDoctor")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="secondaryDoctor"
              placeholder="Ingrese el nombre del mÃ©dico secundario"
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
              Tipo de DiagnÃ³stico
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
                DivertÃ­culo de Meckel
              </option>
              <option value="polipoColoEndometrioDiagnosis">
                PÃ³lipo Colo-Endometrio
              </option>
              <option value="polipoEndometrialCopiaDiagnosis">
                PÃ³lipo Endometrial Copia
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
                Condilomas MÃºltiples
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
                ApÃ©ndice Gangrenosa
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
                EstÃ³mago PÃ³lipo Recto
              </option>
              <option value="gastritisDiagnosis">Gastritis</option>
              <option value="hemoroidesDiagnosis">Hemoroides</option>
              <option value="hstBilateralMiomasDiagnosis">
                HST Bilateral Miomas
              </option>
              <option value="hstTotalMasAnexosPolipoEndometrioDiagnosis">
                Hst Total MÃ¡s Anexos PÃ³lipo Endometrio
              </option>
              <option value="infartoIntestinalDiagnosis">
                Infarto Intestinal
              </option>
              <option value="placentaHematomaRetroDiagnosis">
                Placenta Hematoma Retro
              </option>
              <option value="placentaHTADiagnosis">Placenta HTA</option>
              <option value="polipoEndometrioDiagnosis">
                PÃ³lipo Endometrio
              </option>
              <option value="polipoEstomagoYEstomagoDiagnosis">
                PÃ³lipo EstÃ³mago y EstÃ³mago
              </option>
              <option value="quisteDeInclusionEpidDiagnosis">
                Quiste de InclusiÃ³n Epidermica
              </option>
              <option value="tejidoNecroticoDiagnosis">Tejido NecrÃ³tico</option>
              <option value="ulceraGastricaDiagnosis">Ãšlcera GÃ¡strica</option>
              <option value="mamaFibroadenomaDiagnosis">
                Mama Fibroadenoma
              </option>
              <option value="partesBlandasDiagnosis">Partes Blandas</option>
              <option value="pielDiagnosis">Piel</option>
              <option value="pielNevusDiagnosis">Piel Nevus</option>
              <option value="placentaDiagnosis">Placenta</option>
              <option value="placentaAcretaDiagnosis">Placenta Acreta</option>
              <option value="polipoColonDiagnosis">PÃ³lipo de Colon</option>
              <option value="polipoEndocervicalDiagnosis">
                PÃ³lipo Endocervical
              </option>
              <option value="prolapsoDiagnosis">Prolapso</option>
              <option value="restosPlacentariosDiagnosis">
                Restos Placentarios
              </option>
              <option value="vaginaDiagnosis">Vagina</option>
              <option value="verrugaVulgarDeVulvaDiagnosis">
                Verruga Vulgar de Vulva
              </option>
              <option value="vesiculaDiagnosis">VesÃ­cula</option>
              <option value="endocervixYEndometrioDiagnosis">
                Endocervix y Endometrio
              </option>
              <option value="endometrioDiagnosis">Endometrio</option>
              <option value="endometrioDisgregadoDiagnosis">
                Endometrio Disgregado
              </option>
              <option value="estomagoYDuodenoDiagnosis">
                EstÃ³mago y Duodeno
              </option>
              <option value="extraccionDiuDiagnosis">ExtracciÃ³n DIU</option>
              <option value="fibromaBlandoDiagnosis">Fibroma Blando</option>
              <option value="granulomaDeVaginaDiagnosis">
                Granuloma de Vagina
              </option>
              <option value="histerectomiaSimpleDiagnosis">
                HisterectomÃ­a Simple
              </option>
              <option value="leiomiomaHipercelularDiagnosis">
                Leiomioma Hipercelular
              </option>
              <option value="liquidoPleuralDiagnosis">LÃ­quido Pleural</option>
              <option value="liquidoPeritonealDiagnosis">
                LÃ­quido Peritoneal
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
                  EvaluaciÃ³n:
                </label>
                <input
                  {...register(`${type}.evaluation`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="adecuacionEvaluacion"
                  placeholder="Ingrese la evaluaciÃ³n de adecuaciÃ³n del espÃ©cimen"
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
                  placeholder="Ingrese el aspecto de adecuaciÃ³n del espÃ©cimen"
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
                  placeholder="Ingrese el fondo de adecuaciÃ³n del espÃ©cimen"
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
                  Evaluacion de cÃ©lulas Pavimentosas:
                </label>
                <textarea
                  {...register(`${type}.celPav`)}
                  className="flex h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="papCelPav"
                  placeholder="Ingrese las cÃ©lulas pavimentosas"
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
                  placeholder="Ingrese la evoluciÃ³n hormonal"
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
                  placeholder="Ingrese las cÃ©lulas ciliadas"
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
                  placeholder="Ingrese el tÃ­tulo del diagnÃ³stico de Pap"
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
                  {...register(`${type}.notes`)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaNotas"
                  placeholder="Ingrese las notas del diagnÃ³stico de biopsia"
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
                  placeholder="Ingrese la clase del diagnÃ³stico de Pap"
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
                EvaluaciÃ³n de Cepillado:
              </label>
              <input
                {...register("cepilladoDiagnosis.evaluation")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="cepilladoEval"
                placeholder="Ingrese la evaluaciÃ³n de cepillado"
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
                className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                {...register(`${type}.notes`)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="biopsiaNotas"
                placeholder="Ingrese las notas del diagnÃ³stico de biopsia"
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
                  Evaluacion macroscÃ³pica:
                </label>
                <textarea
                  {...register(`${type}.macro`)}
                  className="flex h-52 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaMacro"
                  placeholder="Ingrese el macroscÃ³pico del diagnÃ³stico de biopsia"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaMicro"
                >
                  Evaluacion MicroscÃ³pica:
                </label>
                <textarea
                  {...register(`${type}.micro`)}
                  className="flex h-52 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaMicro"
                  placeholder="Ingrese el microscÃ³pico del diagnÃ³stico de biopsia"
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
                  placeholder="Ingrese el tÃ­tulo del diagnÃ³stico de biopsia"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="biopsiaDescription"
                >
                  DescripciÃ³n del DiagnÃ³stico:
                </label>
                <textarea
                  {...register(`${type}.description`)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaDescription"
                  placeholder="Ingrese la descripciÃ³n del diagnÃ³stico de biopsia"
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
                  {...register(`${type}.notes`)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="biopsiaNotas"
                  placeholder="Ingrese las notas del diagnÃ³stico de biopsia"
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
      {/* Sticky footer for action buttons */}
      <div className="sticky bottom-0 left-0 w-full bg-surface border-t border-border shadow-md flex gap-4 py-4 px-6 z-10 justify-center">
        <button
          type="button"
          className="px-4 py-2 bg-primary text-fg-inverse rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={handleSubmit(onSaveOnly)}
        >
          Guardar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-fg-inverse rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Guardar y descargar
        </button>
      </div>
    </form>
  );
}

export { NewVisitaDialogBody };
