export interface PapDiagnosis {
  evaluation?: string;
  aspect?: string;
  fondo?: string;
  flora?: string;
  celPav?: string;
  evHorm?: string;
  celCil?: string;
  title?: string;
  class?: string;
  notes?: string;
}

export interface BiopsiaDiagnosisBase {
  macro?: string;
  micro?: string;
  title?: string;
  description?: string;
  notes?: string;
}

export interface CepilladoDiagnosis {
  evaluation?: string;
  aspect?: string;
  fondo?: string;
  description?: string;
  title?: string;
  notes?: string;
}

export type Visitas = {
  date: Date;
  id: string;
  secondaryDoctor: string;
  material: string;
  colpo: string;
  protocol: string;
  notes?: string;

  type:
    | "cepilladoDiagnosis"
    | "pap"
    | "biopsiaDiagnosis"
    | "diverticuloMeckelDiagnosis"
    | "polipoColonAdenomatosoDiagnosis"
    | "polipoEndometrialCopiaDiagnosis"
    | "quisteDeOvarioDiagnosis"
    | "quistePilonidalDiagnosis"
    | "adenocaColonMucinosoDiagnosis"
    | "adenocaEndometrioDiagnosis"
    | "condilomasMultiplesDiagnosis"
    | "silAltoGradoDiagnosis"
    | "conoSilBajoGradoDiagnosis"
    | "conoSilAltoGradoDiagnosis"
    | "corangiosisPlacentariaDiagnosis"
    | "silDeBajoGradoDiagnosis"
    | "lipomaDiagnosis"
    | "queratiosisSeborreicaDiagnosis"
    | "vulvaDiagnosis"
    | "apendicitisGangrenosaDiagnosis"
    | "basocelularDiagnosis"
    | "colecistitisAgudaDiagnosis"
    | "condilomaAcuminadoDiagnosis"
    | "cuelloEndocervixDiagnosis"
    | "cuelloVaginaDiagnosis"
    | "estomagoPolipoRectoDiagnosis"
    | "gastritisDiagnosis"
    | "hemoroidesDiagnosis"
    | "hstBilateralMiomasDiagnosis"
    | "hstTotalMasAnexosPolipoEndometrioDiagnosis"
    | "infartoIntestinalDiagnosis"
    | "placentaHematomaRetroDiagnosis"
    | "placentaHTADiagnosis"
    | "polipoEndometrioDiagnosis"
    | "polipoEstomagoYEstomagoDiagnosis"
    | "quisteDeInclusionEpidDiagnosis"
    | "tejidoNecroticoDiagnosis"
    | "ulceraGastricaDiagnosis"
    | "lipomaDiagnosis"
    | "mamaFibroadenomaDiagnosis"
    | "partesBlandasDiagnosis"
    | "pielDiagnosis"
    | "pielNevusDiagnosis"
    | "placentaDiagnosis"
    | "placentaAcretaDiagnosis"
    | "polipoColonDiagnosis"
    | "polipoEndocervicalDiagnosis"
    | "prolapsoDiagnosis"
    | "restosPlacentariosDiagnosis"
    | "vaginaDiagnosis"
    | "verrugaVulgarDeVulvaDiagnosis"
    | "vesiculaDiagnosis"
    | "endocervixYEndometrioDiagnosis"
    | "endometrioDiagnosis"
    | "endometrioDisgregadoDiagnosis"
    | "estomagoYDuodenoDiagnosis"
    | "extraccionDiuDiagnosis"
    | "fibromaBlandoDiagnosis"
    | "granulomaDeVaginaDiagnosis"
    | "histerectomiaSimpleDiagnosis"
    | "leiomiomaHipercelularDiagnosis"
    | "liquidoPeritonealDiagnosis"
    | "liquidoPleuralDiagnosis"
    | "tiroidesDiagnosis"
    | "marshTipo3CeliaquiaDiagnosis"
    | "metaplasiaIntestinalDiagnosis"
    | "moluscoContagiosoDiagnosis"
    | "paafDeMamaDiagnosis"
    | "placentaEnvejecimientoPlacentarioDiagnosis";

  status: "paid" | "pending";
  amount: number;
  pap: PapDiagnosis;
  cepilladoDiagnosis: CepilladoDiagnosis;
  biopsiaDiagnosis: BiopsiaDiagnosisBase;
  diverticuloMeckelDiagnosis: BiopsiaDiagnosisBase;
  polipoColonAdenomatosoDiagnosis: BiopsiaDiagnosisBase;
  polipoEndometrialCopiaDiagnosis: BiopsiaDiagnosisBase;
  quisteDeOvarioDiagnosis: BiopsiaDiagnosisBase;
  quistePilonidalDiagnosis: BiopsiaDiagnosisBase;
  silDeBajoGradoDiagnosis: PapDiagnosis;
  adenocaColonMucinosoDiagnosis: BiopsiaDiagnosisBase;
  adenocaEndometrioDiagnosis: BiopsiaDiagnosisBase;
  condilomasMultiplesDiagnosis: BiopsiaDiagnosisBase;
  silAltoGradoDiagnosis: PapDiagnosis;
  conoSilBajoGradoDiagnosis: BiopsiaDiagnosisBase;
  conoSilAltoGradoDiagnosis: BiopsiaDiagnosisBase;
  corangiosisPlacentariaDiagnosis: BiopsiaDiagnosisBase;
  queratiosisSeborreicaDiagnosis: BiopsiaDiagnosisBase;
  vulvaDiagnosis: BiopsiaDiagnosisBase;
  apendicitisGangrenosaDiagnosis: BiopsiaDiagnosisBase;
  basocelularDiagnosis: BiopsiaDiagnosisBase;
  colecistitisAgudaDiagnosis: BiopsiaDiagnosisBase;
  condilomaAcuminadoDiagnosis: BiopsiaDiagnosisBase;
  cuelloEndocervixDiagnosis: BiopsiaDiagnosisBase;
  cuelloVaginaDiagnosis: BiopsiaDiagnosisBase;
  estomagoPolipoRectoDiagnosis: BiopsiaDiagnosisBase;
  gastritisDiagnosis: BiopsiaDiagnosisBase;
  hemoroidesDiagnosis: BiopsiaDiagnosisBase;
  hstBilateralMiomasDiagnosis: BiopsiaDiagnosisBase;
  hstTotalMasAnexosPolipoEndometrioDiagnosis: BiopsiaDiagnosisBase;
  infartoIntestinalDiagnosis: BiopsiaDiagnosisBase;
  placentaHematomaRetroDiagnosis: BiopsiaDiagnosisBase;
  placentaHTADiagnosis: BiopsiaDiagnosisBase;
  polipoEndometrioDiagnosis: BiopsiaDiagnosisBase;
  polipoEstomagoYEstomagoDiagnosis: BiopsiaDiagnosisBase;
  quisteDeInclusionEpidDiagnosis: BiopsiaDiagnosisBase;
  tejidoNecroticoDiagnosis: BiopsiaDiagnosisBase;
  ulceraGastricaDiagnosis: BiopsiaDiagnosisBase;
  lipomaDiagnosis: BiopsiaDiagnosisBase;
  mamaFibroadenomaDiagnosis: BiopsiaDiagnosisBase;
  partesBlandasDiagnosis: BiopsiaDiagnosisBase;
  pielDiagnosis: BiopsiaDiagnosisBase;
  pielNevusDiagnosis: BiopsiaDiagnosisBase;
  placentaDiagnosis: BiopsiaDiagnosisBase;
  placentaAcretaDiagnosis: BiopsiaDiagnosisBase;
  polipoColonDiagnosis: BiopsiaDiagnosisBase;
  polipoEndocervicalDiagnosis: BiopsiaDiagnosisBase;
  prolapsoDiagnosis: BiopsiaDiagnosisBase;
  restosPlacentariosDiagnosis: BiopsiaDiagnosisBase;
  vaginaDiagnosis: BiopsiaDiagnosisBase;
  verrugaVulgarDeVulvaDiagnosis: BiopsiaDiagnosisBase;
  vesiculaDiagnosis: BiopsiaDiagnosisBase;
  endocervixYEndometrioDiagnosis: BiopsiaDiagnosisBase;
  endometrioDiagnosis: BiopsiaDiagnosisBase;
  endometrioDisgregadoDiagnosis: BiopsiaDiagnosisBase;
  estomagoYDuodenoDiagnosis: BiopsiaDiagnosisBase;
  extraccionDiuDiagnosis: BiopsiaDiagnosisBase;
  fibromaBlandoDiagnosis: BiopsiaDiagnosisBase;
  granulomaDeVaginaDiagnosis: BiopsiaDiagnosisBase;
  histerectomiaSimpleDiagnosis: BiopsiaDiagnosisBase;
  leiomiomaHipercelularDiagnosis: BiopsiaDiagnosisBase;
  liquidoPeritonealDiagnosis: BiopsiaDiagnosisBase;
  liquidoPleuralDiagnosis: BiopsiaDiagnosisBase;
  tiroidesDiagnosis: BiopsiaDiagnosisBase;
  marshTipo3CeliaquiaDiagnosis: BiopsiaDiagnosisBase;
  metaplasiaIntestinalDiagnosis: BiopsiaDiagnosisBase;
  moluscoContagiosoDiagnosis: BiopsiaDiagnosisBase;
  paafDeMamaDiagnosis: BiopsiaDiagnosisBase;
  placentaEnvejecimientoPlacentarioDiagnosis: BiopsiaDiagnosisBase;
};

export type Paciente = {
  age?: number | null;
  createdAt: string;
  dni?: number | null;
  doctor: string;
  firstName: string | null;
  id: number;
  lastName: string | null;
  obraSocial: string | null;
  visitas?: Visitas[] | null;
};

export type PapVisita = {
  type: "pap" | "silDeBajoGradoDiagnosis" | "silAltoGradoDiagnosis";
} & Omit<Visitas, "type">;

export type BiopsiaVisita = {
  type:
    | "biopsiaDiagnosis"
    | "diverticuloMeckelDiagnosis"
    | "polipoColonAdenomatosoDiagnosis"
    | "polipoEndometrialCopiaDiagnosis"
    | "quisteDeOvarioDiagnosis"
    | "quistePilonidalDiagnosis"
    | "adenocaColonMucinosoDiagnosis"
    | "adenocaEndometrioDiagnosis"
    | "condilomasMultiplesDiagnosis"
    | "conoSilBajoGradoDiagnosis"
    | "conoSilAltoGradoDiagnosis"
    | "corangiosisPlacentariaDiagnosis"
    | "lipomaDiagnosis"
    | "queratiosisSeborreicaDiagnosis"
    | "vulvaDiagnosis"
    | "apendicitisGangrenosaDiagnosis"
    | "basocelularDiagnosis"
    | "colecistitisAgudaDiagnosis"
    | "condilomaAcuminadoDiagnosis"
    | "cuelloEndocervixDiagnosis"
    | "cuelloVaginaDiagnosis"
    | "estomagoPolipoRectoDiagnosis"
    | "gastritisDiagnosis"
    | "hemoroidesDiagnosis"
    | "hstBilateralMiomasDiagnosis"
    | "hstTotalMasAnexosPolipoEndometrioDiagnosis"
    | "infartoIntestinalDiagnosis"
    | "placentaHematomaRetroDiagnosis"
    | "placentaHTADiagnosis"
    | "polipoEndometrioDiagnosis"
    | "polipoEstomagoYEstomagoDiagnosis"
    | "quisteDeInclusionEpidDiagnosis"
    | "tejidoNecroticoDiagnosis"
    | "ulceraGastricaDiagnosis"
    | "mamaFibroadenomaDiagnosis"
    | "partesBlandasDiagnosis"
    | "pielDiagnosis"
    | "pielNevusDiagnosis"
    | "placentaDiagnosis"
    | "placentaAcretaDiagnosis"
    | "polipoColonDiagnosis"
    | "polipoEndocervicalDiagnosis"
    | "prolapsoDiagnosis"
    | "restosPlacentariosDiagnosis"
    | "vaginaDiagnosis"
    | "verrugaVulgarDeVulvaDiagnosis"
    | "vesiculaDiagnosis"
    | "endocervixYEndometrioDiagnosis"
    | "endometrioDiagnosis"
    | "endometrioDisgregadoDiagnosis"
    | "estomagoYDuodenoDiagnosis"
    | "extraccionDiuDiagnosis"
    | "fibromaBlandoDiagnosis"
    | "granulomaDeVaginaDiagnosis"
    | "histerectomiaSimpleDiagnosis"
    | "leiomiomaHipercelularDiagnosis"
    | "liquidoPeritonealDiagnosis"
    | "liquidoPleuralDiagnosis"
    | "tiroidesDiagnosis"
    | "marshTipo3CeliaquiaDiagnosis"
    | "metaplasiaIntestinalDiagnosis"
    | "moluscoContagiosoDiagnosis"
    | "paafDeMamaDiagnosis"
    | "placentaEnvejecimientoPlacentarioDiagnosis";
} & Omit<Visitas, "type">;

export type Database = {
  public: {
    Tables: {
      pacientes: {
        Row: Paciente;
        Insert: {
          age?: number | null;
          createdAt?: string;
          dni?: number | null;
          firstName?: string | null;
          id?: number;
          lastName?: string | null;
          obraSocial?: string | null;
          visitas?: Visitas[] | null;
        };
        Update: {
          age?: number | null;
          createdAt?: string;
          dni?: number | null;
          firstName?: string | null;
          id?: number;
          lastName?: string | null;
          obraSocial?: string | null;
          visitas?: Visitas[] | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
